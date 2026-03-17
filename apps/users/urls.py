from django.urls import path
from . import apis

app_name = 'users'

urlpatterns = [
    # Authentification 2FA
    path('2fa/activer/', apis.Enable2FAApi.as_view(), name='2fa-activer'),
    path('2fa/confirmer/', apis.Confirm2FAApi.as_view(), name='2fa-confirmer'),
    path('2fa/desactiver/', apis.Disable2FAApi.as_view(), name='2fa-desactiver'),

    # Gestion des comptes utilisateurs et rôles
    path('comptes/', apis.UserListCreateApi.as_view(), name='liste-creation-compte'),
    path('comptes/<int:user_id>/', apis.UserDetailApi.as_view(), name='detail-compte'),
    
    # Gestion des dossiers locataires
    path('locataires/', apis.TenantListCreateApi.as_view(), name='liste-creation-locataire'),
    path('locataires/<int:tenant_id>/garants/', apis.GuarantorCreateApi.as_view(), name='ajout-garant-locataire'),
]