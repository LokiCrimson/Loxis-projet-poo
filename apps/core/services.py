from datetime import datetime, time, timedelta

from django.http import Http404
from django.utils import timezone

from .models import AuditLog, Alert

def log_audit(
    *,
    actor=None,
    action: str,
    entity_name: str,
    entity_id: str,
    details: dict | None = None,
    severity: str = AuditLog.Severity.INFO,
    source_app: str = 'core',
    request_id: str = '',
) -> AuditLog:
    """Enregistre une action dans le journal d'audit."""
    log_entry = AuditLog.objects.create(
        user=actor,
        action=action,
        severity=severity,
        entity_name=entity_name,
        entity_id=entity_id,
        source_app=source_app,
        request_id=request_id,
        details=details or {},
    )
    return log_entry


def create_alert(
    *,
    recipient_id: int,
    alert_type: str,
    message: str,
    title: str = 'Alerte location',
    priority: str = Alert.Priority.MEDIUM,
    is_actionable: bool = True,
    action_url: str = '',
    metadata: dict | None = None,
    due_at=None,
    expires_at=None,
    dedupe_hours: int = 24,
    entity_type: str = '',
    entity_id: str = '',
) -> Alert:
    """Crée une alerte avec déduplication temporelle pour éviter le spam."""
    if dedupe_hours > 0:
        since = timezone.now() - timedelta(hours=dedupe_hours)
        existing = Alert.objects.filter(
            recipient_id=recipient_id,
            alert_type=alert_type,
            related_entity_type=entity_type,
            related_entity_id=entity_id,
            is_read=False,
            created_at__gte=since,
        ).first()
        if existing:
            existing._created = False
            return existing

    alert = Alert.objects.create(
        recipient_id=recipient_id,
        alert_type=alert_type,
        title=title,
        message=message,
        priority=priority,
        is_actionable=is_actionable,
        action_url=action_url,
        metadata=metadata or {},
        due_at=due_at,
        expires_at=expires_at,
        related_entity_type=entity_type,
        related_entity_id=entity_id,
    )
    alert._created = True
    log_audit(
        actor=None,
        action=AuditLog.ActionType.ALERT,
        severity=AuditLog.Severity.INFO,
        entity_name='Alert',
        entity_id=str(alert.id),
        details={
            'recipient_id': recipient_id,
            'alert_type': alert_type,
            'priority': priority,
        },
        source_app='core',
    )

    # Ici, vous pourriez déclencher une tâche Celery pour envoyer l'email
    # send_alert_email_task.delay(alert.id)

    return alert


def mark_alert_as_read(*, alert_id: int, user_id: int) -> Alert:
    """Marque une alerte comme lue."""
    try:
        alert = Alert.objects.get(id=alert_id, recipient_id=user_id)
    except Alert.DoesNotExist:
        raise Http404("Alert not found.")
    if not alert.is_read:
        alert.is_read = True
        alert.read_at = timezone.now()
        alert.save(update_fields=['is_read', 'read_at'])
    return alert


def mark_all_alerts_as_read(*, user_id: int) -> int:
    """Marque toutes les alertes non lues d'un utilisateur comme lues."""
    now = timezone.now()
    updated = Alert.objects.filter(recipient_id=user_id, is_read=False).update(is_read=True, read_at=now)
    return updated


def run_operational_alert_scan(*, days_to_lease_end: int = 45, overdue_days: int = 3) -> dict:
    """Génère les alertes métiers les plus utiles pour la gestion locative."""
    from apps.finances.models import RentPayment
    from apps.leases.models import Lease, StatutBailEnum
    from apps.properties.models import Property, StatutBienEnum
    from apps.users.models import User

    now = timezone.now()
    today = now.date()
    lease_deadline = today + timedelta(days=days_to_lease_end)
    overdue_limit = today - timedelta(days=overdue_days)

    created_count = 0

    admins = User.objects.filter(role=User.Role.ADMIN).values_list('id', flat=True)
    admin_ids = list(admins)

    active_leases = Lease.objects.select_related('bien__owner', 'locataire__user').filter(statut=StatutBailEnum.ACTIF)

    for lease in active_leases.filter(date_fin__isnull=False, date_fin__lte=lease_deadline, date_fin__gte=today):
        owner_id = lease.bien.owner_id
        recipients = set(admin_ids)
        if owner_id:
            recipients.add(owner_id)

        for recipient_id in recipients:
            alert = create_alert(
                recipient_id=recipient_id,
                alert_type=Alert.AlertType.LEASE_END,
                title='Bail proche de la fin',
                message=f"Le bail {lease.reference} du bien {lease.bien.reference} se termine le {lease.date_fin}.",
                priority=Alert.Priority.HIGH,
                action_url=f"/api/baux/{lease.id}/",
                metadata={'lease_id': lease.id, 'date_fin': str(lease.date_fin)},
                due_at=timezone.make_aware(datetime.combine(lease.date_fin, time.min)),
                entity_type='Lease',
                entity_id=str(lease.id),
            )
            if getattr(alert, '_created', False):
                created_count += 1

    unpaid_payments = RentPayment.objects.select_related('bail__bien__owner').filter(
        statut__in=['impaye', 'partiel'],
        date_paiement__lte=overdue_limit,
    )

    for payment in unpaid_payments:
        lease = payment.bail
        recipients = set(admin_ids)
        if lease.bien.owner_id:
            recipients.add(lease.bien.owner_id)

        for recipient_id in recipients:
            alert = create_alert(
                recipient_id=recipient_id,
                alert_type=Alert.AlertType.UNPAID_RENT,
                title='Loyer impayé à traiter',
                message=(
                    f"Paiement {payment.periode_mois}/{payment.periode_annee} du bail {lease.reference} "
                    f"en statut {payment.statut}. Reste à payer: {payment.reste_a_payer}."
                ),
                priority=Alert.Priority.CRITICAL if payment.statut == 'impaye' else Alert.Priority.HIGH,
                action_url=f"/api/finances/paiements/{payment.id}/",
                metadata={'payment_id': payment.id, 'lease_id': lease.id},
                entity_type='RentPayment',
                entity_id=str(payment.id),
            )
            if getattr(alert, '_created', False):
                created_count += 1

    vacant_properties = Property.objects.filter(status=StatutBienEnum.VACANT)
    for property_obj in vacant_properties.select_related('owner'):
        recipients = set(admin_ids)
        if property_obj.owner_id:
            recipients.add(property_obj.owner_id)

        for recipient_id in recipients:
            alert = create_alert(
                recipient_id=recipient_id,
                alert_type=Alert.AlertType.PROPERTY_VACANT,
                title='Bien vacant',
                message=f"Le bien {property_obj.reference} est vacant et peut être remis en commercialisation.",
                priority=Alert.Priority.MEDIUM,
                action_url=f"/api/immobilier/biens/{property_obj.id}/",
                metadata={'property_id': property_obj.id},
                entity_type='Property',
                entity_id=str(property_obj.id),
            )
            if getattr(alert, '_created', False):
                created_count += 1

    return {
        'created_alerts': created_count,
        'scan_at': now.isoformat(),
        'days_to_lease_end': days_to_lease_end,
        'overdue_days': overdue_days,
    }