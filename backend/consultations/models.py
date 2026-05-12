from django.db import models


class Consultation(models.Model):
    TYPE_CHOICES = [
        ('Consultation ordinaire', 'Consultation ordinaire'),
        ('Urgence', 'Urgence'),
        ('Suivi de traitement', 'Suivi de traitement'),
        ('Bilan de santé', 'Bilan de santé'),
        ('Consultation prénatale', 'Consultation prénatale'),
        ('Vaccination', 'Vaccination'),
    ]
    SEVERITY_CHOICES = [
        ('Légère', 'Légère'),
        ('Modérée', 'Modérée'),
        ('Sévère', 'Sévère'),
        ('Critique', 'Critique'),
    ]

    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='consultations')
    doctor = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, related_name='consultations')
    date = models.DateField()
    consult_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Consultation ordinaire')
    motif = models.TextField(blank=True)
    symptoms = models.JSONField(default=list)
    obs_symp = models.TextField(blank=True)
    duration_symp = models.CharField(max_length=50, blank=True)

    # Signes vitaux
    vitals = models.JSONField(default=dict)

    # Examen clinique
    exam_cv = models.TextField(blank=True)
    exam_resp = models.TextField(blank=True)
    exam_abdo = models.TextField(blank=True)
    exam_neuro = models.TextField(blank=True)
    exam_orl = models.TextField(blank=True)
    exam_gen = models.TextField(blank=True)

    # Diagnostic
    diag_main = models.CharField(max_length=200, blank=True)
    diag_cim = models.CharField(max_length=20, blank=True)
    diag_severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, blank=True)
    diag_d1 = models.CharField(max_length=200, blank=True)
    diag_d2 = models.CharField(max_length=200, blank=True)
    diag_conclusion = models.TextField(blank=True)

    # Ordonnance
    prescriptions = models.JSONField(default=list)
    rx_notes = models.TextField(blank=True)

    # Examens
    exams_requested = models.JSONField(default=list)
    results = models.JSONField(default=list)

    # Suivi
    obs_notes = models.TextField(blank=True)
    next_rdv = models.DateField(null=True, blank=True)
    next_motif = models.CharField(max_length=200, blank=True)
    next_urg = models.CharField(max_length=200, blank=True)
    arret_travail = models.CharField(max_length=20, default='Non')
    refer_spec = models.CharField(max_length=100, blank=True)
    refer_motif = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.date} – {self.patient} – {self.doctor}"
