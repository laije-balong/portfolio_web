const jwt = require('jsonwebtoken');

/**
 * authGuard — middleware qui vérifie le token JWT.
 *
 * Utilisation sur une route protégée :
 *   router.post('/api/projects', authGuard, (req, res) => { ... });
 *
 * Le token doit être envoyé dans le header :
 *   Authorization: Bearer <token>
 */
function authGuard(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant — connecte-toi d\'abord.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré — reconnecte-toi.' });
    }
    return res.status(403).json({ error: 'Token invalide.' });
  }
}

module.exports = authGuard;
