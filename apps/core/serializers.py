from rest_framework import serializers

from .models import Alert, AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
	actor_email = serializers.EmailField(source='user.email', read_only=True)

	class Meta:
		model = AuditLog
		fields = [
			'id',
			'timestamp',
			'action',
			'severity',
			'source_app',
			'request_id',
			'entity_name',
			'entity_id',
			'details',
			'user',
			'actor_email',
		]
		read_only_fields = fields


class AlertSerializer(serializers.ModelSerializer):
	recipient_email = serializers.EmailField(source='recipient.email', read_only=True)

	class Meta:
		model = Alert
		fields = [
			'id',
			'recipient',
			'recipient_email',
			'alert_type',
			'title',
			'message',
			'priority',
			'is_actionable',
			'action_url',
			'is_read',
			'read_at',
			'email_sent',
			'related_entity_type',
			'related_entity_id',
			'metadata',
			'due_at',
			'expires_at',
			'created_at',
		]
		read_only_fields = fields


class AlertMarkReadSerializer(serializers.Serializer):
	alert_id = serializers.IntegerField(required=True)


class AlertRefreshSerializer(serializers.Serializer):
	days_to_lease_end = serializers.IntegerField(min_value=1, max_value=120, required=False, default=45)
	overdue_days = serializers.IntegerField(min_value=0, max_value=120, required=False, default=3)
