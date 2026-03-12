from django.utils import timezone
from .models import AuditLog, Alert

def log_audit(*, actor=None, action: str, entity_name: str, entity_id: str, details: dict) -> AuditLog:
    """CU-34 : Enregistrer une action dans le journal d'audit (Immuable)"""
    log_entry = AuditLog.objects.create(
        user=actor,
        action=action,
        entity_name=entity_name,
        entity_id=entity_id,
        details=details
    )
    return log_entry

def create_alert(*, recipient_id: int, alert_type: str, message: str, **kwargs) -> Alert:
    """CU-29, 30, 31 : Créer une alerte (et potentiellement envoyer un email via Celery)"""
    alert = Alert.objects.create(
        recipient_id=recipient_id,
        alert_type=alert_type,
        message=message,
        related_entity_type=kwargs.get('entity_type', ''),
        related_entity_id=kwargs.get('entity_id', '')
    )
    
    # Ici, vous pourriez déclencher une tâche Celery pour envoyer l'email
    # send_alert_email_task.delay(alert.id)
    
    return alert

def mark_alert_as_read(*, alert_id: int, user_id: int) -> Alert:
    """CU-11 : Marquer une alerte comme lue"""
    alert = Alert.objects.get(id=alert_id, recipient_id=user_id)
    if not alert.is_read:
        alert.is_read = True
        alert.read_at = timezone.now()
        alert.save(update_fields=['is_read', 'read_at'])
    return alert