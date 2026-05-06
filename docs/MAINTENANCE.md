# MAINTENANCE.md — Plan de maintenance DataShare

## 1. Objectif

Fournir un cadre clair pour faire évoluer l'application de manière prévisible : versions, dépendances, migrations, opérations courantes et procédures d'urgence.

## 2. Cycles de maintenance

| Type | Fréquence | Contenu |
|---|---|---|
| Patch (1.0.x) | À la demande | Correctifs critiques, sécurité, hotfixes. |
| Mineure (1.x.0) | Tous les 1 à 2 mois | Nouvelles fonctionnalités, refactor non-bloquant. |
| Majeure (x.0.0) | À la demande, ≥ 6 mois | Changement d'architecture, migration de stack. |

## 3. Versioning et branches

- Convention : **SemVer** (Major.Minor.Patch).
- `main` : branche stable, déployable.
- `develop` : intégration continue (optionnelle).
- `feature/<slug>`, `fix/<slug>`, `chore/<slug>` : branches de travail.
- Commits : convention Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

## 4. Dépendances

- **Backend** : Maven `pom.xml` ; mise à jour via `mvn versions:display-dependency-updates`.
- **Frontend** : npm `package.json` ; mise à jour via `npm outdated` + `npm update`.
- Audit régulier :
  ```bash
  cd backend && mvn dependency-check:check
  cd frontend && npm audit
  ```
- Mise à jour des dépendances de sécurité dans la semaine où la CVE est publiée.

## 5. Migrations base de données

- MVP : `spring.jpa.hibernate.ddl-auto=update` (auto).
- Cible v1.1 : remplacer par **Flyway** ou **Liquibase**.
- Règles :
  - Toute migration doit être idempotente.
  - Toute migration doit être réversible (`down` script ou compensation).
  - Tester la migration sur une copie de la base de prod avant déploiement.

## 6. Sauvegardes et restauration

- **Base PostgreSQL** :
  - Dump quotidien : `pg_dump projet3 > /backups/projet3-$(date +%F).sql`.
  - Rétention 7 jours en local + 30 jours en stockage froid.
  - Test de restauration mensuel sur env. pré-prod.
- **Fichiers `uploads/`** :
  - Synchronisation quotidienne via `rsync` ou stockage objet versionné.
- **Secrets** :
  - Stockés dans un coffre (Vault, Doppler, 1Password) — jamais dans le repo.

## 7. Déploiement

- Étapes type :
  1. Merge sur `main`.
  2. Pipeline CI : tests, build (`mvn package`, `npm run build`).
  3. Création d'un tag `vX.Y.Z`.
  4. Déploiement (Docker ou bare-metal).
  5. Vérification de bon démarrage (logs Spring Boot + appel d'un endpoint authentifié).
- Stratégie de rollback : redéployer le tag précédent.

## 8. Surveillance et alerting

- Healthcheck applicatif (Spring Boot Actuator `/actuator/health` à activer en évolution) toutes les 60 s (UptimeRobot, Better Stack…).
- Alertes :
  - 5xx > 1 % sur 5 min → Slack/Email.
  - Latence p95 > 1 s sur 10 min → Slack.
  - Disque `uploads/` > 80 % → email.
- Logs centralisés (Loki, ELK…) avec rétention 14 jours minimum.

## 9. Procédures opérationnelles

### 9.1 Nettoyage des fichiers expirés

```sql
DELETE FROM stored_files
WHERE expires_at < NOW() - INTERVAL '1 day';
```

À exécuter en tâche planifiée (cron / scheduler Spring) — à automatiser en v1.1.

### 9.2 Réinitialisation d'un mot de passe utilisateur (admin)

1. Se connecter à PostgreSQL.
2. Générer un nouveau hash via `BCrypt`.
3. Mettre à jour la ligne ciblée.
4. Notifier l'utilisateur par email hors-bande.

### 9.3 Rotation du secret JWT

1. Générer une nouvelle clé : `openssl rand -base64 64`.
2. Mettre à jour `JWT_SECRET` dans le coffre.
3. Redémarrer le backend.
4. Tous les utilisateurs sont invalidés (re-login obligatoire).

## 10. Documentation à maintenir

- `README.md` : install rapide.
- `docs/` : documentation technique détaillée (architecture, API, modèle de données).
- `TESTING.md`, `SECURITY.md`, `PERF.md`, `MAINTENANCE.md` : ce dossier.
- Mettre à jour en même temps que le code (PR qui touche un comportement → PR qui met à jour la doc).

## 11. Onboarding développeur

1. Cloner le repo.
2. Installer Node 22, Java 21, PostgreSQL 16.
3. Créer la base `projet3`.
4. Variables d'env. : `DB_PASSWORD`, `JWT_SECRET`.
5. Lancer backend (`mvn spring-boot:run`) puis frontend (`npm install` + `npm run dev`).
6. Lire `docs/architecture.md` (à inclure dans la doc technique finale).

## 12. End-of-life

- Toute mise hors service du service doit prévoir :
  - Notification utilisateurs ≥ 30 jours avant.
  - Export des données utilisateurs (RGPD).
  - Effacement sécurisé des fichiers et de la base après la coupure.
