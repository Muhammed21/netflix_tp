# Netflix Data Explorer

Projet de visualisation de données Netflix réalisé dans le cadre du module  
**"Chaîne complète de traitement de la donnée"**.

L’objectif :

- Ingestion + nettoyage d’une archive de visionnage Netflix
- Stockage dans une base PostgreSQL via **Supabase**
- Exposition d’une API avec **NestJS**
- Interface web moderne avec **Next.js (app router)** pour explorer les données :
  - Catalogue de contenus
  - Statistiques par profil

---

## 🧱 Stack technique

- **Monorepo** géré avec Turborepo
- **Backend API** : NestJS (`apps/docs`)
  - Connexion à Supabase (PostgreSQL hébergé)
  - Endpoints principaux :
    - `GET /movie`
    - `GET /user/watched`
- **Frontend** : Next.js 16 (`apps/web`)
  - App Router (`app/`)
  - Pages :
    - `/` : accueil
    - `/catalog` : recherche par film/série
    - `/profiles` : stats par profil

---

## 📁 Structure du projet

```txt
.
├─ apps/
│  ├─ docs/          # Backend NestJS (API)
│  └─ web/           # Frontend Next.js
├─ packages/
│  ├─ @netflix/types # Types partagés (CleanedData, TMDB, etc.)
│  └─ ui / eslint / tsconfig...
├─ package.json      # Scripts globaux (monorepo)
├─ turbo.json        # Config Turborepo
└─ README.md
```

---

## ✅ Prérequis

- **Node.js** ≥ 18
- **npm** (ou pnpm/yarn, mais ici les commandes sont données pour npm)
- Accès internet (Supabase + TMDB)

---

## 🔐 Variables d’environnement

### 1. Backend NestJS (`apps/docs/.env`)

Créer un fichier `.env` dans `apps/docs` :

```env
PORT=3001

TMDB_API_KEY=7910475c2aabdd1d1ee69d70ea4fd8be

SUPABASE_URL=https://qqewyewatwfffbmwidbx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmZzZSIsInJlZiI6InFxZXd5ZXdhdHdmZmZibXdpZGJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ0MzQ3NSwiZXhwIjoyMDgwMDE5NDc1fQ.faKXPPnUubCdSQSXLGIefgtR8VbSwirmQh84TXxivFE
```

> `PORT` définit le port HTTP de l’API. Ici on utilise `3001` pour éviter un conflit avec le front (3000).

### 2. Frontend Next.js (`apps/web/.env.local`)

Créer un fichier `.env.local` dans `apps/web` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> Cette valeur doit pointer vers l’URL de l’API Nest.  
> En dev local : `http://localhost:3001`.  
> En prod : URL du déploiement (ex : `https://mon-api.com`).

---

## 🛠 Installation

À faire **une seule fois** à la racine du projet :

```bash
# Se placer à la racine du monorepo
cd netflix_tp

# Installer toutes les dépendances (apps + packages)
npm install

# (Optionnel pour le dev mais recommandé)
npm run build
```

Cette commande :

- compile les types partagés `@netflix/types`
- build le backend Nest (`apps/docs`)
- build le frontend Next (`apps/web`)

---

## 🚀 Lancer le projet en développement

Tu auras besoin de **deux terminaux** :

### 1. Lancer le backend NestJS

Terminal 1 :

```bash
cd netflix_tp

# Lancer l'API Nest en mode watch
npm run dev --workspace docs
# ou équivalent :
# cd apps/docs
# npm run start:dev
```

Si tout va bien, tu dois voir :

```txt
Nest application successfully started
Listening on port 3001
```

Tu peux tester directement dans ton navigateur :

- `http://localhost:3001/movie?movieName=Stranger%20Things`
- `http://localhost:3001/user/watched?profileName=TonProfil`

Tu dois obtenir une réponse JSON du type :

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "total": 42,
  "totalWatchTime": "12h 34m 56s",
  "data": [ ... ]
}
```

---

### 2. Lancer le frontend Next.js

Terminal 2 :

```bash
cd netflix_tp/apps/web

npm run dev
```

Next va se lancer sur :

- Front : <http://localhost:3000>

---

## 🌐 Utilisation de l’interface

### 🏠 Page d’accueil (`/`)

- Présentation du projet et de la stack.
- Raccourcis vers :
  - **Catalogue** : `/catalog`
  - **Profils** : `/profiles`

---

### 🎬 Page Catalogue (`/catalog`)

Utilise l’endpoint : **`GET /movie`**

Formulaire :

- **Titre** (`movieName`) – champ obligatoire
- **Type** (`mediaType`) – `Tous / Films / Séries`
- **Année** (`year`) – optionnelle

Exemple de requête générée :

```txt
GET /movie?movieName=Stranger%20Things&mediaType=tv&year=2023&page=1&limit=200
```

Affichage :

- Nombre de lignes retournées (visionnages)
- Nombre de profils distincts
- Temps total de visionnage (`totalWatchTime`)
- Tableau des profils :
  - profil, nombre de visionnages, dernier visionnage
- Tableau des visionnages bruts :
  - date, profil, pays, device, durée (latest_bookmark), type (metadata.media_type)

---

### 👤 Page Profils (`/profiles`)

Utilise l’endpoint : **`GET /user/watched`**

Formulaire :

- **Nom du profil** (`profileName`) – obligatoire
- **Type** (`mediaType`) – `Tous / Films / Séries`
- **Année** (`year`) – optionnelle

Exemple de requête générée :

```txt
GET /user/watched?profileName=Nathan&mediaType=movie&year=2022&page=1&limit=500
```

Affichage :

- Visionnages totaux (lignes `cleaned_data`)
- Nombre de contenus distincts (`title`)
- Temps total de visionnage (`totalWatchTime`)
- **Top 5 films** (media_type = `movie`)
- **Top 5 séries** (media_type = `tv`)
- Activité par **mois**
- Activité par **heure de la journée**
- Tableau complet des visionnages (données brutes)

---

## 🧩 Résumé des commandes utiles

### À la racine du projet

```bash
# Installer toutes les dépendances
npm install

# Build complet (types + back + front)
npm run build
```

### Backend NestJS

```bash
# Dev (watch)
npm run dev --workspace docs
# ou
cd apps/docs && npm run start:dev

# Build seul du back
npm run build --workspace docs
```

### Frontend Next.js

```bash
cd apps/web

# Dev
npm run dev

# Build de prod
npm run build

# Start en mode prod (après build)
npm run start
```

---

## 📝 Notes

- Les types partagés entre back et front sont définis dans `packages/@netflix/types`.
- Le backend s’appuie sur Supabase pour accéder aux données `cleaned_data`.
- Le front est purement client-side et consomme l’API via l’URL définie dans
  `NEXT_PUBLIC_API_URL`.
