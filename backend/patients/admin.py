from django.contrib import admin
from .models import Patient, Vaccine, Allergy


class VaccineInline(admin.TabularInline):
    model = Vaccine
    extra = 0


class AllergyInline(admin.TabularInline):
    model = Allergy
    extra = 0


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['dmp_id', 'prenom', 'nom', 'dob', 'sexe', 'blood', 'first_login', 'doctor', 'created_at']
    list_filter = ['sexe', 'blood', 'first_login']
    search_fields = ['dmp_id', 'prenom', 'nom']
    inlines = [VaccineInline, AllergyInline]
    readonly_fields = ['dmp_id', 'temp_code', 'created_at']
