# Guide Rapide : Comment Coder avec cette Architecture Django Modulaire

Cette architecture s'inspire du **Domain-Driven Design (DDD)** et de la **Clean Architecture** appliqués à Django (style "Django Styleguide" de HackSoftware). L'objectif est de séparer clairement les données de la logique métier et de l'interface réseau (API).

Oubliez vos `views.py` et `models.py` géants et fourre-tout. Voici le cycle de vie complet d'une fonctionnalité et les conventions en vigueur dans le projet Loxis.

---

## 1. models.py : Les Données Pures
*Ce que vous y mettez* : La structure de la base de données.
*Ce que vous n'y mettez PAS* : De l'envoi d'email, des requêtes API externes, des calculs financiers complexes.

💡 **Règle d'or Soft Delete :** Tous les nouveaux modèles métier doivent hériter de `SoftDeleteModel` (situé dans `apps.core.models`) et non de `models.Model`. Cela permet de ne jamais supprimer définitivement les données, garantissant la sécurité des historiques.

```python
# Exemple dans apps/leases/models.py
from django.db import models
from apps.core.models import SoftDeleteModel

class Bail(SoftDeleteModel):
    reference = models.CharField(max_length=50, unique=True)
    loyer_actuel = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, default='actif')
    
    # Clé étrangère vers un utilisateur (Toujours utiliser settings.AUTH_USER_MODEL !)
    # locataire = models.ForeignKey(settings.AUTH_USER_MODEL, ...)
    
    @property
    def est_actif(self):
        return self.statut == 'actif'
```

*Note : Lors de l'appel à `bail.delete()`, l'enregistrement ne sera pas supprimé de la base mais son champ `is_deleted` passera à `True`.*

---

## 2. services.py : La Logique d'Écriture (Créer, Mettre à jour, Supprimer)
*Ce que vous y mettez* : Tout ce qui modifie l'état du système. C'est ici que vit votre véritable "métier".
*Ce que vous n'y mettez PAS* : Du formatage JSON (Serializers) ou des requêtes HTTP (Requests). Les fonctions de service doivent pouvoir s'exécuter dans un terminal ou un test unitaire sans besoin de l'API.

```python
# Exemple dans apps/leases/services.py
from datetime import date
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Bail

@transaction.atomic
def resilier_bail(*, bail: Bail, date_sortie: date, motif: str) -> Bail:
    """Règle métier : Résilier un bail libère automatiquement le bien associé."""
    
    if bail.statut == 'resilie':
        raise ValidationError("Ce bail est déjà résilié.")
    
    bail.statut = 'resilie'
    bail.date_sortie_effective = date_sortie
    bail.motif_fin = motif
    bail.save()

    # Mise à jour du statut du bien lié
    bien = bail.bien
    bien.statut = 'vacant'
    bien.save()

    return bail
```

---

## 3. selectors.py : La Logique de Lecture (Requêtes complexes)
*Ce que vous y mettez* : Tous les QuerySets complexes, les filtres, les agrégations (ex: Synthèse Financière).
*Ce que vous n'y mettez PAS* : Des opérations de sauvegarde (`.save()`, `.delete()`).

```python
# Exemple dans apps/finances/selectors.py
from django.db.models import Sum
from .models import PaiementLoyer, Depense

def calculer_synthese_financiere(*, bien_id: int) -> dict:
    """Calcule le solde en temps réel sans table dédiée."""
    
    total_revenus = PaiementLoyer.objects.filter(
        bail__bien_id=bien_id, statut__in=['paye', 'partiel']
    ).aggregate(total=Sum('montant_paye'))['total'] or 0
    
    return {"revenus": total_revenus}
```

---

## 4. apis.py : Le Routeur Réseau (Les Vues DRF)
*Ce que vous y mettez* : La réception HTTP (la `request`), la validation entrante (InputSerializer), l'appel au service/selecteur approprié, la vérification des permissions.
*Ce que vous n'y mettez PAS* : DE LA LOGIQUE MÉTIER. L'API ne fait que "passer les plats".

💡 **Exceptions interceptées :** Nous avons configuré une route centralisée (dans `common/utils.py`) qui traduit automatiquement les `django.core.exceptions.ValidationError` (levées par les services) en erreurs compréhensibles par DRF (Erreurs HTTP 400). Vous pouvez donc lever des `ValidationError` classiques dans le métier en toute sérénité !

```python
# Exemple dans apps/leases/apis.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from common.permissions import IsAdminOrOwnerRole

from .models import Bail
from .services import resilier_bail
from .serializers import ResilierBailInputSerializer, BailOutputSerializer

class BailResiliationApi(APIView):
    permission_classes = [IsAdminOrOwnerRole] # Seuls Admin & Owner peuvent résilier
    
    def post(self, request, bail_id):
        bail = get_object_or_404(Bail, id=bail_id)
        
        serializer = ResilierBailInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Le service peut lever des "ValidationError". Le DRF custom handler interceptera.
        bail_resilie = resilier_bail(
            bail=bail,
            **serializer.validated_data
        )
        
        output = BailOutputSerializer(bail_resilie)
        return Response(output.data)
```

---

## 5. Communications / Importations entre applications

L'importation croisée entre applications suit une règle d'or : **Interfacez via les Services ou les Sélecteurs, n'attaquez pas le modèle du voisin de front.**
Une forte exception existe cependant : **Ne ciblez le modèle Utilisateur que par `settings.AUTH_USER_MODEL`** pour éviter les erreurs de type "Circular Import" (Importations circulaires).

Exemple : Si l'application `finances` veut créer une alerte (qui appartient à `core`), elle ne fera pas :
`Alerte.objects.create(...)`

Elle fera :
```python
from apps.core.services import creer_alerte  # Appel au service du voisin

creer_alerte(type="loyer_impaye", destinataire=proprietaire)
```

---

## Résumé : Les 4 Règles d'Or Loxis
1. **Les modèles métier héritent de `SoftDeleteModel`** : `objet.delete()` ne détruit plus la donnée (Sauvegarde de l'historique et Audit Log !).
2. **On protège les routes avec `IsAdminOrOwnerRole`** (voire `IsTenantRole`) dans le tableau `permission_classes` des vus DRF (l'authentification JWT est gérée automatiquement par `IsAuthenticated`).
3. **On isole les données lors des lectures (`Data-Driven Access`)** : Dans les vues DRF, toujours vérifier `self.request.user` pour filtrer les `get_queryset()` afin de s'assurer qu'un locataire ou un propriétaire ne voit que les données qui lui appartiennent.
4. **L'ordre de création d'une fonctionnalité** : Modèles -> Serializers (les DTOs) -> Services/Selectors -> API (DRF) -> URLs.
