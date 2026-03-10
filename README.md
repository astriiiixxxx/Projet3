# DataShare --- Prototype MVP

Ce projet correspond au développement d'un prototype d'application de
**transfert sécurisé de fichiers** dans le cadre du projet
OpenClassrooms.

L'objectif est de construire une application **full-stack** composée de
: - un **frontend React** - un **backend Spring Boot** - une **base de
données PostgreSQL**

L'application expose une **API REST** utilisée par le frontend pour
communiquer avec le backend.

------------------------------------------------------------------------

# Stack technique

## Frontend

-   React
-   TypeScript
-   Vite
-   Axios
-   React Router

## Backend

-   Spring Boot
-   Spring Web
-   Spring Security
-   Spring Data JPA
-   PostgreSQL Driver

## Base de données

-   PostgreSQL

## Outils

-   Git
-   Postman
-   VS Code / IntelliJ

------------------------------------------------------------------------

# Structure du projet

    projet3/
    ├── frontend/
    ├── backend/
    ├── docs/
    ├── README.md
    └── .gitignore

------------------------------------------------------------------------

# Installation de PostgreSQL

## Vérifier l'installation

``` bash
psql --version
```

------------------------------------------------------------------------

# Connexion PostgreSQL

Connexion au serveur PostgreSQL :

``` bash
psql -h localhost -U postgres -d postgres
```

Entrer le mot de passe PostgreSQL lorsque demandé.

------------------------------------------------------------------------

# Création de la base de données

``` sql
CREATE DATABASE projet3;
```

------------------------------------------------------------------------

# Vérifier les bases existantes

``` sql
\l
```

------------------------------------------------------------------------

# Se connecter à la base du projet

``` bash
psql -h localhost -U postgres -d projet3

```
ou si deja connecté a psql
``` bash

\c projet3
```

------------------------------------------------------------------------

# Quitter PostgreSQL

``` sql
\q
```

------------------------------------------------------------------------

# Configuration du backend

Fichier de configuration :

    backend/src/main/resources/application.properties

Configuration :

``` properties
server.port=8000

spring.datasource.url=jdbc:postgresql://localhost:5432/projet3
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

------------------------------------------------------------------------

# Définir la variable d'environnement

Mac / Linux

``` bash
export DB_PASSWORD=your_password
```

Vérifier :

``` bash
echo $DB_PASSWORD
```

------------------------------------------------------------------------

# Lancer le backend

``` bash
cd backend
mvn spring-boot:run
```

Backend disponible sur :

    http://localhost:8000

------------------------------------------------------------------------

# Test de l'API

Endpoint :

    GET /api/health

Tester dans Postman ou navigateur :

    http://localhost:8000/api/health

Réponse attendue :

    API backend fonctionne

------------------------------------------------------------------------

# Lancer le frontend

``` bash
cd frontend
npm install
npm run dev
```

Application disponible sur :

    http://localhost:5173

------------------------------------------------------------------------

# Ports utilisés

Backend

    8000

Frontend

    5173

PostgreSQL

    5432

------------------------------------------------------------------------

