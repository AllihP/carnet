from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('medecin', 'Médecin'),
        ('direction', 'Direction'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='medecin')
    telephone = models.CharField(max_length=20, blank=True)
    specialite = models.CharField(max_length=100, blank=True, default='Médecine générale')

    def __str__(self):
        return f"Dr. {self.get_full_name()} ({self.role})" if self.role == 'medecin' else f"{self.get_full_name()} ({self.role})"
