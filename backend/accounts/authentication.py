import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


def generate_staff_token(user):
    payload = {
        'user_id': user.id,
        'role': user.role,
        'name': user.get_full_name(),
        'type': 'staff',
        'exp': datetime.utcnow() + timedelta(hours=8),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def generate_patient_token(patient):
    payload = {
        'patient_id': patient.id,
        'dmp_id': patient.dmp_id,
        'type': 'patient',
        'exp': datetime.utcnow() + timedelta(hours=8),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


class MediCarnetAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header[7:]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expiré. Veuillez vous reconnecter.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Token invalide.')

        token_type = payload.get('type')

        if token_type == 'staff':
            from accounts.models import CustomUser
            try:
                user = CustomUser.objects.get(id=payload['user_id'])
                return (user, payload)
            except CustomUser.DoesNotExist:
                raise AuthenticationFailed('Utilisateur introuvable.')

        elif token_type == 'patient':
            from patients.models import Patient
            try:
                patient = Patient.objects.get(id=payload['patient_id'])
                return (patient, payload)
            except Patient.DoesNotExist:
                raise AuthenticationFailed('Patient introuvable.')

        return None
