from rest_framework import serializers
from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    patient_dmp = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = [
            'id', 'date', 'consult_type', 'motif', 'symptoms', 'obs_symp', 'duration_symp',
            'vitals',
            'exam_cv', 'exam_resp', 'exam_abdo', 'exam_neuro', 'exam_orl', 'exam_gen',
            'diag_main', 'diag_cim', 'diag_severity', 'diag_d1', 'diag_d2', 'diag_conclusion',
            'prescriptions', 'rx_notes',
            'exams_requested', 'results',
            'obs_notes', 'next_rdv', 'next_motif', 'next_urg',
            'arret_travail', 'refer_spec', 'refer_motif',
            'doctor_name', 'patient_name', 'patient_dmp', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'doctor_name', 'patient_name', 'patient_dmp']

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.get_full_name()}" if obj.doctor else '—'

    def get_patient_name(self, obj):
        return f"{obj.patient.prenom} {obj.patient.nom}"

    def get_patient_dmp(self, obj):
        return obj.patient.dmp_id


class ConsultationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = [
            'date', 'consult_type', 'motif', 'symptoms', 'obs_symp', 'duration_symp',
            'vitals',
            'exam_cv', 'exam_resp', 'exam_abdo', 'exam_neuro', 'exam_orl', 'exam_gen',
            'diag_main', 'diag_cim', 'diag_severity', 'diag_d1', 'diag_d2', 'diag_conclusion',
            'prescriptions', 'rx_notes',
            'exams_requested', 'results',
            'obs_notes', 'next_rdv', 'next_motif', 'next_urg',
            'arret_travail', 'refer_spec', 'refer_motif',
        ]
