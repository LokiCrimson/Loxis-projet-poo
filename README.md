# Loxis - Gestion Immobiliere

Ce projet implemente une solution de gestion immobiliere. L'architecture est modulaire (Domain-Driven Design) ou chaque domaine metier possede sa propre application Django dans le dossier `apps/`.

---

## Prerequis

- Python 3.12+
- pip (gestionnaire de paquets Python)

## Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd Loxis-projet-poo

# Installer les dependances
py -m pip install -r requirements.txt

# Appliquer les migrations (base SQLite)
py manage.py migrate

# Lancer le serveur de developpement
py manage.py runserver
```

## Base de donnees

Le projet utilise **SQLite** par defaut (fichier `db.sqlite3` a la racine).
La configuration se trouve dans `config/settings/base.py`.

---

## Documentation API (Swagger)

Une fois le serveur lance, la documentation interactive de l'API est accessible :

| URL | Description |
|-----|-------------|
| `http://127.0.0.1:8000/api/docs/` | Interface Swagger UI |
| `http://127.0.0.1:8000/api/redoc/` | Interface ReDoc |
| `http://127.0.0.1:8000/api/schema/` | Schema OpenAPI brut (JSON/YAML) |

La documentation est generee automatiquement par **drf-spectacular**.

---

## Authentification (JWT) & Sécurité

L'API est sécurisée via **JSON Web Tokens (JWT)**.
Pour accéder aux différentes routes protégées, vous devez d'abord obtenir un token d'accès :

- `POST /api/token/` : Obtenir une paire de tokens (`access` et `refresh`) en fournissant vos identifiants (`email` et mot de passe).
- `POST /api/token/refresh/` : Renouveler un token d'accès expiré à l'aide de votre token de rafraîchissement.

**Utilisation des tokens :**
Dans toutes vos requêtes HTTP suivantes en tant qu'utilisateur connecté, incluez le token dans l'en-tête (header) :
`Authorization: Bearer <votre_token_access>`

**Sécurité (Throttling) :**
Pour prévenir les abus et attaques bruteforce, l'API impose des limites :
- Utilisateurs non connectés : `10 requêtes / minute` maximum.
- Utilisateurs identifiés (avec JWT valide) : `100 requêtes / minute` maximum.

---

## Roles utilisateurs

Le systeme gere 3 roles distincts :

| Role | Description |
|------|-------------|
| **ADMIN** | Administrateur - configuration globale, gestion des utilisateurs, journal d'audit |
| **OWNER** | Proprietaire - gestion du patrimoine, consultation des revenus et alertes |
| **TENANT** | Locataire - consultation de son bail, paiements et quittances |

Les permissions basees sur les roles sont definies dans `common/permissions.py`.

---

## Architecture des Applications (Dossier `apps/`)

### 1. `apps/users/` - Gestion des acces et utilisateurs

- **Entites** : `User` (modele personnalise), `TenantProfile`, `Guarantor`
- **Routes API** :
  - `POST/GET /api/utilisateurs/comptes/` - Lister ou creer un compte
  - `GET/PUT /api/utilisateurs/comptes/<id>/` - Detail d'un compte
  - `POST/GET /api/utilisateurs/locataires/` - Lister ou creer un dossier locataire
  - `POST /api/utilisateurs/locataires/<id>/garants/` - Ajouter un garant

### 2. `apps/properties/` - Gestion du patrimoine immobilier

- **Entites** : `PropertyCategory`, `PropertyType`, `Property`, `PropertyPhoto`
- **Logique** : Coherence des types/categories, gestion du statut (vacant/loue/en_travaux), upload de photos avec gestion de la photo principale.
- **Routes API** :
  - `POST/GET /api/immobilier/categories-biens/` - Lister ou creer des categories
  - `POST/GET /api/immobilier/types-biens/` - Lister ou creer des types
  - `POST/GET /api/immobilier/biens/` - Lister ou creer un bien
  - `GET/PUT /api/immobilier/biens/<id>/` - Detail d'un bien
  - `POST /api/immobilier/biens/<id>/statut/` - Changer le statut d'un bien
  - `POST/GET /api/immobilier/biens/<id>/photos/` - Upload et liste des photos

