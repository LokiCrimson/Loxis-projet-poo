from django.core.exceptions import ValidationError
from django.db import transaction
from datetime import date
from django.forms.models import model_to_dict
import json
from apps.core.models import AuditLog
from apps.users.models import User
from apps.properties.models import StatutBienEnum
from apps.core.services import log_audit, create_alert
from .models import Lease, RentRevision, StatutBailEnum
from .selectors import get_active_lease_for_property, get_active_lease_for_tenant


def create_lease(*, bien_id: int, locataire_id: int, data: dict, created_by: User) -> Lease:
    """
    Crée un bail.
    Lève ValidationError si :
      - Le bien n'est pas vacant
      - Le bien a déjà un bail actif
      - Le locataire a déjà un bail actif
      - Chevauchement de dates détecté
    Effets de bord :
      - bien.statut → "loue"
      - Crée alerte type="LEASE_CREATED" pour le locataire
      - Log AuditLog action=CREATE
    """
    from apps.properties.models import Property
    
    with transaction.atomic():
        bien = Property.objects.get(id=bien_id)
        if bien.status != StatutBienEnum.VACANT:
            raise ValidationError("Le bien n'est pas vacant.")
        
        if get_active_lease_for_property(bien_id):
            raise ValidationError("Le bien a déjà un bail actif.")
        
        if get_active_lease_for_tenant(locataire_id):
            raise ValidationError("Le locataire a déjà un bail actif.")
        
        lease = Lease.objects.create(
            bien_id=bien_id,
            locataire_id=locataire_id,
            **data
        )
        
        bien.status = StatutBienEnum.LOUE
        bien.save()
        
        if lease.locataire.user:
            create_alert(
                recipient_id=lease.locataire.user.id, 
                alert_type='LEASE_CREATED', 
                message=f"Nouveau bail créé pour le bien {bien.reference}",
                entity_type='Lease',
                entity_id=str(lease.id)
            )
        
        log_audit(
            actor=created_by,
            action='CREATE',
            entity_name="Bail",
            entity_id=str(lease.id),
            details={"apres": data}
        )
        
        return lease


def terminate_lease(*, lease_id: int, data: dict, terminated_by: User) -> dict:
    """
    Résilie un bail.
    data contient : motif_fin, date_sortie_effective, depot_restitue,
                    depot_retenue_motif (optionnel)
    Retourne : {"bail": Lease, "avertissement_impayes": float | None}
    Lève ValidationError si bail non actif.
    Effets de bord :
      - bien.statut → "vacant"
      - Crée Expense si retenue sur dépôt
      - Log AuditLog action=UPDATE (avant/après)
    """
    from apps.properties.models import Property
    from apps.finances.models import Expense, ExpenseCategory
    
    with transaction.atomic():
        lease = Lease.objects.select_related('bien').get(id=lease_id)
        if lease.statut != StatutBailEnum.ACTIF:
            raise ValidationError("Le bail n'est pas actif.")
        
        unpaid = lease.has_unpaid_payments
        warning = None
        if unpaid:
            from apps.finances.selectors import get_debt_for_lease
            warning = get_debt_for_lease(lease_id)
        
        avant = model_to_dict(lease)
        
        lease.statut = StatutBailEnum.RESILIE
        for key, value in data.items():
            setattr(lease, key, value)
        lease.save()
        
        lease.bien.status = StatutBienEnum.VACANT
        lease.bien.save()
        
        if lease.depot_restitue and lease.depot_restitue < lease.depot_garantie_verse:
            category, _ = ExpenseCategory.objects.get_or_create(nom='Retenue dépôt')
            Expense.objects.create(
                bien=lease.bien,
                bail=lease,
                categorie=category,
                libelle='Retenue sur dépôt de garantie',
                montant=lease.depot_garantie_verse - lease.depot_restitue,
                date_depense=date.today(),
                enregistre_par=terminated_by
            )
        
        log_audit(
            actor=terminated_by,
            action='UPDATE',
            entity_name="Bail",
            entity_id=str(lease.id),
            details={"avant": avant, "apres": data}
        )
        
        return {"bail": lease, "avertissement_impayes": warning}


def apply_rent_revision(*, lease_id: int, data: dict, revised_by: User) -> RentRevision:
    """
    Enregistre une révision de loyer.
    data contient : nouveau_loyer, motif, appliquee (bool), date_revision
    Effets de bord :
      - Si appliquee=True → bail.loyer_actuel = nouveau_loyer
      - Log AuditLog action=UPDATE
    """
    lease = Lease.objects.get(id=lease_id)
    avant = {"loyer_actuel": float(lease.loyer_actuel)}
    
    revision = RentRevision.objects.create(
        bail=lease,
        cree_par=revised_by,
        ancien_loyer=lease.loyer_actuel,
        **data
    )
    if revision.appliquee:
        revision.appliquer()
    
    log_audit(
        actor=revised_by,
        action='UPDATE',
        entity_name="Bail",
        entity_id=str(lease.id),
        details={"avant": avant, "apres": {"loyer_actuel": float(lease.loyer_actuel)}, "revision": data}
    )
    
    return revision
