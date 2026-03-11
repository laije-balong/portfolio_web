const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

// ── Chemin vers le fichier .db ────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'gnolab.db');

// ── Connexion (crée le fichier s'il n'existe pas) ─────────────────────────────
const db = new Database(DB_PATH);

// Performance : activer le mode WAL (Write-Ahead Logging)
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Initialisation du schéma ──────────────────────────────────────────────────
// Lit schema.sql et exécute toutes les instructions au démarrage
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

console.log('✅ Base de données SQLite connectée :', DB_PATH);

module.exports = db;
