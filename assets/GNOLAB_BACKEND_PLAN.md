# GnoLab — Plan Backend Complet
> Stack · Architecture · Dashboard Admin · Blog · Feuille de route pédagogique


## 1. Pourquoi ce choix de stack

### Node.js + Express + SQLite

**Le raisonnement central : tu écris déjà du JavaScript.**

pas besoin d'apprendre une deuxième langue pour écrire le backend.
Le même cerveau, les mêmes réflexes juste un nouvel environnement.

```
Frontend  →  JavaScript (navigateur)
Backend   →  JavaScript (Node.js, sur le serveur)
Base de   →  SQLite (un fichier .db sur le disque)
données
```

## 2. Architecture globale du projet

```
gnolab/                    ← Frontend (existant, vanilla JS)
│
gnolab-api/                ← NOUVEAU — Backend Express
├── server.js              ← Point d'entrée (démarrer le serveur)
├── package.json           ← Dépendances npm
├── .env                   ← Variables secrètes (jamais committé)
├── .env.example           ← Modèle public des variables
│
├── db/
│   ├── database.js        ← Connexion SQLite + fonctions utilitaires
│   ├── schema.sql         ← Structure des tables (documentation vivante)
│   └── gnolab.db          ← Base de données (fichier binaire, ignoré par git)
│
├── routes/
│   ├── auth.js            ← POST /api/auth/login  · POST /api/auth/logout
│   ├── projects.js        ← CRUD complet projets
│   ├── blog.js            ← CRUD articles de blog
│   └── upload.js          ← POST /api/upload (images, certificats)
│
├── middleware/
│   ├── authGuard.js       ← Vérifie le JWT avant chaque route protégée
│   └── errorHandler.js    ← Gestion centralisée des erreurs
│
└── uploads/               ← Fichiers uploadés (images projets, certificats)
    ├── covers/
    └── certificates/
```

### Séparation claire des responsabilités

