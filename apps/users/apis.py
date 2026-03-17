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
    def get(self, request):
        return Response([])

class UserDetailApi(APIView):
    def get(self, request, user_id):
        return Response({})

class TenantListCreateApi(APIView):
    def get(self, request):
        return Response([])

class GuarantorCreateApi(APIView):
    def post(self, request, tenant_id):
        return Response({})
