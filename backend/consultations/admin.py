from django.contrib import admin
from .models import Consultation


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['date', 'patient', 'doctor', 'consult_type', 'diag_main', 'created_at']
    list_filter = ['consult_type', 'diag_severity', 'date']
    search_fields = ['patient__prenom', 'patient__nom', 'diag_main', 'motif']
    readonly_fields = ['created_at']