### 3. `apps/leases/` - Gestion locative et baux

- **Entites** : BAIL, REVISION DE LOYER
- **Logique** : Validation du chevauchement des dates des baux.
- **Routes API** :
- `POST/GET /api/baux/` - Lister ou créer un bail
- `GET/PUT /api/baux/<id>/` - Détail ou modification d’un bail
- `POST /api/baux/<id>/resilier/` - Résilier un bail
- `POST/GET /api/baux/<lease_id>/revisions/` - Lister ou créer une révision de loyer pour un bail

### 4. `apps/finances/` - Comptabilite et transactions

- **Entites** : PAIEMENT DE LOYER, QUITTANCE, CATEGORIE DE DEPENSE, DEPENSE
- **Logique** : Suivi des impayes, generation automatique des quittances, suivi des charges.
- **Routes API** :
- `POST/GET /finances/paiements/ `- Lister ou créer un paiement de loyer
- `GET/PUT /finances/paiements/<id>/ `- Détail ou modification d’un paiement
- `GET /finances/paiements/<id>/quittance/ `- Télécharger la quittance de paiement
- `POST /finances/paiements/<id>/renvoyer/ `- Renvoyer la quittance au locataire
- `GET /finances/impayes/` - Lister les loyers impayés
- `POST/GET /finances/depenses/` - Lister ou créer une dépense
- `GET /finances/rapport/<property_id>/` - Générer le rapport financier d’un bien
- `GET /finances/export/` - Exporter les données financières (CSV, Excel, etc.)

### 5. `apps/core/` - Elements transverses et systeme

- **Entites** : `AuditLog`, `Alert`
- **Logique** : Notifications automatisees, tracabilite immuable des actions.
- **Routes API** :
  - `GET /api/systeme/journal-audit/` - Consulter le journal d'audit
  - `GET /api/systeme/alertes/` - Lister les alertes
  - `POST /api/systeme/alertes/<id>/marquer-lu/` - Marquer une alerte comme lue

---

## Structure Interne de Chaque Application

| Fichier | Responsabilite |
|---------|----------------|
| `models.py` | **Donnees pures** - Definitions des tables, relations, regles d'unicite |
| `services.py` | **Logique Metier (Ecriture)** - Creation, mise a jour, suppression, appel au journal d'audit |
| `selectors.py` | **Requetes complexes (Lecture)** - Agregations, calculs dynamiques |
| `apis.py` | **Points d'entree reseau (Vues DRF)** - Exposition web, appelle services/selectors |
| `serializers.py` | Validation et formatage des donnees JSON |
| `urls.py` | Routage local de l'application |

---

## Dossier `common/` - Code partage

| Fichier | Description |
|---------|-------------|
| `permissions.py` | Permissions DRF basees sur les roles (`IsAdminRole`, `IsOwnerRole`, `IsTenantRole`, `IsAdminOrOwnerRole`) |
| `utils.py` | Gestionnaire d'exceptions personnalise pour formater les erreurs API |

---

## Dossier `config/` - Configuration Django

| Fichier | Description |
|---------|-------------|
| `settings/base.py` | Configuration commune (apps, middleware, DRF, Swagger, SQLite) |
| `settings/local.py` | Surcharges pour le developpement local |
| `settings/production.py` | Surcharges pour la production |
| `urls.py` | Routeur principal - regroupe toutes les routes API et Swagger |
| `wsgi.py` | Point d'entree WSGI pour le deploiement |

---

## Upload de photos

Les photos des biens immobiliers peuvent etre uploadees via l'endpoint :

```
POST /api/immobilier/biens/<id>/photos/
```

