from django.urls import path
from accounts.views import MedecinLoginView, MeView, DoctorsListView
from patients.views import PatientListCreateView, PatientDetailView, VerifyPatientCodeView
from consultations.views import ConsultationListCreateView, ConsultationDetailView, PatientConsultationsView

urlpatterns = [
    path('login/', MedecinLoginView.as_view(), name='medecin-login'),
    path('me/', MeView.as_view(), name='medecin-me'),
    path('doctors/', DoctorsListView.as_view(), name='medecin-doctors'),

    # Patients du médecin uniquement (filtrés côté vue)
    path('patients/', PatientListCreateView.as_view(), name='medecin-patients'),
    path('patients/<str:dmp_id>/', PatientDetailView.as_view(), name='medecin-patient-detail'),
    path('patients/<str:dmp_id>/verify-code/', VerifyPatientCodeView.as_view(), name='medecin-verify-code'),

    # Consultations du médecin uniquement (filtrées côté vue)
    path('consultations/', ConsultationListCreateView.as_view(), name='medecin-consultations'),
    path('consultations/<int:pk>/', ConsultationDetailView.as_view(), name='medecin-consultation-detail'),
    path('consultations/patient/<str:dmp_id>/', PatientConsultationsView.as_view(), name='medecin-patient-consultations'),
]
