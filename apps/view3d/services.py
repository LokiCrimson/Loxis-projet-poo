import os

from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone

from apps.core.models import AuditLog
from apps.core.services import log_audit
from apps.properties.models import Property
from apps.users.models import User

from .models import Scene3D, SceneViewLog
from .selectors import can_manage_property_scene, can_view_scene


def create_scene3d(*, property_id: int, data: dict, created_by: User) -> Scene3D:
	property_obj = Property.objects.select_related('owner').get(id=property_id)
	if not can_manage_property_scene(user=created_by, property_obj=property_obj):
		raise PermissionDenied("Vous n'avez pas le droit d'ajouter une scene 3D pour ce bien.")

	source_file = data['source_file']
	file_format = os.path.splitext(source_file.name)[1].lower().lstrip('.') or Scene3D.FileFormat.GLB

	scene = Scene3D.objects.create(
		property=property_obj,
		created_by=created_by,
		title=data['title'],
		description=data.get('description', ''),
		source_file=source_file,
		thumbnail=data.get('thumbnail'),
		file_format=file_format,
		status=Scene3D.Status.READY,
	)

	log_audit(
		actor=created_by,
		action=AuditLog.ActionType.CREATE,
		severity=AuditLog.Severity.INFO,
		entity_name='Scene3D',
		entity_id=str(scene.id),
		details={
			'property_id': property_obj.id,
			'file_format': scene.file_format,
			'is_published': scene.is_published,
		},
		source_app='view3d',
	)
	return scene


def publish_scene3d(*, scene: Scene3D, actor: User) -> Scene3D:
	if not can_manage_property_scene(user=actor, property_obj=scene.property):
		raise PermissionDenied("Vous n'avez pas le droit de publier cette scene 3D.")
	if scene.status != Scene3D.Status.READY:
		raise ValidationError("La scene doit etre prete avant publication.")
	if not scene.is_published:
		scene.is_published = True
		scene.published_at = timezone.now()
		scene.save(update_fields=['is_published', 'published_at', 'updated_at'])
		log_audit(
			actor=actor,
			action=AuditLog.ActionType.UPDATE,
			severity=AuditLog.Severity.INFO,
			entity_name='Scene3D',
			entity_id=str(scene.id),
			details={'property_id': scene.property_id, 'published': True},
			source_app='view3d',
		)
	return scene


def unpublish_scene3d(*, scene: Scene3D, actor: User) -> Scene3D:
	if not can_manage_property_scene(user=actor, property_obj=scene.property):
		raise PermissionDenied("Vous n'avez pas le droit de depublier cette scene 3D.")
	if scene.is_published:
		scene.is_published = False
		scene.save(update_fields=['is_published', 'updated_at'])
		log_audit(
			actor=actor,
			action=AuditLog.ActionType.UPDATE,
			severity=AuditLog.Severity.INFO,
			entity_name='Scene3D',
			entity_id=str(scene.id),
			details={'property_id': scene.property_id, 'published': False},
			source_app='view3d',
		)
	return scene


def record_scene_view(*, scene: Scene3D, user: User, duration_seconds: int = 0, client_ip: str = '') -> SceneViewLog:
	if not can_view_scene(user=user, scene=scene):
		raise PermissionDenied("Vous n'avez pas le droit d'acceder a cette scene 3D.")

	view_log = SceneViewLog.objects.create(
		scene=scene,
		user=user,
		duration_seconds=duration_seconds,
		client_ip=client_ip or None,
	)

	log_audit(
		actor=user,
		action=AuditLog.ActionType.UPDATE,
		severity=AuditLog.Severity.INFO,
		entity_name='Scene3D',
		entity_id=str(scene.id),
		details={
			'event': 'viewed',
			'duration_seconds': duration_seconds,
			'viewer_role': getattr(user, 'role', ''),
		},
		source_app='view3d',
	)
	return view_log
