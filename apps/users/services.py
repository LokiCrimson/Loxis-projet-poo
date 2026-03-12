from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from .models import User, TenantProfile, Guarantor
from apps.core.services import log_audit  # On supposera qu'on l'importe de core

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