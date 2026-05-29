/* ============================================================
   GnoLab — Lightbox
   Modal plein-écran pour afficher images et certificats
   ============================================================ */

/* ── État interne ────────────────────────────────────────────── */
let ouverte     = false;
let conteneur   = null;
let onKeyDown   = null;

/* ── Styles injectés une seule fois ─────────────────────────── */
function injecterStyles() {
  if (document.getElementById('lightbox-styles')) return;
  const style = document.createElement('style');
  style.id = 'lightbox-styles';
  style.textContent = `
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(2,6,23,0);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      transition: background 300ms ease;
      cursor: zoom-out;
    }
    .lightbox-overlay.is-visible {
      background: rgba(2,6,23,0.92);
    }
    .lightbox-overlay.is-visible .lightbox-panel {
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    .lightbox-panel {
      position: relative;
      max-width: 860px;
      width: 100%;
      opacity: 0;
      transform: scale(0.92) translateY(20px);
      transition: opacity 320ms cubic-bezier(0.2,0.8,0.2,1),
                  transform 320ms cubic-bezier(0.2,0.8,0.2,1);
      cursor: default;
    }

    .lightbox-panel img {
      width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.7);
      display: block;
    }

    .lightbox-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .lightbox-titre {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .lightbox-fermer {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 150ms ease, color 150ms ease, transform 150ms ease;
      flex-shrink: 0;
    }
    .lightbox-fermer:hover {
      background: rgba(255,255,255,0.14);
      color: #fff;
      transform: rotate(90deg);
    }

    .lightbox-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 16px;
      gap: 12px;
    }

    .lightbox-lien {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      cursor: pointer;
      transition: background 150ms ease, color 150ms ease;
    }
    .lightbox-lien:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    .lightbox-lien svg { width: 13px; height: 13px; }

    .lightbox-erreur {
      padding: 3rem;
      text-align: center;
      background: #0b1220;
      border-radius: 12px;
      color: rgba(255,255,255,0.5);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      border: 1px solid rgba(255,255,255,0.08);
    }

    /* Mode clair */
    [data-theme="light"] .lightbox-overlay.is-visible {
      background: rgba(15,23,42,0.7);
    }
  `;
  document.head.appendChild(style);
}

/* ── Ouvrir la lightbox ──────────────────────────────────────── */
/**
 * Affiche une image/certificat dans la lightbox
 * @param {string} url    — URL de l'image
 * @param {string} [titre] — texte descriptif affiché en haut
 */
export function ouvrirLightbox(url, titre = 'Certificat') {
  if (ouverte) fermerLightbox();
  injecterStyles();
  ouverte = true;

  /* Construire l'overlay */
  conteneur = document.createElement('div');
  conteneur.className = 'lightbox-overlay';
  conteneur.setAttribute('role', 'dialog');
  conteneur.setAttribute('aria-modal', 'true');
  conteneur.setAttribute('aria-label', titre);

  const iconFermer = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>`;
  const iconLien = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>`;

  conteneur.innerHTML = `
    <div class="lightbox-panel">
      <div class="lightbox-header">
        <span class="lightbox-titre">${titre}</span>
        <button class="lightbox-fermer" id="lb-close" aria-label="Fermer">
          ${iconFermer}
        </button>
      </div>
      <div id="lb-body">
        <div class="lightbox-erreur">Chargement…</div>
      </div>
      <div class="lightbox-footer">
        <a href="${url}" download class="lightbox-lien" aria-label="Télécharger le certificat">
          ${iconLien} Télécharger
        </a>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="lightbox-lien"
           aria-label="Ouvrir dans un nouvel onglet">
          ${iconLien} Ouvrir
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(conteneur);
  document.body.style.overflow = 'hidden';

  /* Afficher l'image après chargement */
  const img = new Image();
  img.alt = titre;
  img.onload = () => {
    const corps = document.getElementById('lb-body');
    if (corps) corps.innerHTML = '';
    corps?.appendChild(img);
  };
  img.onerror = () => {
    const corps = document.getElementById('lb-body');
    if (corps) corps.innerHTML = `
      <div class="lightbox-erreur">
        Image introuvable — <code>${url}</code>
      </div>`;
  };
  img.src = url;

  /* Animer l'entrée */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => conteneur.classList.add('is-visible'));
  });

  /* Fermer au clic sur le fond */
  conteneur.addEventListener('click', (e) => {
    if (e.target === conteneur) fermerLightbox();
  });

  /* Fermer via le bouton × */
  document.getElementById('lb-close')?.addEventListener('click', fermerLightbox);

  /* Fermer avec Escape */
  onKeyDown = (e) => { if (e.key === 'Escape') fermerLightbox(); };
  document.addEventListener('keydown', onKeyDown);

  /* Focus sur le bouton fermer */
  setTimeout(() => document.getElementById('lb-close')?.focus(), 50);
}

/* ── Fermer la lightbox ──────────────────────────────────────── */
export function fermerLightbox() {
  if (!ouverte || !conteneur) return;

  /* Animer la sortie */
  conteneur.classList.remove('is-visible');

  setTimeout(() => {
    conteneur?.remove();
    conteneur = null;
    document.body.style.overflow = '';
    ouverte = false;
  }, 300);

  if (onKeyDown) {
    document.removeEventListener('keydown', onKeyDown);
    onKeyDown = null;
  }
}