```
┌─────────────────────────────────────────────────────────┐
│  Visiteur (navigateur)                                  │
│  Charge gnolab/ → SPA vanilla JS                        │
│  Lit  GET /api/projects  → liste des projets            │
│  Lit  GET /api/blog      → liste des articles           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP / JSON
┌────────────────────▼────────────────────────────────────┐
│  gnolab-api/  (Node.js + Express)                       │
│  Port 3001                                              │
│  Routes publiques : projets, blog                       │
│  Routes protégées : admin (nécessite JWT)               │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
┌────────────────────▼────────────────────────────────────┐
│  gnolab.db  (SQLite)                                    │
│  Tables : users, projects, articles, tags               │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Structure de la base de données

### SQLite — Pourquoi c'est parfait pour débuter

- **Un seul fichier** : `gnolab.db` ouvrir avec DB Browser for SQLite
- **Zéro installation** : pas de serveur PostgreSQL à configurer, pas de Docker
- **Portable** : possibilité de copier le fichier et le partager
- **Migrer plus tard** : quand tu seras à l'aise, passer à PostgreSQL est simple

### Schéma complet

```sql
-- ── UTILISATEURS (admin uniquement pour l'instant) ──────────
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL UNIQUE,
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,  -- bcrypt hash, JAMAIS en clair
  role       TEXT    NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── PROJETS ──────────────────────────────────────────────────
CREATE TABLE projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,   -- "opt-stock-pme"
  title       TEXT    NOT NULL,
  excerpt     TEXT,
  challenge   TEXT,
  solution    TEXT,
  proofs      TEXT,
  tools       TEXT,                      -- JSON array: ["Python","SQL"]
  cover       TEXT,                      -- chemin: "/uploads/covers/stock.jpg"
  certificate TEXT,                      -- chemin ou null
  certified   INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true (SQLite boolean)
  sort_order  INTEGER NOT NULL DEFAULT 0, -- pour trier les projets
  published   INTEGER NOT NULL DEFAULT 1, -- 0 = brouillon, 1 = publié
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── ARTICLES DE BLOG ─────────────────────────────────────────
CREATE TABLE articles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL UNIQUE,  -- "comment-j-ai-reduit-le-churn"
  title        TEXT    NOT NULL,
  excerpt      TEXT,
  content      TEXT,                     -- Markdown complet de l'article
  cover        TEXT,
  tags         TEXT,                     -- JSON array: ["Python","Machine Learning"]
  reading_time INTEGER,                  -- minutes estimées
  published    INTEGER NOT NULL DEFAULT 0, -- 0 = brouillon, 1 = publié
  published_at DATETIME,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── DÉCLENCHEUR : mise à jour automatique de updated_at ──────
CREATE TRIGGER projects_updated_at
  AFTER UPDATE ON projects
  BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER articles_updated_at
  AFTER UPDATE ON articles
  BEGIN
    UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
```

---

## 4. API REST — Tous les endpoints

### Convention utilisée

```
GET    /api/xxx       → lire (public)
POST   /api/xxx       → créer (protégé)
PUT    /api/xxx/:id   → modifier entièrement (protégé)
PATCH  /api/xxx/:id   → modifier partiellement (protégé)
DELETE /api/xxx/:id   → supprimer (protégé)
```

### Auth

```
POST /api/auth/login
  Body:    { "username": "admin", "password": "monmotdepasse" }
  Retour:  { "token": "eyJhbGci...", "expiresIn": "7d" }

POST /api/auth/logout
  (côté client : supprimer le token du localStorage)

GET  /api/auth/me      ← protégé
  Retour:  { "id": 1, "username": "admin", "role": "admin" }
```

### Projets

```
GET  /api/projects
  Retour:  [ { id, slug, title, excerpt, tools, cover, certified, ... } ]
  Query:   ?published=1   (défaut : tous pour admin, 1 pour public)

GET  /api/projects/:slug
  Retour:  { id, slug, title, ..., challenge, solution, proofs }

POST /api/projects          ← protégé
  Body:    { title, excerpt, tools, ... }
  Retour:  { id, slug, ... }

PUT  /api/projects/:id      ← protégé
  Body:    champs à mettre à jour
  Retour:  { projet mis à jour }

DELETE /api/projects/:id    ← protégé
  Retour:  { "success": true }

PATCH /api/projects/reorder ← protégé
  Body:    [ { id: 1, order: 0 }, { id: 2, order: 1 }, ... ]
  Retour:  { "success": true }
```

### Blog

```
GET  /api/articles
  Query:   ?published=1&tag=Python&limit=10&page=1
  Retour:  { articles: [...], total: 12, pages: 2 }

GET  /api/articles/:slug
  Retour:  { id, slug, title, content, tags, ... }

POST /api/articles          ← protégé
PUT  /api/articles/:id      ← protégé
DELETE /api/articles/:id    ← protégé
```

### Upload fichiers

```
POST /api/upload/cover
  Form-data: file (image JPG/PNG/WebP, max 2MB)
  Retour:    { "url": "/uploads/covers/stock-1234.jpg" }

POST /api/upload/certificate
  Form-data: file (image ou PDF, max 5MB)
  Retour:    { "url": "/uploads/certificates/cert-1234.pdf" }
```

---

## 5. Les dépendances npm — et ce que chacune fait

```json
{
  "dependencies": {
    "express": "^4.18.0",        // le framework HTTP
    "better-sqlite3": "^9.0.0",  // pilote SQLite (synchrone, simple)
    "bcryptjs": "^2.4.3",        // hasher les mots de passe
    "jsonwebtoken": "^9.0.0",    // créer et vérifier les tokens JWT
    "multer": "^1.4.5",          // gérer les uploads de fichiers
    "cors": "^2.8.5",            // autoriser le frontend à appeler l'API
    "dotenv": "^16.0.0",         // lire le fichier .env
    "slugify": "^1.6.0"          // "Mon Titre" → "mon-titre"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"          // redémarrer le serveur automatiquement
  }
}
```

**6 dépendances de production.** C'est tout. Pas de magie cachée.

---

## 6. Ce que tu vas apprendre, dans l'ordre

### Phase 1 — Les fondations (semaine 1)

> "Comment fonctionne un serveur HTTP ?"

Tu vas écrire `server.js` avec Express. Tu vas comprendre :
- Ce qu'est une **requête** et une **réponse** HTTP
- Les **méthodes** GET, POST, PUT, DELETE et quand utiliser chacune
- Les **codes de statut** : 200 OK, 201 Created, 404 Not Found, 401 Unauthorized
- Le format **JSON** comme langage entre frontend et backend

```javascript
// Ton premier serveur — 15 lignes qui font vraiment quelque chose
import express from 'express';
const app = express();

app.use(express.json()); // comprendre le JSON dans le body

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Bonjour depuis le backend !' });
});

