from rest_framework import serializers
from .models import Patient, Vaccine, Allergy


class VaccineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccine
        fields = ['id', 'name', 'date', 'next_date', 'status']


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'name', 'allergy_type', 'reaction', 'severity']


class PatientListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    last_consult = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    total_consultations = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'dmp_id', 'prenom', 'nom', 'dob', 'age', 'sexe', 'blood',
            'color', 'first_login', 'temp_code', 'created_at',
            'last_consult', 'doctor_name', 'total_consultations',
        ]

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.dob.year - ((today.month, today.day) < (obj.dob.month, obj.dob.day))

    def get_last_consult(self, obj):
        last = obj.consultations.order_by('-date').first()
        return last.date.strftime('%d/%m/%Y') if last else None

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"Dr. {obj.doctor.get_full_name()}"
        return None

    def get_total_consultations(self, obj):
        return obj.consultations.count()


class PatientDetailSerializer(serializers.ModelSerializer):
    vaccines = VaccineSerializer(many=True, read_only=True)
    allergies = AllergySerializer(many=True, read_only=True)
    age = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'dmp_id', 'prenom', 'nom', 'dob', 'age', 'sexe', 'blood',
            'addr', 'tel', 'job', 'urg', 'color', 'first_login', 'temp_code',
            'created_at', 'doctor_name',
            'ant_chr', 'ant_chir', 'ant_gyn', 'ant_hab',
            'ant_pere', 'ant_mere', 'ant_fra',
            'next_rdv', 'next_motif', 'next_urg',
            'vaccines', 'allergies',
        ]

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.dob.year - ((today.month, today.day) < (obj.dob.month, obj.dob.day))

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"Dr. {obj.doctor.get_full_name()}"
        return None


class PatientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'prenom', 'nom', 'dob', 'sexe', 'blood',
            'addr', 'tel', 'job', 'urg',
        ]

    def create(self, validated_data):
        import random
        prenom = validated_data['prenom']
        nom = validated_data['nom']
        num = str(random.randint(100000, 999999))
        dmp_id = f"{prenom[0].upper()}{nom[0].upper()}-{num}"
        colors = ['#0E7A5F', '#185FA5', '#6D3088', '#C0392B', '#8B5E15', '#2E7D32']
        color = colors[Patient.objects.count() % len(colors)]
        patient = Patient.objects.create(
            dmp_id=dmp_id,
            color=color,
            doctor=self.context['request'].user,
            **validated_data,
        )
        return patient
