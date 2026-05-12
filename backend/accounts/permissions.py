from rest_framework.permissions import BasePermission
from patients.models import Patient


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'medecin'


class IsDirection(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'direction'


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return isinstance(request.user, Patient)


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role in ['medecin', 'direction']
