# TESTING.md — Plan de tests DataShare

## 1. Objectif

Garantir que chaque module (frontend et backend) reste fiable, prévisible et conforme aux exigences fonctionnelles tout au long du cycle de vie de l'application.

## 2. Pyramide de tests

| Niveau | Couverture cible | Outils |
|---|---|---|
| Tests unitaires | ≥ 80 % des classes métier (services, utils) | JUnit 5 + Mockito (backend), Vitest + Testing Library (frontend) |
| Tests d'intégration | Endpoints REST critiques (auth, upload, download, my-files) | Spring Boot Test, MockMvc |
| Tests end-to-end | Parcours principaux (upload anonyme, login + my-space, download protégé) | Postman / Cypress (à introduire après MVP) |

## 3. Périmètre par environnement

### 3.1 Backend (Java / Spring Boot)

- **Unitaires** :
  - `JwtServiceTest` : génération, parsing et expiration d'un token.
  - `JwtAuthenticationFilterTest` : filtre HTTP, header Authorization, propagation de l'auth.
  - `AuthServiceTest` : inscription, hash BCrypt, échec login.
  - `FileServiceTest` : upload (anonyme/authentifié), expiration, mot de passe, suppression, contrôle d'accès propriétaire.
- **Intégration** :
  - `FileControllerTest` : routes `POST /api/files`, `POST /api/files/anonymous`, `GET /api/files`, `GET /api/files/public/{token}`, `GET /api/files/download/{token}`, `DELETE /api/files/{id}`.
  - `BackendApplicationTests` : chargement du contexte Spring.
- **Lancement** :
  ```bash
  cd backend
  mvn test
  ```

### 3.2 Frontend (React / TypeScript / Vitest)

- **Unitaires / composants** :
  - `jwtUtils.test.ts` : décodage et expiration d'un JWT.
  - `AuthContext.test.tsx` : login/logout, persistance du token.
  - `axios.test.ts` : intercepteur 401, redirection.
  - `UploadForm.test.tsx` : formulaire complet, états loading et erreurs.
  - `UploadPage.test.tsx` : sélection de la variante anonyme vs. authentifiée.
  - `DownloadPage.test.tsx` : champ mot de passe conditionnel, download blob, erreurs backend.
  - `MySpacePage.test.tsx` : liste, suppression, confirmation, erreurs.
- **Lancement** :
  ```bash
  cd frontend
  npm run test:run
  npm run test:coverage   # rapport de couverture
  ```

## 4. Données de test

- Utilisateurs jetables : `omeima.test+<n>@example.com`.
- Fichiers : `tests/fixtures/` (PDF, image, archive).
- Base PostgreSQL dédiée : schéma `projet3_test` (scripts dans `backend/src/test/resources`).

## 5. Critères de réussite

- 100 % des tests verts avant chaque merge.
- Pas de régression sur les parcours critiques recensés en section 3.
- Couverture frontend ≥ 70 % sur les services et pages métier.
- Couverture backend ≥ 80 % sur les services et contrôleurs.

## 6. CI / Automatisation

- Pipeline déclenché sur `push` et `pull_request`.
- Étapes : checkout → install → lint → tests unitaires → tests d'intégration → build.
- Échec immédiat si un test échoue ou si la couverture descend sous le seuil.

## 7. Tests manuels avant release

- Inscription → connexion → upload authentifié → consultation `Mon espace` → suppression.
- Upload anonyme → ouverture du lien dans un autre navigateur → téléchargement.
- Upload avec mot de passe → mauvais mot de passe → erreur 401 → bon mot de passe → succès.
- Lien expiré → erreur 410 affichée correctement.
- Lien inexistant → erreur 404 affichée correctement.

## 8. Suivi des bugs

- Tracking via les *Issues* du repo (labels : `bug`, `regression`, `flaky`).
- Reproduction systématique avant correction.
- Test de régression ajouté à chaque correctif.