app.listen(3001, () => {
  console.log('Serveur démarré sur http://localhost:3001');
});
```

### Phase 2 — La base de données (semaine 2)

> "Comment stocker et lire des données ?"

Tu vas écrire `db/database.js` et comprendre :
- Ce qu'est le **SQL** : SELECT, INSERT, UPDATE, DELETE
- Comment **lier** JavaScript et SQLite avec better-sqlite3
- La différence entre une **requête préparée** et une chaîne brute (sécurité)

```javascript
// Une vraie requête — lisible, sûre, explicite
const projet = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug);
```

### Phase 3 — Authentification (semaine 3)

> "Comment protéger certaines routes ?"

Tu vas comprendre :
- Pourquoi on ne stocke **jamais un mot de passe en clair**
- Ce qu'est un **hash bcrypt** et pourquoi c'est mathématiquement sûr
- Ce qu'est un **JWT** : un badge signé que le client garde et présente à chaque requête
- Comment écrire un **middleware** qui vérifie ce badge

### Phase 4 — Upload et fichiers (semaine 4)

> "Comment gérer des images ?"

Tu vas apprendre :
- Comment recevoir un fichier binaire avec **Multer**
- Comment le renommer, le stocker, valider son type et sa taille
- Comment servir des fichiers statiques avec Express

### Phase 5 — Dashboard Admin (semaine 5-6)

> "Comment construire une interface pour gérer son contenu ?"

Tu vas construire une **nouvelle page dans le frontend** (`/admin`) avec :
- Un formulaire de **login** (appelle `POST /api/auth/login`, stocke le JWT)
- Un tableau des **projets** avec boutons éditer/supprimer
- Un **éditeur de projet** avec tous les champs
- Un **éditeur d'article** avec prévisualisation Markdown
- Le **drag & drop** pour réordonner les projets

### Phase 6 — Blog public (semaine 7)

> "Comment afficher du contenu dynamique côté client ?"

Tu vas ajouter dans le frontend :
- Une page `/blog` avec liste des articles
- Une page `/blog/:slug` qui récupère l'article et **parse le Markdown** côté client
  (avec `marked.js` ou `micromark` — une seule ligne d'import)
- Des **tags** pour filtrer les articles

---

## 7. Dashboard Admin — Architecture UI

```
/admin                ← login (redirige si déjà connecté)
/admin/dashboard      ← vue d'ensemble (stats rapides)
/admin/projects       ← liste + réorganisation drag & drop
/admin/projects/new   ← formulaire création projet
/admin/projects/:id   ← formulaire édition projet
/admin/articles       ← liste articles (avec statut brouillon/publié)
/admin/articles/new   ← éditeur Markdown avec aperçu
/admin/articles/:id   ← édition article
```

### Ce que le dashboard permet

**Projets**
- Créer / modifier / supprimer un projet
- Uploader l'image de couverture et le certificat directement
- Basculer publié / brouillon sans supprimer
- Réordonner par drag & drop (la galerie reflète l'ordre)
- Voir un aperçu de la page projet avant publication

**Articles**
- Éditeur Markdown avec aperçu en temps réel côté droit
- Uploader une image de couverture
- Gérer les tags (autocomplete sur les tags existants)
- Sauvegarder en brouillon → publier quand c'est prêt
- Temps de lecture calculé automatiquement

---

## 8. Blog — Architecture UI

```
/blog                 ← grille des articles publiés
/blog/:slug           ← article complet
/blog?tag=Python      ← filtrer par tag
```

### Rendu du Markdown côté client

Le contenu est stocké en Markdown dans la base, puis converti en HTML
par le navigateur au moment de l'affichage — une seule dépendance légère :

```javascript
// Dans le frontend, page article
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/src/marked.min.js';

const html = marked.parse(article.content); // Markdown → HTML
document.getElementById('article-body').innerHTML = html;
```

Zéro build step. Zéro compilation. Ça s'intègre parfaitement dans le SPA existant.

---

## 9. Modifications minimales du frontend existant

Le frontend actuel lit `/data/projects.json` (fichier statique).
Il suffit de changer **3 lignes** dans 3 fichiers pour pointer vers l'API :

```javascript
// AVANT (dans gallery.js, home.js, project.js)
const reponse = await fetch('/data/projects.json');

