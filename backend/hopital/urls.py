from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Espace Patient  — /api/patient/
    path('api/patient/', include('hopital.patient_urls')),

    # Espace Médecin  — /api/medecin/
    path('api/medecin/', include('hopital.medecin_urls')),

    # Espace Direction — /api/direction/
    path('api/direction/', include('hopital.direction_urls')),
]
