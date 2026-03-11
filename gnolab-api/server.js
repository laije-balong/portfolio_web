require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const authRoutes     = require('./routes/auth');
const projectRoutes  = require('./routes/projects');
const blogRoutes     = require('./routes/blog');
const uploadRoutes   = require('./routes/upload');
const errorHandler   = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globaux ───────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));           // logs des requêtes dans le terminal
app.use(express.json());          // parse le body JSON
app.use(express.urlencoded({ extended: true }));

// ── Fichiers statiques (images uploadées) ────────────────────────────────────

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes API ───────────────────────────────────────────────────────────────

app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/articles', blogRoutes);
app.use('/api/upload',   uploadRoutes);

// ── Route de santé (vérifier que le serveur tourne) ──────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GnoLab API opérationnelle' });
});

// ── Gestion des erreurs (toujours en dernier) ────────────────────────────────

app.use(errorHandler);

// ── Démarrage ────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur GnoLab démarré sur http://localhost:${PORT}`);
  console.log(`   Health check : http://localhost:${PORT}/api/health\n`);
});
