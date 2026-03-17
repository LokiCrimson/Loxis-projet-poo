from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from apps.core.models import SoftDeleteModel

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Administrateur')
        OWNER = 'OWNER', _('Propriétaire')
        TENANT = 'TENANT', _('Locataire')

    email = models.EmailField(unique=True, verbose_name="Adresse email")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TENANT)
    
    # 2FA (Google Authenticator)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    is_two_factor_enabled = models.BooleanField(default=False)

    # On utilise l'email comme identifiant principal plutôt que le username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"


class TenantProfile(SoftDeleteModel):
    """CU-13 : Dossier locataire"""
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tenant_profile')
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    birth_date = models.DateField(null=True, blank=True)
    profession = models.CharField(max_length=150, blank=True)
    id_type = models.CharField(max_length=50, verbose_name="Type de pièce d'identité")
    id_number = models.CharField(max_length=100, verbose_name="Numéro de la pièce")
    id_scan = models.FileField(upload_to='tenants/ids/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Dossier Locataire: {self.first_name} {self.last_name}"


class Guarantor(SoftDeleteModel):
    """CU-14 : Gérer les garants d'un locataire"""
    tenant = models.ForeignKey(TenantProfile, on_delete=models.CASCADE, related_name='guarantors')
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    profession = models.CharField(max_length=150)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2)
    document = models.FileField(upload_to='tenants/guarantors/', null=True, blank=True)

    def __str__(self):
        return f"Garant: {self.first_name} {self.last_name}"