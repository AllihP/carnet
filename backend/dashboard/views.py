from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from accounts.permissions import IsDirection, IsStaff
from patients.models import Patient
from consultations.models import Consultation
from accounts.models import CustomUser
from datetime import date, timedelta
from collections import Counter


class DirectionStatsView(APIView):
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        # Totaux
        total_patients = Patient.objects.count()
        total_consultations = Consultation.objects.count()
        female_count = Patient.objects.filter(sexe='F').count()
        male_count = Patient.objects.filter(sexe='M').count()

        # Consultations prénatales (femmes enceintes)
        prenatal_patients = Consultation.objects.filter(
            consult_type='Consultation prénatale'
        ).values('patient').distinct().count()

        # Urgences
        urgence_count = Consultation.objects.filter(consult_type='Urgence').count()

        # Premières connexions en attente
        first_login_pending = Patient.objects.filter(first_login=True).count()

        # Consultations par médecin
        doctors_stats = []
        for doc in CustomUser.objects.filter(role='medecin'):
            consult_count = Consultation.objects.filter(doctor=doc).count()
            patient_count = Patient.objects.filter(doctor=doc).count()
            doctors_stats.append({
                'id': doc.id,
                'name': f"Dr. {doc.get_full_name()}",
                'specialite': doc.specialite,
                'telephone': doc.telephone,
                'consultations': consult_count,
                'patients': patient_count,
            })

        # Consultations par mois (12 derniers mois)
        today = date.today()
        months_data = []
        for i in range(11, -1, -1):
            d = today.replace(day=1) - timedelta(days=i * 30)
            count = Consultation.objects.filter(
                date__year=d.year, date__month=d.month
            ).count()
            months_data.append({
                'month': d.strftime('%b %Y'),
                'count': count,
                'year': d.year,
                'month_num': d.month,
            })

        # Top 10 diagnostics
        diag_counter = Counter(
            c.diag_main for c in Consultation.objects.exclude(diag_main='')
        )
        top_diagnoses = [{'name': k, 'count': v} for k, v in diag_counter.most_common(10)]

        # Top 10 médicaments
        rx_counter = Counter()
        for c in Consultation.objects.all():
            for rx in c.prescriptions:
                if rx.get('med'):
                    rx_counter[rx['med']] += 1
        top_medications = [{'name': k, 'count': v} for k, v in rx_counter.most_common(10)]

        # Types de consultation
        type_counts = list(
            Consultation.objects.values('consult_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Liste détaillée des consultations récentes (pour vue direction)
        recent_consultations = []
        for c in Consultation.objects.select_related('patient', 'doctor').order_by('-date', '-created_at')[:100]:
            recent_consultations.append({
                'id': c.id,
                'date': c.date.strftime('%d/%m/%Y'),
                'patient': f"{c.patient.prenom} {c.patient.nom}",
                'dmp_id': c.patient.dmp_id,
                'patient_color': c.patient.color,
                'doctor': f"Dr. {c.doctor.get_full_name()}" if c.doctor else '—',
                'type': c.consult_type,
                'diagnostic': c.diag_main or '—',
                'severity': c.diag_severity or '—',
            })

        # Répartition par groupe sanguin
        blood_groups = list(
            Patient.objects.values('blood').annotate(count=Count('id')).order_by('-count')
        )

        # Nouvelles maladies transmissibles (mots-clés dans diagnostic)
        keywords_transmissible = ['paludisme', 'tuberculose', 'VIH', 'choléra', 'méningite', 'hépatite', 'typhoïde', 'grippe']
        transmissible_count = 0
        for kw in keywords_transmissible:
            transmissible_count += Consultation.objects.filter(diag_main__icontains=kw).values('patient').distinct().count()

        return Response({
            'total_patients': total_patients,
            'total_consultations': total_consultations,
            'female_count': female_count,
            'male_count': male_count,
            'prenatal_patients': prenatal_patients,
            'urgence_count': urgence_count,
            'first_login_pending': first_login_pending,
            'transmissible_count': transmissible_count,
            'doctors_stats': doctors_stats,
            'months_data': months_data,
            'top_diagnoses': top_diagnoses,
            'top_medications': top_medications,
            'type_counts': type_counts,
            'recent_consultations': recent_consultations,
            'blood_groups': blood_groups,
        })
