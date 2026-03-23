from django.db.models import Q

from .models import Alert, AuditLog


def get_alerts_for_user(*, user, unread_only=False, priority=None, limit=50):
	queryset = Alert.objects.filter(recipient=user)
	if unread_only:
		queryset = queryset.filter(is_read=False)
	if priority:
		queryset = queryset.filter(priority=priority)
	return queryset[:limit]


def get_unread_alert_count(*, user):
	return Alert.objects.filter(recipient=user, is_read=False).count()


def get_recent_audit_logs(*, actor=None, entity_name=None, action=None, search=None, limit=100):
	queryset = AuditLog.objects.select_related('user').all()
	if actor:
		queryset = queryset.filter(user=actor)
	if entity_name:
		queryset = queryset.filter(entity_name__iexact=entity_name)
	if action:
		queryset = queryset.filter(action=action)
	if search:
		queryset = queryset.filter(
			Q(entity_name__icontains=search)
			| Q(entity_id__icontains=search)
			| Q(details__icontains=search)
		)
	return queryset[:limit]
