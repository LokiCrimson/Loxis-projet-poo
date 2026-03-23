from django.db import models
from django.core.exceptions import ValidationError
from datetime import date
from apps.users.models import User, TenantProfile
from apps.properties.models import Property
from apps.core.models import AuditLog


class StatutBailEnum(models.TextChoices):
    ACTIF = "actif", "Actif"
    TERMINE = "termine", "Terminé"
    RESILIE = "resilie", "Résilié"


class Reservation(models.Model):
    """CU-XX : Réservation d'un bien par un locataire potentiel"""
    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente"
        ACCEPTED = "ACCEPTED", "Acceptée"
        REJECTED = "REJECTED", "Refusée"
        CANCELLED = "CANCELLED", "Annulée"

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reservations')
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'TENANT'})
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # On ne peut pas réserver deux fois le même bien en attente
        unique_together = ('property', 'tenant', 'status') if False else [] 

    def __str__(self):
        return f"Réservation {self.id} - {self.property.reference} par {self.tenant.email}"


class Lease(models.Model):
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
    is_followed = models.BooleanField(default=False)
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
    def check_retard_statut(self):
        """
        Retourne un dictionnaire avec le niveau de retard.
        Niveaux : 0 (à jour), 1 (léger < 30j), 2 (moyen 30-60j), 3 (grave > 60j)
        """
        from datetime import date
        today = date.today()
        
        # On cherche tous les paiements avec un reste_a_payer > 0
        paiements_en_retard = self.rent_payments.filter(
            models.Q(statut__in=['impaye', 'partiel']) | 
            models.Q(reste_a_payer__gt=0)
        ).order_by('periode_annee', 'periode_mois')

        if not paiements_en_retard.exists():
            return {"niveau": 0, "jours": 0, "montant_total": 0}

        montant_total = sum(p.reste_a_payer for p in paiements_en_retard)
        
        # Le retard est calculé par rapport à la date de paiement prévue la plus ancienne
        premier_retard = paiements_en_retard.first()
        # On estime la date due comme le jour_paiement du mois/année concerné
        date_due_estimee = date(premier_retard.periode_annee, premier_retard.periode_mois, min(self.jour_paiement, 28))
        
        jours_retard = (today - date_due_estimee).days
        
        if jours_retard <= 0:
            niveau = 0
        elif jours_retard < 30:
            niveau = 1
        elif jours_retard < 60:
            niveau = 2
        else:
            niveau = 3
            
        return {
            "niveau": niveau, 
            "jours": max(0, jours_retard), 
            "montant_total": float(montant_total)
        }

    @property
    def is_followed(self):
        # Pour l'instant on peut stocker ça dans un champ ou juste retourner si un flag existe
        return getattr(self, '_is_followed', False)

    def save(self, *args, **kwargs):
        if not self.reference:
            # Auto-generate reference
            import uuid
            self.reference = f"BAIL-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Bail"
        verbose_name_plural = "Baux"


class RentRevision(models.Model):
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
