from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
import pyotp
import qrcode
import qrcode.image.svg
from io import BytesIO
import base64

from .models import User, TenantProfile, Guarantor
from apps.core.services import log_audit  # On supposera qu'on l'importe de core

def generate_2fa_secret(user: User) -> str:
    """Génère un secret 2FA pour l'utilisateur s'il n'en a pas déjà un."""
    if not user.two_factor_secret:
        user.two_factor_secret = pyotp.random_base32()
        user.save(update_fields=['two_factor_secret'])
    
    totp = pyotp.TOTP(user.two_factor_secret)
    # Le nom de l'application est Loxis
    provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="Loxis")
    
    # Génération du QR Code
    qr = qrcode.make(provisioning_uri)
    buf = BytesIO()
    qr.save(buf)
    qr_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    
    return {
        "secret": user.two_factor_secret,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "uri": provisioning_uri
    }

def verify_and_enable_2fa(user: User, token: str) -> bool:
    """Vérifie le token OTP et active le 2FA si c'est correct."""
    if not user.two_factor_secret:
        raise ValidationError("Le secret 2FA n'est pas généré pour cet utilisateur.")
        
    totp = pyotp.TOTP(user.two_factor_secret)
    if totp.verify(token):
        user.is_two_factor_enabled = True
        user.save(update_fields=['is_two_factor_enabled'])
        return True
    return False

def verify_2fa_token(user: User, token: str) -> bool:
    """Vérifie simplement un token OTP lors de la connexion."""
    if not user.is_two_factor_enabled or not user.two_factor_secret:
        return False
        
    totp = pyotp.TOTP(user.two_factor_secret)
    return totp.verify(token)

@transaction.atomic
def create_user(*, email: str, role: str, actor: User, **extra_fields) -> User:
    """CU-01 : Créer un utilisateur"""
    if User.objects.filter(email=email).exists():
        raise ValidationError("Cet email est déjà utilisé.")
        
    user = User(email=email, role=role, **extra_fields)
    # Mot de passe temporaire + envoi d'email à gérer ici
    user.password = make_password(User.objects.make_random_password())
    user.full_clean()
    user.save()
    
    log_audit(actor=actor, action='CREATE', entity_name='User', entity_id=str(user.id), details={"email": email, "role": role})
    return user

@transaction.atomic
def create_tenant_profile(*, actor: User, **data) -> TenantProfile:
    """CU-13 : Créer un dossier locataire"""
    profile = TenantProfile(**data)
    profile.full_clean()
    profile.save()
    
    log_audit(actor=actor, action='CREATE', entity_name='TenantProfile', entity_id=str(profile.id), details={"email": profile.email})
    return profile

def add_guarantor_to_tenant(*, tenant_id: int, **data) -> Guarantor:
    """CU-14 : Ajouter un garant"""
    tenant = TenantProfile.objects.get(id=tenant_id)
    guarantor = Guarantor(tenant=tenant, **data)
    guarantor.full_clean()
    guarantor.save()
    return guarantor