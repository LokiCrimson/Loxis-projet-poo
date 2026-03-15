from django.db.models import Q
from datetime import date, timedelta
from .models import Lease, StatutBailEnum


def get_active_lease_for_property(property_id: int) -> Lease | None:
    """Retourne le bail actif d'un bien, ou None."""
    return Lease.objects.filter(
        bien_id=property_id,
        statut=StatutBailEnum.ACTIF
    ).first()


def get_active_lease_for_tenant(tenant_id: int) -> Lease | None:
    """Retourne le bail actif d'un locataire, ou None."""
    return Lease.objects.filter(
        locataire_id=tenant_id,
        statut=StatutBailEnum.ACTIF
    ).first()


def get_leases_expiring_soon(days: int = 30):
    """Baux actifs dont date_fin est dans les X prochains jours."""
    end_date = date.today() + timedelta(days=days)
    return Lease.objects.filter(
        statut=StatutBailEnum.ACTIF,
        date_fin__lte=end_date,
        date_fin__isnull=False
    )


def get_lease_history_for_property(property_id: int):
    """Tous les baux (actifs + historiques) pour un bien."""
    return Lease.objects.filter(bien_id=property_id).order_by('-date_creation')


def get_lease_history_for_tenant(tenant_id: int):
    """Tous les baux d'un locataire."""
    return Lease.objects.filter(locataire_id=tenant_id).order_by('-date_creation')


def check_lease_overlap(property_id: int, date_debut, date_fin, exclude_id=None) -> bool:
    """Vérifie s'il y a chevauchement. Utilisé dans models.clean() et services."""
    qs = Lease.objects.filter(
        bien_id=property_id,
        statut__in=[StatutBailEnum.ACTIF, StatutBailEnum.TERMINE]
    )
    if exclude_id:
        qs = qs.exclude(id=exclude_id)
    for lease in qs:
        if lease.date_debut <= (date_fin or date.max) and (lease.date_fin is None or lease.date_fin >= date_debut):
            return True
    return False
