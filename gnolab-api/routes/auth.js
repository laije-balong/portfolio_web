const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db/database');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Body : { username, password }
// Retour : { token, expiresIn, user: { id, username, role } }
router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username et mot de passe requis.' });
    }

    // Chercher l'utilisateur en base
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    // Comparer le mot de passe avec le hash bcrypt
    const passwordOk = bcrypt.compareSync(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      user: { id: user.id, username: user.username, role: user.role },
    });

  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// Le logout est géré côté client (supprimer le token du localStorage).
// Cette route confirme juste la déconnexion.
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie. Supprime le token côté client.' });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Protégé — retourne l'utilisateur connecté
router.get('/me', authGuard, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  res.json(user);
});

// ── POST /api/auth/setup ──────────────────────────────────────────────────────
// Crée le compte admin initial (désactiver après la première utilisation !).
// Route utilitaire — à appeler UNE SEULE FOIS pour initialiser l'admin.
router.post('/setup', (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email et password sont requis.' });
    }

    // Vérifier qu'aucun admin n'existe déjà
    const existing = db.prepare('SELECT id FROM users LIMIT 1').get();
    if (existing) {
      return res.status(403).json({ error: 'Un compte admin existe déjà.' });
    }

    const hash = bcrypt.hashSync(password, 12);

    const stmt = db.prepare(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(username, email, hash, 'admin');

    res.status(201).json({
      message: 'Compte admin créé avec succès.',
      id: result.lastInsertRowid,
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
