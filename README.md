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

### 4. `apps/finances/` - Comptabilite et transactions

- **Entites** : PAIEMENT DE LOYER, QUITTANCE, CATEGORIE DE DEPENSE, DEPENSE
- **Logique** : Suivi des impayes, generation automatique des quittances, suivi des charges.

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
| `permissions.py` | Permissions DRF basees sur les roles (`IsAdminRole`, `IsOwnerRole`, `IsTenantRole`) |
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
