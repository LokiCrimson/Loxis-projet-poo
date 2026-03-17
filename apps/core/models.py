from django.db import models
from django.utils import timezone
from django.conf import settings

class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        return super().update(is_deleted=True, deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def active(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)
        
    def all_with_deleted(self):
        return SoftDeleteQuerySet(self.model, using=self._db)

class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self):
        super().delete()

class AuditLog(models.Model):
    """CU-05, CU-34 : Journal d'audit immuable"""
    class ActionType(models.TextChoices):
        CREATE = 'CREATE', 'Création'
        UPDATE = 'UPDATE', 'Modification'
        DELETE = 'DELETE', 'Suppression'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ActionType.choices)
    entity_name = models.CharField(max_length=100, verbose_name="Nom de l'entité (ex: Bien, Bail)")
    entity_id = models.CharField(max_length=100, verbose_name="ID de l'entité")
    details = models.JSONField(verbose_name="Détails (Anciennes/Nouvelles valeurs)")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} sur {self.entity_name} le {self.timestamp}"


class Alert(models.Model):
    """CU-11, CU-29 à CU-31 : Système d'alertes"""
    class AlertType(models.TextChoices):
        UNPAID_RENT = 'UNPAID_RENT', 'Loyer impayé'
        LEASE_END = 'LEASE_END', 'Fin de bail proche'
        RENT_REVISION = 'RENT_REVISION', 'Révision de loyer possible'
        LEASE_CREATED = 'LEASE_CREATED', 'Nouveau bail créé'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=30, choices=AlertType.choices)
    message = models.TextField()
    
    # Suivi de la lecture
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Suivi des envois d'emails
    email_sent = models.BooleanField(default=False)
    
    # Contexte métier (Optionnel : permet de lier l'alerte à un bien ou à un bail précis)
    related_entity_type = models.CharField(max_length=100, blank=True)
    related_entity_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Alerte {self.alert_type} pour {self.recipient.email}"