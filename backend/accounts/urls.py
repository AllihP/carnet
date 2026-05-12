from django.urls import path
from .views import LoginView, MeView, RegisterView, DoctorsListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('doctors/', DoctorsListView.as_view(), name='doctors-list'),
]
