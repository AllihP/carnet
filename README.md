# MediCarnet — Hôpital National de N'Djamena

Plateforme médicale complète : Django REST API + React.js

## Structure du projet
```
hopital/
├── backend/     ← API Django (port 8000)
└── frontend/    ← Interface React (port 5173)
```

## Installation

### Backend (Django)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations accounts
python manage.py makemigrations patients
python manage.py makemigrations consultations
python manage.py makemigrations dashboard
python manage.py migrate
python manage.py runserver
```

### Créer les comptes (via Django shell)
```powershell
python manage.py shell
```
```python
from accounts.models import CustomUser

# Créer un médecin
doc = CustomUser.objects.create_user(
    username='dr.mahamat',
    password='medecin2024',
    first_name='Ibrahim',
    last_name='Mahamat',
    role='medecin',
    specialite='Médecine générale',
    telephone='+235 22 52 44 00',
)

# Créer un utilisateur Direction
dir = CustomUser.objects.create_user(
    username='direction',
    password='direction2024',
    first_name='Directeur',
    last_name='Hôpital',
    role='direction',
)

# Créer un patient de démo
from patients.models import Patient
p = Patient.objects.create(
    dmp_id='AO-847152',
    prenom='Amina',
    nom='Ouédraogo',
    dob='1987-03-14',
    sexe='F',
    blood='O+',
    addr="Quartier Moursal, N'Djamena",
    tel='+235 66 00 11 22',
    job='Infirmière',
    urg='Karimatou — +235 66 55 44 33',
    color='#0E7A5F',
    temp_code='MC-4829',
    code='MC-4829',
    first_login=True,
    doctor=doc,
)
exit()
```

### Frontend (React)

```powershell
cd frontend
npm install
npm run dev
```

## Accès

| Espace | URL | Identifiants |
|--------|-----|--------------|
| Médecin | `http://localhost:5173/` → onglet Médecin | `dr.mahamat` / `medecin2024` |
| Patient | `http://localhost:5173/` → onglet Patient | DMP: `AO-847152` / Code: `MC-4829` |
| Direction | `http://localhost:5173/` → onglet Direction | `direction` / `direction2024` |

## Fonctionnalités

### Espace Médecin
- 📁 **Ouvrir dossier médical** : Consulter le dossier complet d'un patient (historique, vaccins, allergies, signes vitaux…)
- 🩺 **Faire une consultation** : Formulaire 10 étapes (motif, vitaux, examen clinique, diagnostic, ordonnance, examens, antécédents, vaccinations, allergies, suivi)
- ✅ Vérification du code patient avant accès au dossier

### Espace Patient
- 📖 **Page de garde** : Carnet médical visuel officiel
- 📋 **Carnet numérique** : 10 sections (infos, médecin, consultations, traitements, examens, antécédents, vaccins, allergies, vitaux, confidentialité)
- 🔑 **Gestion du code** : Création à la 1ère connexion, modification possible

### Espace Direction
- 📊 **Vue d'ensemble** : KPIs globaux, graphiques temporels
- 🦠 **Maladies** : Top diagnostics, courbe épidémiologique
- 💊 **Médicaments** : Top prescriptions
- 📋 **Liste consultations** : Qui a consulté qui, avec quel médecin
- 🩺 **Médecins** : Activité par médecin (consultations, patients)
