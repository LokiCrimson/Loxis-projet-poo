from django.db import models
from django.core.exceptions import ValidationError
from datetime import date
from apps.users.models import User, TenantProfile
from apps.properties.models import Property
from apps.core.models import AuditLog, SoftDeleteModel


class StatutBailEnum(models.TextChoices):
    ACTIF = "actif", "Actif"
    TERMINE = "termine", "Terminé"
    RESILIE = "resilie", "Résilié"


class Lease(SoftDeleteModel):
    bien = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='leases')
    locataire = models.ForeignKey(TenantProfile, on_delete=models.CASCADE, related_name='leases')
    reference = models.CharField(max_length=50, unique=True, blank=True)
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    loyer_initial = models.DecimalField(max_digits=10, decimal_places=2)
    loyer_actuel = models.DecimalField(max_digits=10, decimal_places=2)
    charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    depot_garantie_verse = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    depot_restitue = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    depot_retenue_motif = models.TextField(null=True, blank=True)
    motif_fin = models.TextField(null=True, blank=True)
    date_sortie_effective = models.DateField(null=True, blank=True)
    etat_lieux_entree_url = models.URLField(null=True, blank=True)
    etat_lieux_sortie_url = models.URLField(null=True, blank=True)
    document_url = models.URLField(null=True, blank=True)
    jour_paiement = models.PositiveIntegerField()
    statut = models.CharField(max_length=20, choices=StatutBailEnum.choices, default=StatutBailEnum.ACTIF)
    date_creation = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Validation jour_paiement
        if not (1 <= self.jour_paiement <= 28):
            raise ValidationError("Le jour de paiement doit être entre 1 et 28.")
        
        # Validation dates
        if self.date_fin and self.date_debut >= self.date_fin:
            raise ValidationError("La date de fin doit être après la date de début.")
        
        # Chevauchement
        if self.check_lease_overlap(self.bien_id, self.date_debut, self.date_fin, exclude_id=self.id if self.id else None):
            raise ValidationError("Il y a un chevauchement de dates pour ce bien.")

    @staticmethod
    def check_lease_overlap(bien_id, date_debut, date_fin, exclude_id=None):
        qs = Lease.objects.filter(
            bien_id=bien_id,
            statut__in=[StatutBailEnum.ACTIF, StatutBailEnum.TERMINE]
        )
        if exclude_id:
            qs = qs.exclude(id=exclude_id)
        for lease in qs:
            if lease.date_debut <= (date_fin or date.max) and (lease.date_fin is None or lease.date_fin >= date_debut):
                return True
        return False

    @property
    def duration_months(self):
        from dateutil.relativedelta import relativedelta
        end = self.date_fin or date.today()
        delta = relativedelta(end, self.date_debut)
        return delta.years * 12 + delta.months

    @property
    def has_unpaid_payments(self):
        return self.rent_payments.filter(statut__in=['impaye', 'partiel']).exists()

    def save(self, *args, **kwargs):
        if not self.reference:
            # Auto-generate reference
            import uuid
            self.reference = f"BAIL-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Bail"
        verbose_name_plural = "Baux"


class RentRevision(SoftDeleteModel):
    bail = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='rent_revisions')
    cree_par = models.ForeignKey(User, on_delete=models.CASCADE)
    date_revision = models.DateField()
    ancien_loyer = models.DecimalField(max_digits=10, decimal_places=2)
    nouveau_loyer = models.DecimalField(max_digits=10, decimal_places=2)
    motif = models.TextField()
    appliquee = models.BooleanField(default=False)

    def appliquer(self):
        if self.appliquee:
            self.bail.loyer_actuel = self.nouveau_loyer
            self.bail.save()

    class Meta:
        verbose_name = "Révision de loyer"
        verbose_name_plural = "Révisions de loyer"
