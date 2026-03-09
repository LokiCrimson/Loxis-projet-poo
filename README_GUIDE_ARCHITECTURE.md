# Guide Rapide : Comment Coder avec cette Architecture Django Modulaire

Cette architecture s'inspire du **Domain-Driven Design (DDD)** et de la **Clean Architecture** appliqués à Django (style "Django Styleguide" de HackSoftware). L'objectif est de séparer clairement les données de la logique métier et de l'interface réseau (API).

Oubliez vos iews.py et models.py géants et fourre-tout. Voici le cycle de vie complet d'une fonctionnalité.

---

## 1. models.py : Les Données Pures
*Ce que vous y mettez* : La structure de la base de données.
*Ce que vous n'y mettez PAS* : De l'envoi d'email, des requêtes API externes, des calculs financiers complexes.

`python
# Exemple dans apps/leases/models.py
from django.db import models

class Bail(models.Model):
    reference = models.CharField(max_length=50, unique=True)
    loyer_actuel = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, default='actif')
    
    # Propriétés calculées simples et liées *uniquement* à cette instance
    @property
    def est_actif(self):
        return self.statut == 'actif'
`

---

## 2. services.py : La Logique d'Écriture (Créer, Mettre à jour, Supprimer)
*Ce que vous y mettez* : Tout ce qui modifie l'état du système. C'est ici que vit votre véritable "métier".
*Ce que vous n'y mettez PAS* : Du formatage JSON (Serializers) ou des requêtes HTTP (Requests). Les fonctions de service doivent pouvoir s'exécuter dans un terminal ou un test unitaire sans besoin de l'API.

`python
# Exemple dans apps/leases/services.py
from datetime import date
from django.db import transaction
from .models import Bail
from apps.properties.models import Bien

@transaction.atomic
def resilier_bail(*, bail: Bail, date_sortie: date, motif: str) -> Bail:
    """Règle métier : Résilier un bail libère automatiquement le bien associé."""
    
    bail.statut = 'resilie'
    bail.date_sortie_effective = date_sortie
    bail.motif_fin = motif
    bail.save()

    # Mise à jour du statut du bien lié
    bien = bail.bien
    bien.statut = 'vacant'
    bien.save()

    # (Ici vous pourriez appeler un service de core pour ajouter une entrée d'Audit)
    
    return bail
`

---

## 3. selectors.py : La Logique de Lecture (Requêtes)
*Ce que vous y mettez* : Tous les QuerySets complexes, les filtres, les agrégations (ex: Synthèse Financière).
*Ce que vous n'y mettez PAS* : Des opérations de sauvegarde (.save(), .update(), .delete()).

`python
# Exemple dans apps/finances/selectors.py
from django.db.models import Sum
from .models import PaiementLoyer, Depense

def calculer_synthese_financiere(*, bien_id: int) -> dict:
    """Calcule le solde en temps réel sans table dédiée."""
    
    total_revenus = PaiementLoyer.objects.filter(
        bail__bien_id=bien_id, statut__in=['paye', 'partiel']
    ).aggregate(total=Sum('montant_paye'))['total'] or 0
    
    total_depenses = Depense.objects.filter(
        bien_id=bien_id
    ).aggregate(total=Sum('montant'))['total'] or 0

    return {
        "revenus": total_revenus,
        "depenses": total_depenses,
        "solde": total_revenus - total_depenses
    }
`

---

## 4. pis.py : Le Routeur Réseau (Les Vues)
*Ce que vous y mettez* : La réception HTTP (equest), la validation entrante (InputSerializer), l'appel au service/selecteur approprié, le renvoi sortant (OutputSerializer, Response).
*Ce que vous n'y mettez PAS* : DE LA LOGIQUE MÉTIER. L'API ne fait que passer les plats. Mettre de la logique ici vous empêche de la réutiliser (ex: via une commande terminal manage.py scripts).

`python
# Exemple dans apps/leases/apis.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Bail
from .services import resilier_bail
from .serializers import ResilierBailInputSerializer, BailOutputSerializer

class BailResiliationApi(APIView):
    def post(self, request, bail_id):
        # 1. Je récupère l'instance
        bail = get_object_or_404(Bail, id=bail_id)
        
        # 2. Je valide les entrées JSON de l'utilisateur
        serializer = ResilierBailInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 3. J'appelle la Logique Métier PURE (le Service)
        bail_resilie = resilier_bail(
            bail=bail,
            date_sortie=serializer.validated_data['date_sortie'],
            motif=serializer.validated_data.get('motif', '')
        )
        
        # 4. Je prépare la réponse JSON en sortie
        output = BailOutputSerializer(bail_resilie)
        return Response(output.data, status=status.HTTP_200_OK)
`

---

## 5. Comment les applications communiquent-elles entre elles ?

L'importation croisée entre applications suit une règle d'or : **Interfacez via les Services ou les Sélecteurs, n'attaquez pas le modèle du voisin de front si c'est pour écrire**.

Exemple : Si l'application inances veut créer une alerte (qui appartient à core), elle ne fera pas :
Alerte.objects.create(...)

Elle fera :
`python
from apps.core.services import creer_alerte  # Appel au service du voisin

creer_alerte(type="loyer_impaye", destinataire=proprietaire)
`

## Pour résumer l'ordre de création d'une fonctionnalité :
1. Créez les tables (si nouveau) dans models.py.
2. Dessinez vos inputs/outputs en JSON dans serializers.py.
3. Écrivez la mécanique ou la requête dans services.py ou selectors.py.
4. Liez l'HTTP avec votre logique métier dans pis.py.
5. Branchez l'URL correspondante dans urls.py.
