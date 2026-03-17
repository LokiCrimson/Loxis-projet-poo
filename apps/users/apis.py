from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.exceptions import ValidationError

from .services import generate_2fa_secret, verify_and_enable_2fa
from .serializers import (
    LoxisTokenObtainPairSerializer, 
    TwoFactorConfirmSerializer,
    TwoFactorSetupSerializer
)

class LoxisTokenObtainPairView(TokenObtainPairView):
    """
    Endpoint de connexion personnalisé qui prend en compte le 2FA (avec le champ 'otp' supplémentaire)
    """
    serializer_class = LoxisTokenObtainPairSerializer


class Enable2FAApi(APIView):
    """
    Génère le QR Code et le secret pour configurer Google Authenticator
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.is_two_factor_enabled:
            return Response({"detail": "Le 2FA est déjà activé."}, status=status.HTTP_400_BAD_REQUEST)
            
        data = generate_2fa_secret(request.user)
        serializer = TwoFactorSetupSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class Confirm2FAApi(APIView):
    """
    Valide le premier token généré par l'utilisateur pour finaliser l'activation du 2FA
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TwoFactorConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        try:
            success = verify_and_enable_2fa(request.user, token)
            if success:
                return Response({"detail": "2FA activé avec succès."}, status=status.HTTP_200_OK)
            return Response({"detail": "Code invalide."}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class Disable2FAApi(APIView):
    """
    Désactive le 2FA pour l'utilisateur connecté
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.is_two_factor_enabled:
            return Response({"detail": "Le 2FA n'est pas activé."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_two_factor_enabled = False
        user.two_factor_secret = None
        user.save(update_fields=['is_two_factor_enabled', 'two_factor_secret'])
        return Response({"detail": "2FA désactivé avec succès."}, status=status.HTTP_200_OK)


class UserListCreateApi(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response([])

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'OWNER')

        if not email or not password:
            return Response({'detail': 'Email et mot de passe requis.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Un utilisateur avec cet email existe déjà.'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle username constraint
        username = email
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        return Response({'id': user.id, 'email': user.email}, status=status.HTTP_201_CREATED)

class UserDetailApi(APIView):
    def get(self, request, user_id):
        return Response({})

from rest_framework import generics
from apps.users.models import TenantProfile
from apps.users.serializers import TenantProfileSerializer

class TenantListCreateApi(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = TenantProfile.objects.all()
    serializer_class = TenantProfileSerializer

class GuarantorCreateApi(APIView):
    def post(self, request, tenant_id):
        return Response({})
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated

class UserMeApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'role': user.role,
            'is_two_factor_enabled': user.is_two_factor_enabled
        })

    def put(self, request):
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.phone = request.data.get('phone', user.phone)
        # Note: not updating email directly here to avoid auth trouble
        user.save()
        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'role': user.role,
            'is_two_factor_enabled': user.is_two_factor_enabled
        })

class TenantDetailApi(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = TenantProfile.objects.all()
    serializer_class = TenantProfileSerializer
    lookup_url_kwarg = 'tenant_id'

class TenantDetailApi(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = TenantProfile.objects.all()
    serializer_class = TenantProfileSerializer
    lookup_url_kwarg = 'tenant_id'