- Format : `multipart/form-data`
- Champs : `image` (fichier), `is_main` (booleen), `display_order` (entier)
- Les fichiers sont stockes dans le dossier `media/properties/photos/`
- Une seule photo principale est autorisee par bien

---

## Synthese Financiere

Aucune table n'existe pour la Synthese Financiere. Elle sera calculee a la volee dans `apps/finances/selectors.py` en agregeant les paiements de loyers et les depenses.

---

## Historique d'avancement et traçabilité

### Révision de l'architecture et corrections (16 Mars 2026)

L'implémentation ayant évolué par rapport aux diagrammes initiaux, plusieurs adaptations ont été effectuées pour aligner le code avec les bonnes pratiques et les nouvelles règles métier (retrait effectif des rôles `Agent` et `Comptable`).

**1. Gestion des rôles et sécurisation :**
- Ajout de la classe de permission `IsAdminOrOwnerRole` (dans `common/permissions.py`) afin de confier les anciens droits Agent/Comptable aux administrateurs ou propriétaires.
- Les points d'API sensibles de `leases` et `finances` sont dorénavant correctement verrouillés derrière cette restriction de sécurité.

**2. Audit et Traçabilité (CU-34) :**
- Fiabilisation intégrale du système de logs d'audit. Les appels `AuditLog` erronés provoquant des exceptions critiques (500) ont été remplacés par la fonction utilitaire `apps.core.services.log_audit`.
- Capture correcte des états `avant` / `après` (via la sérialisation `model_to_dict`) lors de la modification d'un bail (résiliation) ou de l'application d'une révision de loyer afin de garantir l'immuabilité et la pertinence de la trace.

**3. Fiabilisation du cœur métier :**
- **Résiliation de Bail (CU-16) :** Renforcement de la génération de dépense liée à la retenue sur le dépôt de garantie (`ExpenseCategory.objects.get_or_create`) pour éviter tout plantage si la catégorie n'avait pas été préalablement paramétrée.
- **Alertes Locataire (CU-15) :** Vérification de l'existence du profil utilisateur `user` attaché à un dossier locataire (`TenantProfile`) avant de lancer la création de l'alerte pour empêcher les erreurs d'attribut nul.
- **Logique de Dette (CU-33) :** Refonte du mécanisme de report de dette de loyer. Placé dans les services asynchrones (`report_debt_to_next_month`), il ajoute la dette résiduelle au reliquat du mois M+1, sans casser la contrainte d'unicité temporelle en base de données.

**4. Gestion des Exceptions (API REST) :**
- Interface entre Django et Django-Rest-Framework réparée : Toutes les validations métier levant une `django.core.exceptions.ValidationError` sont capturées dans les services/serializers et traduites en `rest_framework.exceptions.ValidationError`.
- Résultat : Les clients API reçoivent des retours formattés et standards `HTTP 400 Bad Request` au lieu d'un crash `HTTP 500` incompréhensible.

### Implémentation du Soft Delete et Corrections (16 Mars 2026)

