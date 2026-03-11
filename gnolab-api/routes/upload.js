const express   = require('express');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// ── Configuration stockage ────────────────────────────────────────────────────

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(__dirname, '..', 'uploads', subfolder);
      fs.mkdirSync(dir, { recursive: true }); // créer le dossier si absent
      cb(null, dir);
    },
    filename(req, file, cb) {
      const ext  = path.extname(file.originalname).toLowerCase();
      const name = path.basename(file.originalname, ext)
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase();
      cb(null, `${name}-${Date.now()}${ext}`);
    },
  });
}

// ── Filtres de types de fichiers ──────────────────────────────────────────────

function imageFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les formats JPG, PNG et WebP sont acceptés.'), false);
  }
}

function certFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les formats JPG, PNG, WebP et PDF sont acceptés.'), false);
  }
}

// ── Instances multer ──────────────────────────────────────────────────────────

const uploadCover = multer({
  storage:  makeStorage('covers'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

const uploadCert = multer({
  storage:  makeStorage('certificates'),
  fileFilter: certFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── POST /api/upload/cover ────────────────────────────────────────────────────
// Form-data : file (image)
// Retour    : { url: "/uploads/covers/nom-1234.jpg" }
router.post('/cover', authGuard, uploadCover.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  const url = `/uploads/covers/${req.file.filename}`;
  res.status(201).json({ url });
});

// ── POST /api/upload/certificate ─────────────────────────────────────────────
// Form-data : file (image ou PDF)
// Retour    : { url: "/uploads/certificates/nom-1234.pdf" }
router.post('/certificate', authGuard, uploadCert.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  const url = `/uploads/certificates/${req.file.filename}`;
  res.status(201).json({ url });
});

// ── Gestion des erreurs Multer ────────────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Fichier trop volumineux.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