// APRÈS
const reponse = await fetch('/api/projects');
```

C'est tout. Le reste du code frontend ne change pas.

---

## 10. Sécurité — Les règles de base qu'on applique dès le début

| Règle | Pourquoi | Comment |
|-------|---------|---------|
| Jamais de mot de passe en clair | Fuite de DB = catastrophe | bcrypt hash |
| Variables secrètes dans `.env` | Ne pas exposer les secrets sur GitHub | dotenv |
| Requêtes préparées SQL | Injection SQL | `db.prepare('... ?').get(val)` |
| CORS restreint | Empêcher d'autres sites d'appeler l'API | `cors({ origin: 'https://ton-site.com' })` |
| Valider les uploads | Malware, fichiers trop lourds | Multer + vérification mimetype |
| Token JWT expirant | Si le token est volé, il expire | `expiresIn: '7d'` |

---

## 11. Déploiement — Architecture finale en production

```
┌─────────────────────────────────────────────┐
│  Vercel (gratuit)                           │
│  gnolab.vercel.app                          │
│  ─ Frontend SPA vanilla JS                  │
│  ─ Fichiers statiques (HTML/CSS/JS)         │
│  ─ Variables d'env : VITE_API_URL           │
└──────────────────┬──────────────────────────┘
                   │ fetch('/api/...')
┌──────────────────▼──────────────────────────┐
│  Railway (gratuit jusqu'à 5$/mois)          │
│  api.gnolab.dev                             │
│  ─ Node.js + Express                        │
│  ─ SQLite persisté sur volume               │
│  ─ Uploads stockés sur le volume            │
└─────────────────────────────────────────────┘
```

**Alternative tout-en-un** : un VPS DigitalOcean à 6$/mois avec Nginx
servant à la fois le frontend et le backend — plus simple à long terme.

---

## 12. Feuille de route des prochaines sessions

### Session 7 — Fondations backend
- Créer `gnolab-api/` avec Express + SQLite
- Écrire le schéma SQL, peupler avec les 5 projets existants
- Routes GET publiques : `/api/projects` et `/api/projects/:slug`
- Brancher le frontend sur la vraie API (3 lignes à changer)
- **Tu apprends** : requête HTTP, route Express, requête SQL SELECT

### Session 8 — Auth + routes protégées
- Créer le compte admin avec bcrypt
- Login → JWT → stockage côté client
- Middleware `authGuard` sur les routes POST/PUT/DELETE
- **Tu apprends** : hash, JWT, middleware, statuts HTTP 401/403

### Session 9 — Upload + routes CRUD projets
- Multer pour les uploads d'images
- CREATE / UPDATE / DELETE projets depuis l'API
- Auto-génération du slug avec slugify
- **Tu apprends** : multipart/form-data, gestion de fichiers, SQL INSERT/UPDATE

### Session 10 — Dashboard Admin (frontend)
- Page `/admin/login` → appel API → stockage JWT
- Page `/admin/projects` → tableau avec actions
- Formulaire de création/édition projet avec upload intégré
- **Tu apprends** : authentification côté client, formulaires dynamiques, fetch avec Authorization header

### Session 11 — Blog backend + frontend
- Routes CRUD articles
- Page `/blog` avec liste paginée
- Page `/blog/:slug` avec rendu Markdown
- Tags et filtrage
- **Tu apprends** : pagination SQL, parsing Markdown, routes dynamiques

### Session 12 — Déploiement & finalisation
- Mettre le backend sur Railway
- Mettre le frontend sur Vercel
- Configurer les variables d'environnement
- Domaine personnalisé
- **Tu apprends** : variables d'environnement, déploiement, CORS en production

---

## 13. Résumé — Ce qu'on construit exactement

```
gnolab/          ← CE QUI EXISTE (frontend)
  44 fichiers
  ~8 800 lignes
  Vanilla JS SPA
  5 pages, particules, galerie, projet, contact

gnolab-api/      ← CE QU'ON VA CONSTRUIRE (backend)
  ~20 fichiers
  ~1 500 lignes estimées
  Node.js + Express
  SQLite
  JWT Auth
  Upload fichiers
  6 semaines · 6 sessions
```

**À la fin :** un portfolio complet, avec backend, dashboard admin,
blog, hébergé, et 100% codé par toi — ligne par ligne.

---

*Plan rédigé pour GnoLab · Mars 2026 · Stack : Node.js + Express + SQLite + JWT*
