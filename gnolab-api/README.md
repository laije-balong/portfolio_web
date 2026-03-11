# GnoLab API

Backend Express + SQLite pour le portfolio GnoLab.

## Prérequis

- Node.js v18 ou supérieur ([nodejs.org](https://nodejs.org))
- npm (inclus avec Node.js)

## Installation

```bash
# 1. Se placer dans le dossier backend
cd gnolab-api

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration
cp .env.example .env
# Ouvrir .env et modifier JWT_SECRET avec une vraie clé secrète

# 4. Démarrer le serveur
npm run dev
```

Le serveur démarre sur **http://localhost:3001**

## Premier démarrage : créer le compte admin

Appeler cette route une seule fois pour créer ton compte admin :

```bash
curl -X POST http://localhost:3001/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"toi@email.com","password":"TonMotDePasse!"}'
```

Après ça, la route `/api/auth/setup` est automatiquement bloquée.

## Structure

```
gnolab-api/
├── server.js              ← point d'entrée
├── .env                   ← secrets (ne pas committer)
├── db/
│   ├── database.js        ← connexion SQLite
│   ├── schema.sql         ← structure des tables
│   └── gnolab.db          ← base de données (créée automatiquement)
├── routes/
│   ├── auth.js            ← login / logout / me
│   ├── projects.js        ← CRUD projets
│   ├── blog.js            ← CRUD articles
│   └── upload.js          ← upload images et certificats
├── middleware/
│   ├── authGuard.js       ← vérification JWT
│   └── errorHandler.js    ← gestion des erreurs
└── uploads/
    ├── covers/            ← images de projets
    └── certificates/      ← certificats
```

## Endpoints principaux

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/health` | — | Vérifier que l'API tourne |
| POST | `/api/auth/login` | — | Se connecter |
| GET | `/api/auth/me` | ✅ | Profil admin |
| GET | `/api/projects` | — | Liste projets publiés |
| GET | `/api/projects/:slug` | — | Détail projet |
| POST | `/api/projects` | ✅ | Créer projet |
| PUT | `/api/projects/:id` | ✅ | Modifier projet |
| DELETE | `/api/projects/:id` | ✅ | Supprimer projet |
| PATCH | `/api/projects/reorder` | ✅ | Réordonner |
| GET | `/api/articles` | — | Liste articles publiés |
| GET | `/api/articles/:slug` | — | Détail article |
| POST | `/api/articles` | ✅ | Créer article |
| POST | `/api/upload/cover` | ✅ | Upload image |
| POST | `/api/upload/certificate` | ✅ | Upload certificat |
