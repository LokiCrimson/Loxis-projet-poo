from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class StatutBienEnum(models.TextChoices):
    VACANT = "VACANT", _("Vacant")
    LOUE = "RENTED", _("Loué")
    EN_TRAVAUX = "UNDER_WORK", _("En travaux")
    RESERVE = "RESERVED", _("Réservé")


class PropertyCategory(models.Model):
    """CU-02 : Gérer les catégories de biens (ex: Appartement, Bureau)"""

    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class PropertyType(models.Model):
    """CU-03 : Gérer les types de biens (ex: Studio, T2)"""

    category = models.ForeignKey(
        PropertyCategory, on_delete=models.CASCADE, related_name="types"
    )
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("category", "name")

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class Property(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties")
    category = models.ForeignKey(PropertyCategory, on_delete=models.PROTECT)
    property_type = models.ForeignKey(PropertyType, on_delete=models.PROTECT)

    reference = models.CharField(
        max_length=100, unique=True, verbose_name="Référence unique"
    )
    status = models.CharField(
        max_length=20,
        choices=StatutBienEnum.choices,
        default=StatutBienEnum.VACANT)

    # Adresse
    address = models.TextField()
    city = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)

    # Caractéristiques
    surface_area = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Surface (m²)"
    )
    rooms_count = models.PositiveIntegerField(verbose_name="Nombre de pièces")
    description = models.TextField(blank=True)
    tour_3d_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Lien 3D / Visite virtuelle")

    # Données financières de base (CU-06 précise loyer HC, charges, etc. lors
    # de l'ajout)
    base_rent_hc = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Loyer HC"
    )
    base_charges = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Charges"
    )
    guarantee_deposit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Dépôt de garantie demandé")

    def save(self, *args, **kwargs):
        if not self.reference:
            # On récupère le dernier ID pour générer une référence auto-incrémentée
            last_property = Property.objects.all().order_by('id').last()
            next_id = (last_property.id + 1) if last_property else 1
            self.reference = f"PROP-{next_id:05d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} - {self.address}"


class PropertyPhoto(models.Model):
    """CU-07 : Gérer les photos d'un bien"""

    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField(upload_to="properties/photos/")
    is_main = models.BooleanField(
        default=False, verbose_name="Photo principale")
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order"]

    def __str__(self):
        return f"Photo de {self.property.reference}"


class PropertyFurniture(models.Model):
    """Meubles et équipements d'un bien"""

    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="furniture"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    tour_3d_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Lien 3D / Visite virtuelle")
    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)

    # État du meuble
    NEW = "NEW"
    GOOD = "GOOD"
    USED = "USED"
    BROKEN = "BROKEN"
    CONDITION_CHOICES = [
        (NEW, "Neuf"),
        (GOOD, "Bon état"),
        (USED, "Usagé"),
        (BROKEN, "Cassé/Abîmé"),
    ]
    condition = models.CharField(
        max_length=20,
        choices=CONDITION_CHOICES,
        default=GOOD)

    def __str__(self):
        return f"{self.name} ({self.property.reference})"


class PropertyReview(models.Model):
    """CU-XX : Laisser un avis sur un bien (Note + Commentaire)"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'TENANT'})
    rating = models.PositiveSmallIntegerField(verbose_name="Note (1-5)")
    comment = models.TextField(verbose_name="Commentaire", blank=True)
    is_public = models.BooleanField(default=True, verbose_name="Afficher publiquement")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('property', 'tenant') # Un seul avis par locataire par bien

    def __str__(self):
        return f"Avis {self.rating}/5 par {self.tenant.email} sur {self.property.reference}"


class PropertyIncident(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="incidents"
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "En attente"),
            ("IN_PROGRESS", "En cours"),
            ("RESOLVED", "Résolu"),
        ],
        default="PENDING",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Incident {self.title} - {self.property.reference}"