**1. Stratégie de Soft Delete (Suppression logique) intégrée :**
- Déploiement d'un comportement de suppression logique via la création d'un modèle abstrait `SoftDeleteModel` (géré par un manager et un queryset sur-mesure dans l'application `core`).
- Substitution de l'héritage standard `models.Model` par `SoftDeleteModel` pour l'ensemble des entités de la plateforme (Biens, Baux, Utilisateurs, Transactions). Ainsi, les commandes `.delete()` n'effacent plus physiquement les enregistrements ; elles mettent à jour le booléen `is_deleted` et la date `deleted_at`.
- Objectif atteint : Garantie totale de l'intégrité de la base de données, des historiques financiers et du journal d'audit en tout temps.

**2. Résolution des dépendances circulaires & erreurs de routage :**
- L'injection du `SoftDeleteModel` abstrait (placé dans `core.models`) a entraîné de lourdes erreurs d'imports circulaires (`ImportError`) avec les applications connexes (ex: `User`). Solution : Adoption de la bonne pratique de Django consistant à utiliser `django.conf.settings.AUTH_USER_MODEL` pour les clés étrangères liant les modèles aux utilisateurs.
- Validation de l'arborescence des urls. Fait : Garantie de la présence des attributs `app_name = "xxx"` réclamés par les espaces de noms `include(XXX, namespace="xxx")`.

### Déploiement de l'Architecture de Sécurité "Standard API REST" (16 Mars 2026)

**1. Authentification par JWT (JSON Web Tokens) :**
- Intégration de la librairie `djangorestframework-simplejwt`.
- Le mécanisme de session par défaut de DRF a été remplacé par l'authentification token (`rest_framework_simplejwt.authentication.JWTAuthentication`).
- Endpoints mis en place pour l'identification sécurisée : `POST /api/token/` (login) et `POST /api/token/refresh/` (renouvellement).

**2. Sécurisation Anti-Abus (Throttling) :**
- Activation du Rate Limiting natif de DRF pour éviter le bruteforce ou le déni de service.
- Limitation à 10 requêtes / minute pour les utilisateurs non connectés et 100 requêtes / minute pour les utilisateurs identifiés, sur tous les points d'exposition API.

**3. Isolation des données (Data-Driven Access) :**
- Tous les endpoints en lecture (`get_queryset`) utilisent désormais l'identité de l'utilisateur connecté pour filtrer les données à la racine de la requête base de données (Row-level context).
- Correction d'un bug critique où le rôle "locataire" (chaîne francisée) était testé pour les données du locataire au lieu du code strict `User.Role.TENANT`. Un locataire ne peut désormais lister *que* ses propres baux et *que* ses propres quittances.

---

## Perspectives d'Évolution et Améliorations Futures

L'architecture actuelle modulaire (Domain-Driven Design) assure la scalabilité du projet et constitue une excellente base. Pour rendre l'application encore plus complète sur le marché de la PropTech (technologie de l'immobilier), voici les évolutions envisagées :

### Nouvelles Fonctionnalités Métier
1. **Module de Ticketing & Maintenance (Incidents) :**
   - Possibilité pour le locataire de déclarer un incident (fuite, panne) avec photos depuis l'interface.
   - Suivi de la résolution par le propriétaire/administrateur.
   - *Architecture :* Ajout d'une application `apps/maintenance/`.

2. **Paiement en Ligne :**
   - Intégration d'une API de paiement (Stripe ou PayPal) pour le règlement des loyers par les locataires.
   - Rapprochement bancaire et génération des quittances totalement automatisés suite au succès du paiement.

3. **Signature Électronique des Baux :**
   - Intégration d'un prestataire tiers (ex: DocuSign, Yousign) pour officialiser numériquement les contrats créés.

4. **Module d'Aide à la Déclaration Fiscale :**
   - Regroupement des revenus encaissés et des charges déductibles par année fiscale pour renseigner automatiquement les liasses fiscales (ex: LMNP, revenus fonciers).

5. **Gestion Électronique des Documents (GED) Avancée :**
   - Suivi des dates réglementaires (Diagnostics de performance, Amiante, Plomb) avec déclenchement d'alertes automatiques avant leur expiration.

### Améliorations Techniques Futures
1. **Automatisation asynchrone (Celery + Redis) :**
   - Pour l'exécution stricte des routines système identifiées (CU-29, CU-30 pour les alertes de retard ou de fin de bail), nécessitant un worker en tâche de fond (`Celery Beat`).

2. **Optimisation des performances (Système de Cache) :**
   - Cache serveur (ex: Redis local) pour réduire les requêtes sur la base de données lors du calcul à la volée du `Tableau de bord` (spécialement pour les gros portefeuilles de biens comprenant un large historique comptable).

3. **Couverture de tests unitaires et d'intégration :**
   - Utilisation de `pytest` et `pytest-django` sur la couche des services pour sécuriser les sous-routines critiques à risques financiers (génération de quittances, calcul de dette en report, encaissement de loyer, refacturations).
