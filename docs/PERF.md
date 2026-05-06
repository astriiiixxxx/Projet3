# PERF.md — Performance et scalabilité DataShare

## 1. Objectifs de performance

| Indicateur | Cible MVP | Cible cible |
|---|---|---|
| TTFB API (`GET /api/files/public/:token`) | ≤ 250 ms (p95) | ≤ 100 ms |
| Temps total upload 5 Mo | ≤ 3 s | ≤ 1.5 s |
| Temps total download 5 Mo | ≤ 3 s | ≤ 1.5 s |
| Time-to-Interactive frontend (page d'accueil) | ≤ 2 s sur 4G | ≤ 1.2 s |
| Lighthouse Performance | ≥ 85 | ≥ 95 |

## 2. Architecture et hot paths

- **Upload** : multipart `multipart/form-data` reçu par Spring → écriture disque + insertion JPA → réponse JSON. Goulot principal : I/O disque.
- **Download** : lecture BDD + streaming du fichier. Goulot : I/O disque + débit réseau.
- **My space** : requête `findByOwnerOrderByCreatedAtDesc(user)` indexée sur `owner_id`.

## 3. Optimisations frontend

- Bundle Vite avec code-splitting (par route via React Router).
- Lazy import des pages secondaires (`React.lazy` à activer dès la version 1.1).
- Images et SVG inline limités, pas de polices custom externes.
- Cache HTTP des assets statiques (`Cache-Control: max-age=31536000, immutable` pour les bundles versionnés).
- Pas de re-renders inutiles : `useMemo` sur les calculs `AuthContext`, hooks ciblés.

## 4. Optimisations backend

- JPA en mode `update` pour le MVP, à remplacer par Flyway migrations en prod.
- Index BDD recommandés :
  - `stored_files(owner_id)` (déjà couvert par la FK).
  - `stored_files(download_token)` (unique → index automatique).
  - `users(email)` (unique → index automatique).
- Requête `findByDownloadToken` directe (pas de jointure inutile).
- Streaming des fichiers via `Resource` Spring (pas de chargement complet en mémoire).

## 5. Charge cible et capacité

- MVP ciblé : 50 utilisateurs simultanés, 200 uploads/jour, 1 000 downloads/jour.
- Volume disque estimé : 200 × 5 Mo × 7 jours ≈ 7 Go en rétention max.
- Stratégie d'évolution :
  - Mettre les fichiers sur un stockage objet (S3 / Scaleway Object Storage).
  - Mettre un CDN devant les downloads (CloudFront / Bunny).
  - Activer un cache Redis sur `getPublicFile`.

## 6. Politique de limites

- Limite multipart : `app.file.max-size-bytes=10485760` (10 Mo) — ajustable via `application.properties`.
- Limite de rétention : `app.file.max-expiration-days=7`.
- Rate limiting recommandé en évolution : Bucket4j sur `/api/auth/login` (anti-brute-force) et `/api/files/download/{token}` (anti-énumération).

## 7. Mesure et observabilité

- Spring Boot Actuator : endpoints `/actuator/health`, `/actuator/metrics` à activer (sécurisés).
- Logs structurés (JSON) recommandés pour ingestion ELK / Loki.
- Métriques clés à suivre :
  - `http.server.requests` par endpoint (latence, erreurs).
  - `jvm.memory.used`, `process.cpu.usage`.
  - Taille de la table `stored_files`, espace disque `uploads/`.

## 8. Tests de charge

- Outils recommandés : k6 ou Apache JMeter.
- Scénarios prioritaires :
  - 50 utilisateurs concurrents qui uploadent 1 fichier de 1 Mo.
  - 100 utilisateurs concurrents qui téléchargent un fichier de 5 Mo.
  - 50 utilisateurs concurrents qui consultent `/api/files`.
- Critère : aucune erreur 5xx, latence p95 sous le seuil section 1.

## 9. Plan d'amélioration

- v1.1 : compression gzip/brotli côté Spring + cache HTTP étiquetés (ETag).
- v1.2 : déplacement du stockage fichier vers S3 + CDN.
- v1.3 : pré-signature des liens d'upload (réduction de la charge backend).
- v1.4 : worker asynchrone pour l'antivirus (ClamAV) avant publication du lien.
