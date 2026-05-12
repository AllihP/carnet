from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Consultation
from .serializers import ConsultationSerializer, ConsultationCreateSerializer
from patients.models import Patient, Vaccine, Allergy
from accounts.permissions import IsDoctor, IsStaff


class ConsultationListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated(), IsStaff()]

    def get(self, request):
        if request.user.role == 'medecin':
            qs = Consultation.objects.filter(doctor=request.user).select_related('patient', 'doctor')
        else:
            qs = Consultation.objects.all().select_related('patient', 'doctor')
        return Response(ConsultationSerializer(qs, many=True).data)

    def post(self, request):
        dmp_id = request.data.get('patient_dmp')
        try:
            patient = Patient.objects.get(dmp_id=dmp_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ConsultationCreateSerializer(data=request.data)
        if serializer.is_valid():
            consult = serializer.save(patient=patient, doctor=request.user)

            # Update patient antecedents from consult data
            antecedents = request.data.get('antecedents', {})
            if antecedents:
                for field in ['ant_chr', 'ant_chir', 'ant_gyn', 'ant_hab', 'ant_pere', 'ant_mere', 'ant_fra']:
                    val = antecedents.get(field)
                    if val is not None:
                        setattr(patient, field, val)

            # Update patient vaccines
            vaccines = request.data.get('vaccines', [])
            if vaccines:
                patient.vaccines.all().delete()
                for v in vaccines:
                    if v.get('name'):
                        Vaccine.objects.create(
                            patient=patient,
                            name=v['name'],
                            date=v.get('date') or None,
                            next_date=v.get('next_date', ''),
                            status=v.get('status', 'À jour'),
                        )

            # Update patient allergies
            allergies = request.data.get('allergies', [])
            if allergies:
                patient.allergies.all().delete()
                for a in allergies:
                    if a.get('name'):
                        Allergy.objects.create(
                            patient=patient,
                            name=a['name'],
                            allergy_type=a.get('allergy_type', 'Médicament'),
                            reaction=a.get('reaction', ''),
                            severity=a.get('severity', 'Légère'),
                        )

            # Update next RDV on patient
            if consult.next_rdv:
                patient.next_rdv = consult.next_rdv
                patient.next_motif = consult.next_motif
                patient.next_urg = consult.next_urg

            patient.save()
            return Response(ConsultationSerializer(consult).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientConsultationsView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request, dmp_id):
        try:
            patient = Patient.objects.get(dmp_id=dmp_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        qs = patient.consultations.all()
        return Response(ConsultationSerializer(qs, many=True).data)


class ConsultationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request, pk):
        try:
            c = Consultation.objects.get(pk=pk)
        except Consultation.DoesNotExist:
            return Response({'error': 'Consultation introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ConsultationSerializer(c).data)
