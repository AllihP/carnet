from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate

from .models import CustomUser
from .serializers import UserSerializer, RegisterSerializer
from .authentication import generate_staff_token


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        if not username or not password:
            return Response({'error': 'Identifiant et mot de passe requis.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Identifiants incorrects.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'Compte désactivé.'}, status=status.HTTP_401_UNAUTHORIZED)

        token = generate_staff_token(user)
        return Response({
            'token': token,
            'user': UserSerializer(user).data,
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from patients.models import Patient
        if isinstance(request.user, Patient):
            from patients.serializers import PatientDetailSerializer
            return Response(PatientDetailSerializer(request.user).data)
        return Response(UserSerializer(request.user).data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = generate_staff_token(user)
            return Response({'token': token, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorsListView(APIView):
    def get(self, request):
        doctors = CustomUser.objects.filter(role='medecin')
        return Response(UserSerializer(doctors, many=True).data)
