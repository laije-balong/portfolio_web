-- ════════════════════════════════════════════════════════════════
--  GnoLab — Schéma de base de données SQLite
--  Ce fichier sert de documentation vivante.
--  La vraie initialisation se fait dans database.js
-- ════════════════════════════════════════════════════════════════

-- ── UTILISATEURS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  username   TEXT     NOT NULL UNIQUE,
  email      TEXT     NOT NULL UNIQUE,
  password   TEXT     NOT NULL,   -- hash bcrypt, JAMAIS en clair
  role       TEXT     NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── PROJETS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  slug        TEXT     NOT NULL UNIQUE,
  title       TEXT     NOT NULL,
  excerpt     TEXT,
  challenge   TEXT,
  solution    TEXT,
  proofs      TEXT,
  tools       TEXT,               -- JSON array : '["Python","SQL"]'
  cover       TEXT,               -- chemin : "/uploads/covers/stock.jpg"
  certificate TEXT,               -- chemin ou NULL
  certified   INTEGER  NOT NULL DEFAULT 0,   -- 0 = false, 1 = true
  sort_order  INTEGER  NOT NULL DEFAULT 0,
  published   INTEGER  NOT NULL DEFAULT 1,   -- 0 = brouillon, 1 = publié
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── ARTICLES DE BLOG ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  slug         TEXT     NOT NULL UNIQUE,
  title        TEXT     NOT NULL,
  excerpt      TEXT,
  content      TEXT,              -- Markdown complet
  cover        TEXT,
  tags         TEXT,              -- JSON array : '["Python","ML"]'
  reading_time INTEGER,           -- minutes estimées
  published    INTEGER  NOT NULL DEFAULT 0,
  published_at DATETIME,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── TRIGGERS : mise à jour automatique de updated_at ─────────────────────────
CREATE TRIGGER IF NOT EXISTS projects_updated_at
  AFTER UPDATE ON projects
  BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS articles_updated_at
  AFTER UPDATE ON articles
  BEGIN
    UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
