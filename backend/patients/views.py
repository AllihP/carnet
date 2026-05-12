from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Patient, Vaccine, Allergy
from .serializers import (
    PatientListSerializer, PatientDetailSerializer,
    PatientCreateSerializer, VaccineSerializer, AllergySerializer,
)
from accounts.authentication import generate_patient_token
from accounts.permissions import IsDoctor, IsStaff, IsPatient


class PatientLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        dmp_id = request.data.get('dmp_id', '').strip()
        code = request.data.get('code', '').strip()
        if not dmp_id or not code:
            return Response({'error': 'DMP et code requis.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            patient = Patient.objects.get(dmp_id=dmp_id, code=code)
        except Patient.DoesNotExist:
            return Response({'error': 'Identifiant DMP ou code incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)
        token = generate_patient_token(patient)
        return Response({
            'token': token,
            'patient': PatientDetailSerializer(patient).data,
            'first_login': patient.first_login,
        })


class PatientChangeCodeView(APIView):
    permission_classes = [IsAuthenticated, IsPatient]

    def post(self, request):
        new_code = request.data.get('new_code', '').strip()
        confirm = request.data.get('confirm_code', '').strip()
        if not new_code or len(new_code) < 4:
            return Response({'error': 'Le code doit avoir au moins 4 caractères.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_code != confirm:
            return Response({'error': 'Les codes ne correspondent pas.'}, status=status.HTTP_400_BAD_REQUEST)
        patient = request.user
        db_patient = Patient.objects.get(id=patient.id)
        db_patient.code = new_code
        db_patient.first_login = False
        db_patient.save()
        token = generate_patient_token(db_patient)
        return Response({'token': token, 'message': 'Code modifié avec succès.'})


class PatientListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated(), IsStaff()]

    def get(self, request):
        if request.user.role == 'medecin':
            patients = Patient.objects.filter(doctor=request.user).order_by('-created_at')
        else:
            patients = Patient.objects.all().order_by('-created_at')
        return Response(PatientListSerializer(patients, many=True).data)

    def post(self, request):
        serializer = PatientCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            patient = serializer.save()
            return Response(PatientDetailSerializer(patient).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get_patient(self, dmp_id):
        try:
            return Patient.objects.get(dmp_id=dmp_id)
        except Patient.DoesNotExist:
            return None

    def get(self, request, dmp_id):
        patient = self.get_patient(dmp_id)
        if not patient:
            return Response({'error': 'Patient introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PatientDetailSerializer(patient).data)

    def patch(self, request, dmp_id):
        patient = self.get_patient(dmp_id)
        if not patient:
            return Response({'error': 'Patient introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        for field in ['ant_chr', 'ant_chir', 'ant_gyn', 'ant_hab', 'ant_pere', 'ant_mere', 'ant_fra',
                      'next_rdv', 'next_motif', 'next_urg', 'addr', 'tel', 'job', 'urg']:
            if field in request.data:
                setattr(patient, field, request.data[field])
        patient.save()

        # Update vaccines
        if 'vaccines' in request.data:
            patient.vaccines.all().delete()
            for v in request.data['vaccines']:
                Vaccine.objects.create(
                    patient=patient,
                    name=v.get('name', ''),
                    date=v.get('date') or None,
                    next_date=v.get('next_date', ''),
                    status=v.get('status', 'À jour'),
                )

        # Update allergies
        if 'allergies' in request.data:
            patient.allergies.all().delete()
            for a in request.data['allergies']:
                Allergy.objects.create(
                    patient=patient,
                    name=a.get('name', ''),
                    allergy_type=a.get('allergy_type', 'Médicament'),
                    reaction=a.get('reaction', ''),
                    severity=a.get('severity', 'Légère'),
                )

        return Response(PatientDetailSerializer(patient).data)


class VerifyPatientCodeView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def post(self, request, dmp_id):
        code = request.data.get('code', '').strip()
        try:
            patient = Patient.objects.get(dmp_id=dmp_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if patient.code != code:
            return Response({'error': 'Code incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'success': True,
            'patient': PatientDetailSerializer(patient).data,
        })


class PatientMeView(APIView):
    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request):
        from consultations.serializers import ConsultationSerializer
        patient = Patient.objects.prefetch_related('vaccines', 'allergies', 'consultations').get(id=request.user.id)
        data = PatientDetailSerializer(patient).data
        data['consultations'] = ConsultationSerializer(
            patient.consultations.order_by('-date'), many=True
        ).data
        return Response(data)
