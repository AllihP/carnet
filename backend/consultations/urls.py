from django.urls import path
from .views import ConsultationListCreateView, PatientConsultationsView, ConsultationDetailView

urlpatterns = [
    path('', ConsultationListCreateView.as_view(), name='consultation-list-create'),
    path('<int:pk>/', ConsultationDetailView.as_view(), name='consultation-detail'),
    path('patient/<str:dmp_id>/', PatientConsultationsView.as_view(), name='patient-consultations'),
]
