from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class LoxisTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Surcharge du serializer par défaut pour intégrer la vérification du 2FA.
    """
    otp = serializers.CharField(required=False, allow_blank=True, write_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajouter le rôle dans le payload du JWT pour le frontend
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        # On appelle le validate parent pour vérifier le login/mot de passe
        data = super().validate(attrs)
        
        # Le User authentifié est maintenant dans self.user
        if self.user.is_two_factor_enabled:
            otp = attrs.get('otp')
            if not otp:
                # On retourne un message spécifique pour dire au front d'afficher le champ OTP
                raise serializers.ValidationError({
                    "2fa_required": True,
                    "detail": _("Authentification double facteur requise. Veuillez fournir votre code OTP.")
                })
                
            # Vérification du code OTP
            from apps.users.services import verify_2fa_token
            if not verify_2fa_token(self.user, otp):
                raise serializers.ValidationError({
                    "otp": _("Code OTP invalide ou expiré.")
                })
                
        return data

class TwoFactorSetupSerializer(serializers.Serializer):
    secret = serializers.CharField(read_only=True)
    qr_code = serializers.CharField(read_only=True)
    uri = serializers.CharField(read_only=True)

class TwoFactorConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=6, min_length=6, write_only=True)

class TenantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        from apps.users.models import TenantProfile
        model = TenantProfile
        fields = '__all__'


class TenantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        from apps.users.models import TenantProfile
        model = TenantProfile
        fields = '__all__'

