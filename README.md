# Django Project - Loxis Gestion Immobilière

Ce projet implémente une solution de gestion immobilière. Pour garder un code maintenable et clair, nous utilisons une architecture modulaire (basée sur les principes du Domain-Driven Design) où chaque domaine métier possède sa propre application Django dans le dossier pps/.

## Architecture des Applications (Dossier pps/)

Pour respecter le diagramme de classes fourni, les 14 tables de la base de données ont été logiquement réparties dans 5 applications (domaines) distinctes :

### 1. users (Gestion des accès et utilisateurs)
Cette application gère l'authentification et les rôles fondamentaux.
- **Entités** : UTILISATEUR
- **Rôles** : Admin, Propriétaire, Locataire.

### 2. properties (Gestion du patrimoine immobilier)
Cette application gère tout ce qui concerne le bien physique en lui-même.
- **Entités** : CATÉGORIE DE BIEN, TYPE DE BIEN, BIEN, PHOTO DE BIEN
- **Logique** : Cohérence des types/catégories, gestion du statut vacant/en_travaux.

### 3. leases (Gestion locative et baux)
Gère toutes les personnes liées à une location et le contrat en lui-même.
- **Entités** : LOCATAIRE, GARANT, BAIL, RÉVISION DE LOYER
- **Logique** : Suivi des locataires, validation du chevauchement des dates des baux.

### 4. inances (Comptabilité et transactions)
Le cœur financier de l'application (permettra de calculer la vue Synthèse Financière).
- **Entités** : PAIEMENT DE LOYER, QUITTANCE, CATÉGORIE DE DÉPENSE, DÉPENSE
- **Logique** : Suivi des impayés, génération automatique des quittances, suivi des charges.

### 5. core (Éléments transverses et système)
Utilitaires et logs s'appliquant à l'ensemble du système.
- **Entités** : ALERTE, JOURNAL D'AUDIT
- **Logique** : Notifications automatisées, traçabilité immuable des actions.

---

## Structure Interne Obtenue pour Chaque Application

Plutôt que d'avoir d'immenses fichiers iews.py et models.py tout emmêlés, chaque application suit une séparation stricte :

- models.py : **Données pures**. Contient les définitions des tables et les relations stricte (ForeignKeys, règles d'unicité, méthodes directes comme alider_coherence_type()).
- services.py : **Logique Métier (Écriture)**. Fonctions pour la création, mise à jour ou suppression (ex: esilier_bail(), ppliquer_revision(), generer_quittance_pdf()). Le journal d'audit est souvent appelé d'ici.
- selectors.py : **Requêtes complexes (Lecture)**. Fonctions pour interroger la base de données (ex: calcul du este_a_payer, calcul de la Synthese Financiere).
- pis.py : **Points d'entrée réseau (Vues DRF)**. Ne contient que l'exposition web, appelle les services.py ou selectors.py.
- serializers.py : Validation et formatage des données JSON.
- urls.py : Routage local de l'application.

---

## Synthèse Financière
Comme spécifié dans le diagramme, aucune table n'existe pour la Synthèse Financière. Elle sera calculée à la volée dans pps/finances/selectors.py en agrégeant les paiements de loyers et les dépenses.
