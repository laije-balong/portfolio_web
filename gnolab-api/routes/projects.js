const express   = require('express');
const slugify   = require('slugify');
const db        = require('../db/database');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// ── Utilitaire : parser les champs JSON stockés en TEXT ───────────────────────
function parseProject(p) {
  if (!p) return null;
  return {
    ...p,
    tools:     p.tools   ? JSON.parse(p.tools)   : [],
    snippet:   p.snippet ? JSON.parse(p.snippet) : null,
    certified: Boolean(p.certified),
    published: Boolean(p.published),
  };
}

// ── GET /api/projects ─────────────────────────────────────────────────────────
// Public : retourne les projets publiés (ou tous si admin avec ?all=1)
router.get('/', (req, res, next) => {
  try {
    const showAll = req.query.all === '1'; // réservé à l'admin — on vérifiera le token plus tard

    const rows = showAll
      ? db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, id ASC').all()
      : db.prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, id ASC').all();

    res.json(rows.map(parseProject));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/projects/:slug ───────────────────────────────────────────────────
router.get('/:slug', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM projects WHERE slug = ?').get(req.params.slug);

    if (!row) {
      return res.status(404).json({ error: 'Projet introuvable.' });
    }

    res.json(parseProject(row));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/projects ────────────────────────────────────────────────────────
// Protégé — créer un nouveau projet
router.post('/', authGuard, (req, res, next) => {
  try {
    const { title, excerpt, challenge, solution, proofs, tools, snippet, cover, certificate, certified, sort_order, published } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Le champ title est requis.' });
    }

    // Générer un slug unique à partir du titre
    let slug = slugify(title, { lower: true, strict: true });

    // S'assurer que le slug est unique
    const existing = db.prepare('SELECT id FROM projects WHERE slug = ?').get(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const stmt = db.prepare(`
      INSERT INTO projects
        (slug, title, excerpt, challenge, solution, proofs, tools, snippet, cover, certificate, certified, sort_order, published)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      slug,
      title,
      excerpt     || null,
      challenge   || null,
      solution    || null,
      proofs      || null,
      tools       ? JSON.stringify(tools)    : null,
      snippet     ? JSON.stringify(snippet)  : null,
      cover       || null,
      certificate || null,
      certified   ? 1 : 0,
      sort_order  ?? 0,
      published   !== undefined ? (published ? 1 : 0) : 1
    );

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(parseProject(created));

  } catch (err) {
    next(err);
  }
});

// ── PUT /api/projects/:id ─────────────────────────────────────────────────────
// Protégé — modifier un projet
router.put('/:id', authGuard, (req, res, next) => {
  try {
    const { title, excerpt, challenge, solution, proofs, tools, snippet, cover, certificate, certified, sort_order, published } = req.body;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Projet introuvable.' });
    }

    const stmt = db.prepare(`
      UPDATE projects SET
        title = ?, excerpt = ?, challenge = ?, solution = ?,
        proofs = ?, tools = ?, snippet = ?, cover = ?, certificate = ?,
        certified = ?, sort_order = ?, published = ?
      WHERE id = ?
    `);

    stmt.run(
      title       ?? project.title,
      excerpt     ?? project.excerpt,
      challenge   ?? project.challenge,
      solution    ?? project.solution,
      proofs      ?? project.proofs,
      tools !== undefined    ? JSON.stringify(tools)    : project.tools,
      snippet !== undefined  ? JSON.stringify(snippet)  : project.snippet,
      cover       ?? project.cover,
      certificate ?? project.certificate,
      certified !== undefined ? (certified ? 1 : 0) : project.certified,
      sort_order  ?? project.sort_order,
      published !== undefined ? (published ? 1 : 0) : project.published,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json(parseProject(updated));

  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/projects/:id ──────────────────────────────────────────────────
// Protégé — supprimer un projet
router.delete('/:id', authGuard, (req, res, next) => {
  try {
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projet introuvable.' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Projet supprimé.' });

  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/projects/reorder ───────────────────────────────────────────────
// Protégé — réordonner les projets (drag & drop)
// Body : [ { id: 1, order: 0 }, { id: 2, order: 1 }, ... ]
router.patch('/reorder', authGuard, (req, res, next) => {
  try {
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body doit être un tableau [{ id, order }].' });
    }

    const stmt = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');

    // Transaction manuelle (node:sqlite ne supporte pas db.transaction())
    db.exec('BEGIN');
    try {
      for (const item of items) {
        stmt.run(item.order, item.id);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    res.json({ success: true });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
