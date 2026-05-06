# DataShare : Prototype MVP

Plateforme de **transfert sécurisé de fichiers** développée dans le cadre du projet OpenClassrooms « Pilotez le développement d'une solution informatique ».

DataShare permet à des utilisateurs anonymes ou enregistrés de **téléverser un fichier** et d'obtenir un **lien de téléchargement temporaire**, optionnellement protégé par un mot de passe et avec une expiration configurable.

> Développé avec un copilote IA cantonné à un périmètre restreint (intégration UI react-aria, tests, première rédaction documentaire) et systématiquement supervisé. Voir la [section IA](#ia--pilotage-du-copilote).

---

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancer l'application](#lancer-lapplication)
- [Tests](#tests)
- [Build et déploiement](#build-et-déploiement)
- [Structure du projet](#structure-du-projet)
- [Documentation complémentaire](#documentation-complémentaire)
- [Conventions de commit](#conventions-de-commit)
- [IA : pilotage du copilote](#ia--pilotage-du-copilote)
- [Parcours du projet](#parcours-du-projet)

---

## Aperçu

| Aspect | Détail |
|---|---|
| **Type** | Application full-stack (SPA + API REST) |
| **Public visé** | Utilisateurs anonymes ou enregistrés |
| **Statut** | Prototype MVP : démonstration investisseurs |

---

## Fonctionnalités

### MVP livré

| ID | User Story | Statut |
|---|---|---|
| US01 | Upload d'un fichier avec compte | ✅ |
| US02 | Téléchargement via lien unique | ✅ |
| US03 | Création de compte | ✅ |
| US04 | Connexion utilisateur (JWT) | ✅ |
| US05 | Consultation de l'historique personnel | ✅ |
| US06 | Suppression d'un fichier | ✅ |

### Fonctionnalités avancées implémentées

| ID | User Story | Statut |
|---|---|---|
| US07 | Upload anonyme | ✅ |
| US09 | Mot de passe par fichier (BCrypt + header `X-File-Password`) | ✅ |
| US10 | Expiration automatique (1 à 7 jours) | ✅ |
| US08 | Gestion des tags | ❌ Écarté du MVP |

---

## Stack technique

| Élément | Choix | Justification courte |
|---|---|---|
| Frontend | React 19, TypeScript, Vite 7 | Écosystème mature, build rapide, typage fort |
| UI | react-aria-components | Accessibilité native (WCAG) |
| Routage | React Router 7 | Standard, support `Outlet` pour `ProtectedRoute` |
| HTTP | Axios | Intercepteurs (JWT, 401 → /login, lecture des Blob d'erreur) |
| Tests front | Vitest + Testing Library | Compatible Vite, API proche de Jest |
| Backend | Java 21, Spring Boot 3 | Robuste, écosystème complet |
| Sécurité | Spring Security + JJWT | BCrypt, JWT HMAC-SHA256 |
| ORM | Spring Data JPA + Hibernate | CRUD productif |
| Tests back | JUnit 5 + Mockito + MockMvc | Standard Spring |
| BDD | PostgreSQL 16 | ACID, indexation puissante |
| Stockage fichiers | Filesystem local (`backend/uploads/`) | Suffisant MVP, migration S3 prévue v1.2 |

Détail complet et alternatives examinées : voir [`docs/DataShare_Documentation_Technique.pdf`](docs/DataShare_Documentation_Technique.pdf).

---

## Architecture

```
+---------------------------+   HTTPS / JSON     +---------------------------+
|  CLIENT : React 19        | <--------------->  |  API : Spring Boot 3      |
|  Vite + TypeScript        |   JWT (Bearer)     |  Spring Security + JPA    |
+---------------------------+                    +-------------+-------------+
                                                               |
                       +-----------------+    JDBC             |
                       |  PostgreSQL 16  | <-------------------+
                       +-----------------+                     |
                                                               |
                       +--------------------------------+      |
                       |  Stockage local                |  <---+
                       |  backend/uploads/<UUID>        |
                       +--------------------------------+
```

- API REST stateless préfixée par `/api`
- Authentification : JWT Bearer dans le header `Authorization`
- Mot de passe fichier : header HTTP `X-File-Password` (jamais en query string)
- Expiration des fichiers : nettoyage par tâche planifiée (US10)

---

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 22 |
| npm | 10 |
| Java | 21 (LTS) |
| Maven | 3.9 |
| PostgreSQL | 16 |
| Git | 2.40 |

---

## Installation

### 1. Cloner le repo

```bash
git clone https://github.com/astriiiixxxx/Projet3.git
cd Projet3
```

### 2. Installer les dépendances

```bash
# Backend
cd backend && mvn install -DskipTests
cd ..

# Frontend
cd frontend && npm install
cd ..
```

### 3. Initialiser la base de données

```bash
# Connexion à PostgreSQL
psql -h localhost -U postgres -d postgres

# Dans psql
CREATE DATABASE projet3;
\q
```

Le schéma est créé automatiquement au premier démarrage du backend (`spring.jpa.hibernate.ddl-auto=update`).

> Si tu as déjà une base existante, n'oublie pas que `owner_id` dans `stored_files` doit être nullable (US07 : upload anonyme) :
> ```sql
> ALTER TABLE stored_files ALTER COLUMN owner_id DROP NOT NULL;
> ```

---

## Configuration

### Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `DB_PASSWORD` | ✅ | Mot de passe du compte PostgreSQL |
| `JWT_SECRET` | ✅ | Clé HMAC-SHA256 base64 (≥ 256 bits) |

### Génération du secret JWT

```bash
export JWT_SECRET=$(openssl rand -base64 64)
echo $JWT_SECRET
```

### Fichier `backend/src/main/resources/application.properties`

```properties
server.port=8000
spring.datasource.url=jdbc:postgresql://localhost:5432/projet3
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=86400000
app.file.upload-dir=uploads
app.file.max-size-bytes=10485760
app.file.default-expiration-days=7
app.file.max-expiration-days=7
```

---

## Lancer l'application

### En développement

Ouvrir deux terminaux :

```bash
# Terminal 1 : backend
cd backend
export DB_PASSWORD=...
export JWT_SECRET=...
mvn spring-boot:run
# → http://localhost:8000
```

```bash
# Terminal 2 : frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### Vérification

| URL | Attendu |
|---|---|
| http://localhost:5173 | Page d'accueil (fond orange + bouton noir) |
| http://localhost:5173/upload | Formulaire d'envoi |
| http://localhost:5173/ui-preview | Catalogue du design system (utile en debug) |

---

## Tests

### Backend (JUnit + Mockito + MockMvc)

```bash
cd backend
mvn test
```

Couvre : `JwtService`, `JwtAuthenticationFilter`, `AuthService`, `FileService` (upload, password BCrypt, expiration, rejet fichier vide / extension interdite / taille max / mot de passe trop court, getMyFiles, suppression), `FileController` (intégration MockMvc en mode standalone).

### Frontend (Vitest + Testing Library)

```bash
cd frontend
npm run test:run             # exécution unique
npm run test                  # mode watch
npm run test:coverage         # rapport de couverture
```

Couvre : `jwtUtils`, `AuthContext`, `axios` (intercepteur 401), `UploadForm`, `UploadPage`, `DownloadPage` (états avec/sans mot de passe + erreurs backend), `MySpacePage` (liste, suppression, erreur, état vide).

### Tests end-to-end (à brancher)

Cypress prévu dans le plan (TESTING.md). Au moins 2 scénarios critiques :
1. Upload anonyme + ouverture du lien public + saisie mot de passe → succès
2. Inscription → connexion → upload → consultation espace → suppression

---

## Build et déploiement

### Build production

```bash
# Backend → JAR exécutable
cd backend
mvn clean package
# → backend/target/backend-0.0.1-SNAPSHOT.jar

# Frontend → bundle statique
cd frontend
npm run build
# → frontend/dist/
```

### Lancement du JAR

```bash
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar \
  --spring.datasource.password=$DB_PASSWORD \
  --app.jwt.secret=$JWT_SECRET
```

### Servir le frontend

Le bundle `frontend/dist/` est statique : à servir derrière un reverse-proxy (Nginx, Caddy) ou via un service de hosting (Vercel, Netlify, S3+CloudFront).

### Docker (à venir)

`docker-compose.yml` est prévu pour orchestrer : PostgreSQL + backend + frontend (Nginx). Squelette à compléter en v1.1.

---

## Structure du projet

```
projet3/
├── backend/
│   ├── src/
│   │   ├── main/java/com/datashare/backend/
│   │   │   ├── config/        # SecurityConfig, FileStorageProperties, CorsConfig
│   │   │   ├── controller/    # AuthController, FileController
│   │   │   ├── dto/           # AuthRequest/Response, UploadFileResponse, etc.
│   │   │   ├── entity/        # User, StoredFile
│   │   │   ├── exception/     # GlobalExceptionHandler, exceptions métier
│   │   │   ├── repository/    # Spring Data JPA
│   │   │   ├── security/      # JwtService, JwtAuthenticationFilter
│   │   │   └── service/       # AuthService, FileService, FileStorageService
│   │   └── main/resources/
│   │       └── application.properties
│   ├── src/test/java/         # Tests unitaires + intégration
│   ├── uploads/               # Stockage fichiers (gitignored)
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/               # axios.ts, authApi.ts
│   │   ├── components/
│   │   │   ├── files/         # UploadForm
│   │   │   └── ui/            # AppButton, AppTextField, AppCallout, AppHeader,
│   │   │                      # AppSelect, AppSegmentedControl
│   │   ├── pages/             # HomePage, LoginPage, RegisterPage, UploadPage,
│   │   │                      # DownloadPage, MySpacePage, UiPreviewPage
│   │   ├── routes/            # AppRouter
│   │   ├── services/          # fileApi
│   │   ├── types/             # Types TS partagés
│   │   ├── AuthContext.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── docs/
│   ├── DataShare_Documentation_Technique.pdf
│   └── SOUTENANCE_NOTES.md
│
├── README.md                  # Ce fichier
├── TESTING.md                 # Plan de tests
├── SECURITY.md                # Politique de sécurité + scan deps
├── PERF.md                    # Performance et budgets
├── MAINTENANCE.md             # Cycle de vie, sauvegardes, opérations
└── REPO_LINK.txt              # Lien repo (livrable)
```

---

## Documentation complémentaire

| Document | Sujet | Public |
|---|---|---|
| [`docs/DataShare_Documentation_Technique.pdf`](docs/DataShare_Documentation_Technique.pdf) | Documentation technique complète (8 sections) | Évaluateur, responsable produit |
| [`TESTING.md`](TESTING.md) | Plan de tests, critères, exécution | QA, dev |
| [`SECURITY.md`](SECURITY.md) | Modèle de menace, scan dépendances, mesures | Sécurité |
| [`PERF.md`](PERF.md) | Cibles, budget, optimisations, plan d'évolution | Ops, SRE |
| [`MAINTENANCE.md`](MAINTENANCE.md) | Cycle de vie, sauvegardes, procédures opérationnelles | Mainteneur |
| [`docs/SOUTENANCE_NOTES.md`](docs/SOUTENANCE_NOTES.md) | Speech, démo, anticipation des questions | Notes internes |

---

## Conventions de commit

Le projet suit la convention **[Conventional Commits](https://www.conventionalcommits.org/)** :

```
feat(upload): add anonymous upload endpoint
fix(auth): reject expired JWT before reaching the filter
fix(axios): drop global Content-Type to allow multipart
docs(readme): document JWT_SECRET generation
test(file-service): cover deletion by non-owner
chore(deps): bump react-router-dom to 7.13.1
refactor(frontend): split UploadForm hero from form view
```

Types autorisés : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`.

---

## IA : pilotage du copilote

**Posture** : l'IA (Claude principalement, ChatGPT en complément) a été traitée comme un **développeur junior** à qui je confie un périmètre restreint de tâches et dont je **vérifie et corrige systématiquement la production**. Sur tout le reste du projet, la responsabilité est restée intégralement humaine.

### Périmètre confié à l'IA

L'IA a été utilisée pour trois tâches d'augmentation seulement :

1. **Intégration des composants UI en `react-aria-components`** : première version des composants accessibles (AppTextField, AppSelect, AppButton, AppCallout, AppHeader, AppSegmentedControl) construits via la page de preview `/ui-preview`.
2. **Génération de tests** : cas représentatifs JUnit + Vitest (succès, erreurs, états de chargement), adaptés ensuite à la main aux contrats réels du DOM et de l'API.
3. **Documentation de base** : première rédaction du README, du PDF technique, des plans TESTING/SECURITY/PERF/MAINTENANCE.md. Refonte humaine ensuite pour ancrer le contenu sur le vrai parcours du projet.

### Hors périmètre : décisions humaines

Tout ce qui suit a été conçu et écrit sans assignation à l'IA :

- **Architecture** (stack, séparation en couches, diagrammes).
- **Modèle de données** (deux entités, fusion volontaire de `ShareLink` + `FileResource`).
- **Sécurité** (flux JWT, routes publiques/privées, header `X-File-Password`).
- **Logique métier** (expiration, validation, contrôle propriétaire, gestion d'erreurs).
- **Diagnostic des bugs réels** (500 auth, multipart cassé, getter mal nommé) : c'est moi qui ai tracé chaque cause racine et appliqué les correctifs.

### Vérifications et corrections appliquées sur les sorties IA

L'IA propose, le pilote dispose. Quelques exemples concrets de ce que j'ai dû corriger :

- **API imaginaires** : l'IA a proposé à plusieurs reprises des endpoints, des méthodes ou des signatures qui n'avaient rien à voir avec ce que je lui avais demandé (routes inventées, méthodes Spring inexistantes). À chaque fois : refus, reformulation du prompt avec le code réel collé en contexte.
- **Hallucination de getter** : appel à `getMaxFileSizeBytes()` alors que le vrai getter de `FileStorageProperties` est `getMaxSizeBytes()` : vérifié dans le code source avant intégration.
- **Sélecteurs de tests trop génériques** : `getByLabelText` proposés ramenant plusieurs éléments parce que l'IA n'a pas de vision du DOM rendu : remplacés par des `data-testid` précis.
- **Sur-architecture** : suggestions répétées d'introduire Flyway, Redis ou des microservices dès le MVP : toutes écartées.
- **Versions inventées** : refus systématique des dépendances ou versions non vérifiées sur le registre officiel.

### Garde-fous

- Aucune génération brute fusionnée sans relecture.
- Audit manuel renforcé sur les fichiers de sécurité (`SecurityConfig`, `JwtService`, `application.properties`).
- Tests générés exécutés localement avant chaque commit.
- Aucun secret réel partagé avec les modèles.
- Vérification systématique des dépendances et versions.

Détail complet : section 8 du PDF de documentation technique.

---

## Parcours du projet

| Étape | Contenu | Livrable |
|---|---|---|
| **Step 1 : Architecture** | Choix de stack, conception des entités, contrat d'API initial | Schéma + tableau techno |
| **Step 2 : Socle technique** | Init backend Spring Boot (port 8000) + frontend Vite (port 5173) + base PostgreSQL `projet3` | Projet qui démarre |
| **Step 3 : Auth (US03/US04)** | JWT + BCrypt + Spring Security + AuthContext + ProtectedRoute. **Bug du token stale corrigé.** | Inscription/Login fonctionnels |
| **US01 : Upload authentifié** | Multipart, validation, stockage UUID. **Bug du Content-Type forcé corrigé.** | `POST /api/files` |
| **US02 : Download public + US09 mot de passe** | Endpoints `/public/{token}` et `/download/{token}`. Header `X-File-Password`. | Page `/download/:token` |
| **US05 : Historique** | DTO `FileHistoryResponse`, route `GET /api/files`, page `MySpacePage` | Liste + filtrage |
| **US06 : Suppression** | `DELETE /api/files/{id}` avec contrôle propriétaire (403) | Bouton dans l'historique |
| **US07 : Upload anonyme** | Route publique `/api/files/anonymous`, `owner_id` nullable | Page d'accueil sans login |
| **Design system** | `/ui-preview` itératif : AppTextField → AppSelect → AppButton → AppCallout → AppHeader → AppSegmentedControl | 6 composants accessibles |
| **Layout global** | Wrapper `ds-app-shell`/`ds-app-frame`/`ds-page`, gradient orange en `body`, header transparent | Conformité maquettes Figma |
| **Polish & livrables** | Tests, doc technique, README, deck soutenance | Tous les livrables OC |

---

## Licence

Projet pédagogique OpenClassrooms : usage privé.

## Auteur

**Omeima Lassakeur** : [github.com/astriiiixxxx](https://github.com/astriiiixxxx)
