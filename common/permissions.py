from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    """Accès réservé aux administrateurs"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )

class IsOwnerRole(BasePermission):
    """Accès réservé aux propriétaires"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'OWNER'
        )

class IsTenantRole(BasePermission):
    """Accès réservé aux locataires"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'TENANT'
        )