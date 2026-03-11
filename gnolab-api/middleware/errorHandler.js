/**
 * errorHandler — middleware de gestion centralisée des erreurs.
 * Doit être déclaré EN DERNIER dans server.js (après toutes les routes).
 *
 * Pour déclencher ce handler depuis n'importe quelle route :
 *   next(new Error('Quelque chose a mal tourné'));
 *   // ou avec un statut personnalisé :
 *   const err = new Error('Introuvable'); err.status = 404; next(err);
 */
function errorHandler(err, req, res, next) {
  const status  = err.status  || 500;
  const message = err.message || 'Erreur interne du serveur.';

  // Log complet dans le terminal (utile en développement)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${status}] ${req.method} ${req.url} — ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
