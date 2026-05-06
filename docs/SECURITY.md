# SECURITY.md — Politique de sécurité DataShare

## 1. Modèle de menace

DataShare manipule des fichiers utilisateurs et des informations d'authentification. Les principales menaces identifiées :

- Vol ou divulgation des fichiers stockés.
- Compromission d'un compte utilisateur (credential stuffing, phishing).
- Élévation de privilèges (accès aux fichiers d'un autre utilisateur).
- Téléversement de fichiers malveillants (.exe, scripts).
- Attaque par force brute sur les liens de téléchargement et mots de passe de fichier.
- Attaques classiques web : XSS, CSRF, injection SQL.

## 2. Authentification et gestion de session

- Hachage des mots de passe utilisateur via **BCrypt** (`PasswordEncoder` Spring Security).
- Connexion stateless via **JWT** signé HMAC-SHA256 (clé `app.jwt.secret` provisionnée par variable d'environnement).
- Durée de vie du JWT limitée (`app.jwt.expiration`, 24 h par défaut) ; renouvellement par re-login.
- Vérification côté serveur de la signature, du sujet et de l'expiration à chaque requête (`JwtAuthenticationFilter`).
- Vérification côté client de l'expiration (`jwtUtils.isJwtExpiredOrInvalid`) avant d'envoyer le token.
- Sur 401 hors `/auth/**` et `/files/download/**`, l'intercepteur Axios purge le `localStorage` et redirige vers `/login`.

## 3. Autorisation

- Spring Security : routes publiques explicitement listées (`/api/auth/**`, `/api/files/anonymous`, `/api/files/public/**`, `/api/files/download/**`). Toute autre route exige un JWT valide.
- Vérification côté `FileService` que l'utilisateur courant est bien le propriétaire avant suppression (`AccessDeniedException` sinon).
- Tokens de téléchargement : UUID v4 aléatoires (entropie suffisante, non incrémentaux).

## 4. Contrôles à l'upload

- Liste noire d'extensions interdites (`.exe`, `.bat`, `.cmd`, `.sh`, `.msi`, `.js`).
- Limite de taille configurable (`app.file.max-size-bytes`, 10 Mo par défaut).
- Limite de durée de rétention (`app.file.max-expiration-days`, 7 jours).
- Mot de passe optionnel par fichier (BCrypt, jamais retourné en clair).
- Stockage sous nom UUID (le nom original est conservé en BDD pour l'affichage uniquement).

## 5. Contrôles au téléchargement

- Vérification d'expiration avant lecture du fichier (`FileExpiredException` → HTTP 410).
- Si protégé : exigence d'un header `X-File-Password`, comparé via `passwordEncoder.matches`.
- Erreurs explicites mais non discriminantes côté client (404 si lien inconnu, 401 si mauvais mot de passe, 410 si expiré).

## 6. Sécurité applicative

- **CORS** : activé et restreint à l'origine du frontend (`CorsConfig`).
- **CSRF** : désactivé car API stateless avec JWT en header (pas de cookie de session).
- **XSS** : React échappe par défaut le contenu rendu ; aucun `dangerouslySetInnerHTML`.
- **Injection SQL** : Spring Data JPA + paramètres préparés. Aucune requête native concaténée.
- **Headers** : `Content-Disposition: attachment` côté download pour éviter l'exécution navigateur.
- **Variables sensibles** : `DB_PASSWORD`, `JWT_SECRET` jamais commités (cf. `.gitignore`).

## 7. Stockage et persistance

- Fichiers binaires sous `backend/uploads/` (non servi statiquement).
- BDD PostgreSQL : utilisateur dédié, droits limités (CRUD sur les tables du schéma).
- Sauvegardes recommandées : dump quotidien `pg_dump` + rotation 7 jours.

## 8. Journalisation

- Logs Spring Boot (INFO en prod, DEBUG en dev).
- Pas de log du contenu des mots de passe ni des fichiers.
- Erreurs serveur agrégées via `GlobalExceptionHandler` avec un code HTTP cohérent et un message utilisateur localisé.

## 9. Mises à jour et veille

- Suivi `dependabot` ou `renovate` pour les dépendances Maven et npm.
- Audit périodique : `mvn dependency-check:check`, `npm audit`.
- Veille CVE Spring Security et React au minimum mensuelle.

## 10. Réponse à incident

- Procédure : isoler la machine touchée, révoquer la clé JWT (`app.jwt.secret`), forcer la déconnexion globale, auditer les logs, communiquer aux utilisateurs concernés.
- Contact : owner du repo (DPO si déploiement public ultérieur).

## 11. Données personnelles (RGPD)

- Données conservées : email, hash de mot de passe, nom d'origine du fichier, métadonnées d'envoi.
- Suppression du compte → suppression en cascade des fichiers (à implémenter pour la version finale).
- Droit d'accès et de portabilité par export CSV (à intégrer en évolution).
