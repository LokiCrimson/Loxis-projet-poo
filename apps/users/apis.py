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
    Endpoint de connexion personnalisÃ© qui prend en compte le 2FA (avec le champ 'otp' supplÃ©mentaire)
    """
    serializer_class = LoxisTokenObtainPairSerializer


class Enable2FAApi(APIView):
    """
    GÃ©nÃ¨re le QR Code et le secret pour configurer Google Authenticator
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.is_two_factor_enabled:
            return Response({"detail": "Le 2FA est dÃ©jÃ  activÃ©."}, status=status.HTTP_400_BAD_REQUEST)
            
        data = generate_2fa_secret(request.user)
        serializer = TwoFactorSetupSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class Confirm2FAApi(APIView):
    """
    Valide le premier token gÃ©nÃ©rÃ© par l'utilisateur pour finaliser l'activation du 2FA
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TwoFactorConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        try:
            success = verify_and_enable_2fa(request.user, token)
            if success:
                return Response({"detail": "2FA activÃ© avec succÃ¨s."}, status=status.HTTP_200_OK)
            return Response({"detail": "Code invalide."}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class Disable2FAApi(APIView):
    """
    DÃ©sactive le 2FA pour l'utilisateur connectÃ©
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.is_two_factor_enabled:
            return Response({"detail": "Le 2FA n'est pas activÃ©."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_two_factor_enabled = False
        user.two_factor_secret = None
        user.save(update_fields=['is_two_factor_enabled', 'two_factor_secret'])
        return Response({"detail": "2FA dÃ©sactivÃ© avec succÃ¨s."}, status=status.HTTP_200_OK)


class UserListCreateApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({'detail': 'AccÃ¨s refusÃ©.'}, status=status.HTTP_403_FORBIDDEN)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users = User.objects.all().values('id', 'email', 'first_name', 'last_name', 'role', 'phone')
        return Response(list(users))

    def post(self, request):
        # Registration logic (AllowAny potentially for new users)
        # But if it's the Admin creating, let's keep it consistent
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
            return Response({'detail': 'Un utilisateur avec cet email existe dÃ©jÃ .'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.core.services import log_audit
        from apps.core.models import AuditLog

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

        log_audit(
            actor=request.user if request.user.is_authenticated else user,
            action=AuditLog.ActionType.CREATE,
            entity_name='User',
            entity_id=str(user.id),
            details={'email': email, 'role': role, 'event': 'registration'},
            severity=AuditLog.Severity.INFO
        )

        return Response({'id': user.id, 'email': user.email}, status=status.HTTP_201_CREATED)

class UserDetailApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        if request.user.role != 'ADMIN' and request.user.id != user_id:
            return Response({'detail': 'AccÃ¨s refusÃ©.'}, status=status.HTTP_403_FORBIDDEN)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(pk=user_id)
            return Response({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            })
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur non trouvÃ©.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, user_id):
        if request.user.role != 'ADMIN' and request.user.id != user_id:
            return Response({'detail': 'AccÃ¨s refusÃ©.'}, status=status.HTTP_403_FORBIDDEN)
            
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(pk=user_id)
            role = request.data.get('role')
            if role and request.user.role == 'ADMIN':
                user.role = role
            
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.save()
            
            return Response({'id': user.id, 'email': user.email, 'role': user.role})
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur non trouvÃ©.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, user_id):
        if request.user.role != 'ADMIN':
            return Response({'detail': 'AccÃ¨s refusÃ©.'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.user.id == user_id:
            return Response({'detail': 'Impossible de supprimer votre propre compte.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(pk=user_id)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur non trouvÃ©.'}, status=status.HTTP_404_NOT_FOUND)

from rest_framework import generics
from apps.users.models import TenantProfile
from apps.users.serializers import TenantProfileSerializer

class TenantListCreateApi(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TenantProfileSerializer

    def get_queryset(self):
        queryset = TenantProfile.objects.all()
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(profession__icontains=search)
            )
        return queryset

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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated

class ChangePasswordApi(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'detail': 'L\'ancien et le nouveau mot de passe sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'detail': 'L\'ancien mot de passe est incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Mot de passe modifié avec succès.'}, status=status.HTTP_200_OK)



