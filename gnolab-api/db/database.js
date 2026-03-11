/**
 * database.js — Connexion SQLite via le module natif Node.js.
 *
 * node:sqlite est intégré à Node.js depuis la v22.5.
 * Aucune dépendance externe, aucune compilation nécessaire.
 * L'API est synchrone, identique à better-sqlite3.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs   = require('fs');

// ── Chemin vers le fichier .db ────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'gnolab.db');

// ── Connexion (crée le fichier s'il n'existe pas) ─────────────────────────────
const db = new DatabaseSync(DB_PATH);

// Performance : activer WAL et les clés étrangères
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// ── Initialisation du schéma ──────────────────────────────────────────────────
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

console.log('✅ Base de données SQLite connectée :', DB_PATH);

module.exports = db;

