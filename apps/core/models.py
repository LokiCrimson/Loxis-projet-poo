from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """Journal d'audit immuable pour les actions metier critiques."""

    class ActionType(models.TextChoices):
        CREATE = 'CREATE', 'Création'
        UPDATE = 'UPDATE', 'Modification'
        DELETE = 'DELETE', 'Suppression'
        LOGIN = 'LOGIN', 'Connexion'
        LOGOUT = 'LOGOUT', 'Déconnexion'
        PAYMENT = 'PAYMENT', 'Paiement'
        ALERT = 'ALERT', 'Alerte'

    class Severity(models.TextChoices):
        INFO = 'INFO', 'Info'
        WARNING = 'WARNING', 'Avertissement'
        CRITICAL = 'CRITICAL', 'Critique'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ActionType.choices)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.INFO)
    entity_name = models.CharField(max_length=100, verbose_name="Nom de l'entité (ex: Bien, Bail)")
    entity_id = models.CharField(max_length=100, verbose_name="ID de l'entité")
    source_app = models.CharField(max_length=50, blank=True, default='core')
    request_id = models.CharField(max_length=64, blank=True, default='')
    details = models.JSONField(verbose_name="Détails (Anciennes/Nouvelles valeurs)", default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['entity_name', 'entity_id']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.action} sur {self.entity_name} le {self.timestamp}"


class Alert(models.Model):
    """Alerte actionnable pour les acteurs du cycle de location."""

    class AlertType(models.TextChoices):
        UNPAID_RENT = 'UNPAID_RENT', 'Loyer impayé'
        LEASE_END = 'LEASE_END', 'Fin de bail proche'
        RENT_REVISION = 'RENT_REVISION', 'Révision de loyer possible'
        LEASE_CREATED = 'LEASE_CREATED', 'Nouveau bail créé'
        PAYMENT_DUE_SOON = 'PAYMENT_DUE_SOON', 'Paiement bientôt dû'
        PROPERTY_VACANT = 'PROPERTY_VACANT', 'Bien vacant'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Faible'
        MEDIUM = 'MEDIUM', 'Moyenne'
        HIGH = 'HIGH', 'Haute'
        CRITICAL = 'CRITICAL', 'Critique'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=40, choices=AlertType.choices)
    title = models.CharField(max_length=180, default='Alerte système')
    message = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    is_actionable = models.BooleanField(default=True)
    action_url = models.CharField(max_length=255, blank=True, default='')

    # Suivi de la lecture
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Suivi des envois d'emails
    email_sent = models.BooleanField(default=False)

    # Contexte métier (Optionnel : permet de lier l'alerte à un bien ou à un bail précis)
    related_entity_type = models.CharField(max_length=100, blank=True)
    related_entity_id = models.CharField(max_length=100, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read', '-created_at']),
            models.Index(fields=['alert_type', '-created_at']),
            models.Index(fields=['priority', '-created_at']),
        ]

    def __str__(self):
        return f"Alerte {self.alert_type} pour {self.recipient.email}"