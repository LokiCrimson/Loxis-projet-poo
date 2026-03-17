# Guide d'utilisation de l'API Loxis

Ce guide explique les principales fonctionnalités exposées par l'API Backend (Django REST Framework) du système de gestion de patrimoine immobilier Loxis, ainsi que la manière de l'utiliser au quotidien.

## 1. Introduction

L'API de Loxis est une architecture RESTful structurée autour des domaines métiers :
- Utilisateurs (Admin, Locataires, Propriétaires)
- Bien immobiliers (Maisons, Appartements, Meubles)
- Baux & Contrats de location
- Finances (Loyers, Frais, Quittances)
- Système Core (Historique / Audit, Tableau de bord)

L'API utilise une sécurisation par token **JWT (JSON Web Token)** et offre le support du **2FA (Authentification à double facteur)** pour les comptes utilisateurs.

## 2. Authentification & Sécurité

### Connexion et JWT
1. Effectuer une requête `POST` vers `/api/token/` avec votre `email` et `password` (et `otp` si le 2FA est activé).
2. La réponse vous donnera un `access_token` et un `refresh_token`.
3. Chaque requête sécurisée de l'API doit contenir le header : `Authorization: Bearer <access_token>`.

### Authentification à double facteur (2FA)
- **Activer** : Appelez `POST /api/utilisateurs/2fa/activer/` (pour générer le secret et afficher le QR code Google Authenticator).
- **Confirmer** : Appelez `POST /api/utilisateurs/2fa/confirmer/` avec le code généré dans l'application mobile.
- **Connexion** : Si activé, la connexion par `/api/token/` exigera d'inclure le code du téléphone dans le payload JSON.

## 3. Langues Supportées (Internationalisation - i18n)

Toute l'API et les données en base gèrent l'anglais (en) et le français (fr).
Pour recevoir des données dans votre langue ou envoyer des champs traduits, ajoutez ce header dans votre requête HTTP :
```http
Accept-Language: fr
```

## 4. Documentation Automatique (Swagger)

Il est recommandé de consulter la documentation interactive Open API et Swagger, où vous pourrez tester directement chacune des requêtes :
- **Swagger UI** : `http://127.0.0.1:8000/api/docs/`
- **Redoc UI** : `http://127.0.0.1:8000/api/redoc/`

## 5. Cas d'Utilités Principaux (Endpoints)

### A. Gestion Immobilière (`/api/immobilier/`)
C'est le module principal pour recenser l'immobilier, ses photos et le matériel rattaché :
- **Catégories & Types** : Enumération de vos types de batiments (`/categories-biens/`, `/types-biens/`).
- **Création / Liste de Biens** : `GET` ou `POST` sur `/biens/`.
- **Ajout de Photos** : Sur `/biens/<id>/photos/` avec form-data.
- **Gestion de Meubles (Inventaires)** : `/biens/<id>/meubles/` pour l'inventaire lors de baux meublés ou de locations spécifiques.

### B. Gestion des Baux et Locations (`/api/baux/`)
Ce domaine prend en compte la création des contrats (liaison locataire <-> bien) :
- **Créer/Gérer un Bail** : `/baux/` (permet de fixer le loyer initial, le dépôt de garantie et la durée).
- **Renouvellement/Révision** : `/revisez-loyer/` (par exemple lié à l'IRL).

### C. Comptabilité et Finances (`/api/finances/`)
Ce domaine suit automatiquement les dettes et paiements.
- **Paiements (Loyers)** : `/paiements/` pour saisir quand et comment un locataire a payé son mois.
- **Frais (Dépenses/Taxes)** : `/frais/` pour consigner ce que coûte un bien immobilier.
- **Générer Quittance** : `/quittances/<id>/generer/` (Le backend génère le document PDF récapitulatif pour le locataire).

### D. Tableau de Bord (Analytics)
- Récupérez une synthèse financière en temps réel du parc immobilier du propriétaire ou pour toute l'entreprise selon les permissions de l'utilisateur sur `/api/systeme/dashboard/`.

---

> Ce backend utilise l'architecture REST par composants standards. Référez vous aux contrats OpenAPI exposés dans Swagger pour connaître les variables exactes au format JSON ou MultiPart requises.
