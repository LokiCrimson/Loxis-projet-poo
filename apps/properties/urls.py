from django.urls import path
from . import apis

app_name = 'properties'

urlpatterns = [
    # Gestion des catégories et types de biens
    path('categories-biens/', apis.CategoryListCreateApi.as_view(), name='liste-creation-categorie'),
    path('types-biens/', apis.TypeListCreateApi.as_view(), name='liste-creation-type'),
    
    # Gestion des biens immobiliers
    path('biens/', apis.PropertyListCreateApi.as_view(), name='liste-creation-bien'),
    path('biens/<int:property_id>/', apis.PropertyDetailApi.as_view(), name='detail-bien'),
    path('biens/<int:property_id>/statut/', apis.PropertyStatusUpdateApi.as_view(), name='mise-a-jour-statut-bien'),
    path('biens/<int:property_id>/photos/', apis.PropertyPhotoListCreateApi.as_view(), name='gestion-photos-bien'),
]