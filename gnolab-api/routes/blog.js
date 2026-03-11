const express   = require('express');
const slugify   = require('slugify');
const db        = require('../db/database');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// ── Utilitaire : parser un article ───────────────────────────────────────────
function parseArticle(a) {
  if (!a) return null;
  return {
    ...a,
    tags:      a.tags      ? JSON.parse(a.tags)      : [],
    published: Boolean(a.published),
  };
}

// ── GET /api/articles ─────────────────────────────────────────────────────────
// Query params :
//   ?published=1   → uniquement les publiés (défaut public)
//   ?tag=Python    → filtrer par tag
//   ?page=1        → pagination (défaut page 1)
//   ?limit=10      → articles par page (défaut 10)
router.get('/', (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let where = [];
    let params = [];

    // Par défaut, les visiteurs ne voient que les publiés
    if (req.query.published !== '0') {
      where.push('published = 1');
    }

    const sql       = `SELECT * FROM articles${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`;
    const countSql  = `SELECT COUNT(*) as total FROM articles${where.length ? ' WHERE ' + where.join(' AND ') : ''}`;

    let articles = db.prepare(sql).all(...params, limit, offset).map(parseArticle);
    const { total } = db.prepare(countSql).get(...params);

    // Filtrage par tag côté JS (simple pour SQLite sans JSON functions)
    if (req.query.tag) {
      const tag = req.query.tag.toLowerCase();
      articles = articles.filter(a => a.tags.some(t => t.toLowerCase() === tag));
    }

    res.json({
      articles,
      total,
      page,
      pages: Math.ceil(total / limit),
    });

  } catch (err) {
    next(err);
  }
});

// ── GET /api/articles/:slug ───────────────────────────────────────────────────
router.get('/:slug', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);

    if (!row) {
      return res.status(404).json({ error: 'Article introuvable.' });
    }

    res.json(parseArticle(row));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/articles ────────────────────────────────────────────────────────
// Protégé — créer un article
router.post('/', authGuard, (req, res, next) => {
  try {
    const { title, excerpt, content, cover, tags, reading_time, published } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Le champ title est requis.' });
    }

    let slug = slugify(title, { lower: true, strict: true });
    const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    const isPublished = published ? 1 : 0;
    const publishedAt = isPublished ? new Date().toISOString() : null;

    const stmt = db.prepare(`
      INSERT INTO articles
        (slug, title, excerpt, content, cover, tags, reading_time, published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      slug,
      title,
      excerpt      || null,
      content      || null,
      cover        || null,
      tags         ? JSON.stringify(tags) : null,
      reading_time || null,
      isPublished,
      publishedAt
    );

    const created = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(parseArticle(created));

  } catch (err) {
    next(err);
  }
});

// ── PUT /api/articles/:id ─────────────────────────────────────────────────────
// Protégé — modifier un article
router.put('/:id', authGuard, (req, res, next) => {
  try {
    const { title, excerpt, content, cover, tags, reading_time, published } = req.body;

    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article introuvable.' });
    }

    // Si on publie pour la première fois, enregistrer la date
    const wasPublished = Boolean(article.published);
    const willPublish  = published !== undefined ? Boolean(published) : wasPublished;
    const publishedAt  = !wasPublished && willPublish ? new Date().toISOString() : article.published_at;

    const stmt = db.prepare(`
      UPDATE articles SET
        title = ?, excerpt = ?, content = ?, cover = ?,
        tags = ?, reading_time = ?, published = ?, published_at = ?
      WHERE id = ?
    `);

    stmt.run(
      title        ?? article.title,
      excerpt      ?? article.excerpt,
      content      ?? article.content,
      cover        ?? article.cover,
      tags !== undefined ? JSON.stringify(tags) : article.tags,
      reading_time ?? article.reading_time,
      willPublish ? 1 : 0,
      publishedAt,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    res.json(parseArticle(updated));

  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/articles/:id ──────────────────────────────────────────────────
// Protégé
router.delete('/:id', authGuard, (req, res, next) => {
  try {
    const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article introuvable.' });
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Article supprimé.' });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
