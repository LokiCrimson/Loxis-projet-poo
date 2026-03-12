from django.urls import path
from . import apis

app_name = 'users'

urlpatterns = [
    # Gestion des comptes utilisateurs et rôles
    path('comptes/', apis.UserListCreateApi.as_view(), name='liste-creation-compte'),
    path('comptes/<int:user_id>/', apis.UserDetailApi.as_view(), name='detail-compte'),
    
    # Gestion des dossiers locataires
    path('locataires/', apis.TenantListCreateApi.as_view(), name='liste-creation-locataire'),
    path('locataires/<int:tenant_id>/garants/', apis.GuarantorCreateApi.as_view(), name='ajout-garant-locataire'),
]