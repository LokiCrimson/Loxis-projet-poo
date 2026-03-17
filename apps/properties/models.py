from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User
from apps.core.models import SoftDeleteModel

class StatutBienEnum(models.TextChoices):
    VACANT = 'VACANT', _('Vacant')
    LOUE = 'RENTED', _('Loué')
    EN_TRAVAUX = 'UNDER_WORK', _('En travaux')

class PropertyCategory(SoftDeleteModel):
    """CU-02 : Gérer les catégories de biens (ex: Appartement, Bureau)"""
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class PropertyType(SoftDeleteModel):
    """CU-03 : Gérer les types de biens (ex: Studio, T2)"""
    category = models.ForeignKey(PropertyCategory, on_delete=models.CASCADE, related_name='types')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('category', 'name')

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class Property(SoftDeleteModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties', limit_choices_to={'role': User.Role.OWNER})
    category = models.ForeignKey(PropertyCategory, on_delete=models.PROTECT)
    property_type = models.ForeignKey(PropertyType, on_delete=models.PROTECT)
    
    reference = models.CharField(max_length=100, unique=True, verbose_name="Référence unique")
    status = models.CharField(max_length=20, choices=StatutBienEnum.choices, default=StatutBienEnum.VACANT)
    
    # Adresse
    address = models.TextField()
    city = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    
    # Caractéristiques
    surface_area = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Surface (m²)")
    rooms_count = models.PositiveIntegerField(verbose_name="Nombre de pièces")
    description = models.TextField(blank=True)
    
    # Données financières de base (CU-06 précise loyer HC, charges, etc. lors de l'ajout)
    base_rent_hc = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Loyer HC")
    base_charges = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Charges")
    guarantee_deposit = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Dépôt de garantie demandé")

    def __str__(self):
        return f"{self.reference} - {self.address}"

class PropertyPhoto(models.Model):
    """CU-07 : Gérer les photos d'un bien"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='properties/photos/')
    is_main = models.BooleanField(default=False, verbose_name="Photo principale")
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"Photo de {self.property.reference}"