from django.db.models import QuerySet

from apps.leases.models import Lease, StatutBailEnum
from apps.users.models import User

from .models import Scene3D


def get_visible_scenes_for_user(user) -> QuerySet[Scene3D]:
	queryset = Scene3D.objects.select_related('property__owner', 'created_by')

	if not getattr(user, 'is_authenticated', False):
		return queryset.none()
	if getattr(user, 'role', None) == User.Role.ADMIN:
		return queryset
	if getattr(user, 'role', None) == User.Role.OWNER:
		return queryset.filter(property__owner=user)
	if getattr(user, 'role', None) == User.Role.TENANT:
		return queryset.filter(
			is_published=True,
			status=Scene3D.Status.READY,
			property__leases__locataire__user=user,
			property__leases__statut=StatutBailEnum.ACTIF,
		).distinct()
	return queryset.none()


def can_manage_property_scene(*, user, property_obj) -> bool:
	if not getattr(user, 'is_authenticated', False):
		return False
	if getattr(user, 'role', None) == User.Role.ADMIN:
		return True
	return getattr(user, 'role', None) == User.Role.OWNER and property_obj.owner_id == user.id


def can_view_scene(*, user, scene: Scene3D) -> bool:
	if not getattr(user, 'is_authenticated', False):
		return False
	if getattr(user, 'role', None) == User.Role.ADMIN:
		return True
	if getattr(user, 'role', None) == User.Role.OWNER:
		return scene.property.owner_id == user.id
	if getattr(user, 'role', None) != User.Role.TENANT:
		return False
	if not scene.is_published or scene.status != Scene3D.Status.READY:
		return False
	return Lease.objects.filter(
		bien_id=scene.property_id,
		locataire__user=user,
		statut=StatutBailEnum.ACTIF,
	).exists()
