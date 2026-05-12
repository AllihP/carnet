from django.db import models
import random


COLORS = ['#0E7A5F', '#185FA5', '#6D3088', '#C0392B', '#8B5E15', '#2E7D32']


def gen_code():
    return f"MC-{random.randint(1000, 9999)}"


class Patient(models.Model):
    SEXE_CHOICES = [('F', 'Féminin'), ('M', 'Masculin')]
    BLOOD_CHOICES = [('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
                     ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-')]

    dmp_id = models.CharField(max_length=20, unique=True)
    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    dob = models.DateField()
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)
    blood = models.CharField(max_length=4, choices=BLOOD_CHOICES, default='O+')
    addr = models.CharField(max_length=300, blank=True)
    tel = models.CharField(max_length=20, blank=True)
    job = models.CharField(max_length=100, blank=True)
    urg = models.CharField(max_length=200, blank=True)
    color = models.CharField(max_length=10, default='#0E7A5F')
    temp_code = models.CharField(max_length=20, default=gen_code)
    code = models.CharField(max_length=100, blank=True)
    first_login = models.BooleanField(default=True)
    created_at = models.DateField(auto_now_add=True)
    doctor = models.ForeignKey(
        'accounts.CustomUser', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='patients'
    )

    # Antécédents
    ant_chr = models.TextField(blank=True)
    ant_chir = models.TextField(blank=True)
    ant_gyn = models.TextField(blank=True)
    ant_hab = models.TextField(blank=True)
    ant_pere = models.CharField(max_length=200, blank=True)
    ant_mere = models.CharField(max_length=200, blank=True)
    ant_fra = models.CharField(max_length=200, blank=True)

    next_rdv = models.DateField(null=True, blank=True)
    next_motif = models.CharField(max_length=200, blank=True)
    next_urg = models.CharField(max_length=200, blank=True)

    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.temp_code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.prenom} {self.nom} (DMP-{self.dmp_id})"

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False


class Vaccine(models.Model):
    STATUS_CHOICES = [
        ('À jour', 'À jour'),
        ('Rappel dû', 'Rappel dû'),
        ('Non administré', 'Non administré'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vaccines')
    name = models.CharField(max_length=100)
    date = models.DateField(null=True, blank=True)
    next_date = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='À jour')

    def __str__(self):
        return f"{self.name} – {self.patient}"


class Allergy(models.Model):
    TYPE_CHOICES = [
        ('Médicament', 'Médicament'),
        ('Alimentaire', 'Alimentaire'),
        ('Environnemental', 'Environnemental'),
        ('Contact', 'Contact'),
    ]
    SEV_CHOICES = [
        ('Légère', 'Légère'),
        ('Modérée-Sévère', 'Modérée-Sévère'),
        ('Anaphylaxie', 'Anaphylaxie'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='allergies')
    name = models.CharField(max_length=100)
    allergy_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    reaction = models.CharField(max_length=200, blank=True)
    severity = models.CharField(max_length=20, choices=SEV_CHOICES, default='Légère')

    def __str__(self):
        return f"{self.name} ({self.allergy_type}) – {self.patient}"
