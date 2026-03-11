/**
 * seed.js — Charge les projets de projects.json dans la base SQLite.
 *
 * Usage (depuis le dossier gnolab-api/) :
 *   node db/seed.js ../projects.json
 *
 * Si ton projects.json est ailleurs, donne le chemin complet :
 *   node db/seed.js C:\projets\portfolio\portofolio_web\projects.json
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const db   = require('./database');

// ── Lire l'argument en ligne de commande ──────────────────────────────────────
const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error('❌ Usage : node db/seed.js <chemin/vers/projects.json>');
  process.exit(1);
}

const fullPath = path.resolve(jsonPath);

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Fichier introuvable : ${fullPath}`);
  process.exit(1);
}

const projets = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
console.log(`\n📂 ${projets.length} projets trouvés dans ${fullPath}\n`);

// ── Insertion en base ─────────────────────────────────────────────────────────
const stmt = db.prepare(`
  INSERT OR IGNORE INTO projects
    (slug, title, excerpt, challenge, solution, proofs, tools, snippet, cover, certificate, certified, sort_order, published)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAll = (liste) => {
  let ok = 0;
  let skip = 0;

  db.exec('BEGIN');
  try {
    for (let i = 0; i < liste.length; i++) {
      const p = liste[i];

      const result = stmt.run(
        p.slug,
        p.title,
        p.excerpt     || null,
        p.challenge   || null,
        p.solution    || null,
        p.proofs      || null,
        p.tools       ? JSON.stringify(p.tools)   : null,
        p.snippet     ? JSON.stringify(p.snippet) : null,
        p.cover       || null,
        p.certificate || null,
        p.certified   ? 1 : 0,
        i,
        1
      );

      if (result.changes > 0) {
        console.log(`  ✅ Inséré : ${p.title}`);
        ok++;
      } else {
        console.log(`  ⏭  Ignoré (slug existe déjà) : ${p.slug}`);
        skip++;
      }
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  return { ok, skip };
};

const { ok, skip } = insertAll(projets);

console.log(`\n🎉 Seed terminé : ${ok} inséré(s), ${skip} ignoré(s).`);
console.log('   Teste avec : curl http://localhost:3001/api/projects\n');
