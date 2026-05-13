from django.urls import path
from patients.views import PatientLoginView, PatientMeView, PatientChangeCodeView

urlpatterns = [
    path('login/', PatientLoginView.as_view(), name='patient-login'),
    path('me/', PatientMeView.as_view(), name='patient-me'),
    path('change-code/', PatientChangeCodeView.as_view(), name='patient-change-code'),
]
