from django.urls import path
from .views import (
    PatientLoginView, PatientChangeCodeView,
    PatientListCreateView, PatientDetailView,
    VerifyPatientCodeView, PatientMeView,
)

urlpatterns = [
    path('login/', PatientLoginView.as_view(), name='patient-login'),
    path('me/', PatientMeView.as_view(), name='patient-me'),
    path('change-code/', PatientChangeCodeView.as_view(), name='patient-change-code'),
    path('', PatientListCreateView.as_view(), name='patient-list-create'),
    path('<str:dmp_id>/', PatientDetailView.as_view(), name='patient-detail'),
    path('<str:dmp_id>/verify-code/', VerifyPatientCodeView.as_view(), name='verify-code'),
]
