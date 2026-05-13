from django.urls import path
from accounts.views import DirectionLoginView, MeView, DoctorsListView
from patients.views import PatientListCreateView, PatientDetailView
from consultations.views import ConsultationListCreateView, ConsultationDetailView, PatientConsultationsView
from dashboard.views import DirectionStatsView

urlpatterns = [
    path('login/', DirectionLoginView.as_view(), name='direction-login'),
    path('me/', MeView.as_view(), name='direction-me'),
    path('doctors/', DoctorsListView.as_view(), name='direction-doctors'),

    # Tous les patients (visible uniquement depuis l'espace Direction)
    path('patients/', PatientListCreateView.as_view(), name='direction-patients'),
    path('patients/<str:dmp_id>/', PatientDetailView.as_view(), name='direction-patient-detail'),

    # Toutes les consultations
    path('consultations/', ConsultationListCreateView.as_view(), name='direction-consultations'),
    path('consultations/<int:pk>/', ConsultationDetailView.as_view(), name='direction-consultation-detail'),
    path('consultations/patient/<str:dmp_id>/', PatientConsultationsView.as_view(), name='direction-patient-consultations'),

    # Statistiques globales (dashboard direction)
    path('stats/', DirectionStatsView.as_view(), name='direction-stats'),
]
