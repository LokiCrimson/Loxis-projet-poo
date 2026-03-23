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
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.is_two_factor_enabled:
            otp = attrs.get('otp')
            if not otp:
                raise serializers.ValidationError({
                    "2fa_required": True,
                    "detail": _("Authentification double facteur requise. Veuillez fournir votre code OTP.")
                })
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

class GuarantorSerializer(serializers.ModelSerializer):
    class Meta:
        from apps.users.models import Guarantor
        model = Guarantor
        fields = '__all__'

class TenantProfileSerializer(serializers.ModelSerializer):
    rent_status = serializers.SerializerMethodField()
    property_name = serializers.SerializerMethodField()
    guarantors = GuarantorSerializer(many=True, read_only=True)
    garant_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        from apps.users.models import TenantProfile
        model = TenantProfile
        fields = '__all__'

    def get_rent_status(self, obj):
        try:
            active_leases = obj.leases.filter(statut='actif')
            for lease in active_leases:
                if hasattr(lease, 'has_unpaid_payments') and lease.has_unpaid_payments:
                    return 'late'
            return 'up_to_date'
        except:
            return 'up_to_date'

    def get_property_name(self, obj):
        try:
            lease = obj.leases.filter(statut='actif').first()
            if lease and lease.bien:
                return getattr(lease.bien, 'name', str(lease.bien))
        except:
            pass
        return ""

    def create(self, validated_data):
        garant_data = validated_data.pop('garant_data', None)
        email = validated_data.get('email')
        user = None
        if email:
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    first_name=validated_data.get('first_name', ''),
                    last_name=validated_data.get('last_name', ''),
                    role=User.Role.TENANT
                )
                user.set_unusable_password()
                user.save()

        validated_data['user'] = user
        tenant = super().create(validated_data)
        
        if garant_data:
            from apps.users.models import Guarantor
            # Map frontend fields to backend fields
            Guarantor.objects.create(
                tenant=tenant,
                first_name=garant_data.get('prenom', ''),
                last_name=garant_data.get('nom', ''),
                phone=garant_data.get('telephone', ''),
                email=garant_data.get('email', ''),
                profession=garant_data.get('profession', ''),
                monthly_income=garant_data.get('revenu_mensuel', 0)
            )
            
        return tenant

        if garant_data:
            from apps.users.models import Guarantor
            Guarantor.objects.create(
                tenant=tenant,
                first_name=garant_data.get('prenom', ''),
                last_name=garant_data.get('nom', ''),
                phone=garant_data.get('telephone', ''),
                email=garant_data.get('email', ''),
                profession=garant_data.get('profession', ''),
                monthly_income=garant_data.get('revenu_mensuel', 0)
            )
        return tenant

    def update(self, instance, validated_data):
        garant_data = validated_data.pop('garant_data', None)
        email = validated_data.get('email', instance.email)
        first_name = validated_data.get('first_name', instance.first_name)      
        last_name = validated_data.get('last_name', instance.last_name)
        phone = validated_data.get('phone', instance.phone)

        user = instance.user
        if user:
            if email != user.email:
                if User.objects.filter(email=email).exclude(id=user.id).exists():
                    raise serializers.ValidationError({'email': 'Un utilisateur avec cet email existe déjà.'})                                                                
                user.email = email
                user.username = email
            user.first_name = first_name
            user.last_name = last_name
            user.phone = phone
            user.save()

        tenant = super().update(instance, validated_data)

        if garant_data:
            from apps.users.models import Guarantor
            guarantor = tenant.guarantors.first()
            if guarantor:
                guarantor.first_name = garant_data.get('prenom', guarantor.first_name)
                guarantor.last_name = garant_data.get('nom', guarantor.last_name)
                guarantor.phone = garant_data.get('telephone', guarantor.phone)
                guarantor.email = garant_data.get('email', guarantor.email)
                guarantor.profession = garant_data.get('profession', guarantor.profession)
                guarantor.monthly_income = garant_data.get('revenu_mensuel', guarantor.monthly_income)
                guarantor.save()
            else:
                Guarantor.objects.create(
                    tenant=tenant,
                    first_name=garant_data.get('prenom', ''),
                    last_name=garant_data.get('nom', ''),
                    phone=garant_data.get('telephone', ''),
                    email=garant_data.get('email', ''),
                    profession=garant_data.get('profession', ''),
                    monthly_income=garant_data.get('revenu_mensuel', 0)
                )
        return tenant
