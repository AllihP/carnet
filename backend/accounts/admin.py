from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'first_name', 'last_name', 'email', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Infos médicales', {'fields': ('role', 'telephone', 'specialite')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Infos médicales', {'fields': ('role', 'telephone', 'specialite', 'first_name', 'last_name', 'email')}),
    )
