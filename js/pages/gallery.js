/* ============================================================
   GnoLab — Page Galerie « Le Mur de Preuves »
   Filtres par outil + certification, recherche, animations scroll
   ============================================================ */

import router       from '../router.js';
import store        from '../state.js';
import { $, $$, setHTML, renderTags } from '../utils/dom.js';
import { navigateWithFlip }           from '../utils/flip.js';
import { ScrollReveal }               from '../utils/scroll-reveal.js';
import { API_URL } from '../config.js';

/* ── Icônes ──────────────────────────────────────────────────── */
const ICONES = {
  etoile:    `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  fleche:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  graphique: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/></svg>`,
  loupe:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  croix:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  filtre:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
};

/* ── Rendu d'une carte projet ────────────────────────────────── */
/**
 * Construit le HTML d'une carte projet individuelle
 * @param {Object} projet  — données du projet
 * @param {number} index   — position dans la grille (pour le stagger)
 * @returns {string} HTML de la carte
 */
function rendreCarte(projet, index) {
  /* Couverture : image réelle ou fallback SVG */
  const couvertureHTML = projet.cover
    ? `<img
        src="${projet.cover}"
        alt="${projet.title}"
        loading="lazy"
        class="card-img"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      >
      <div class="card-cover-fallback" style="display:none">${ICONES.graphique}</div>`
    : `<div class="card-cover-fallback">${ICONES.graphique}</div>`;

  /* Badge certifié — affiché uniquement si projet.certified = true */
  const badgeCertifie = projet.certified
    ? `<div class="badge-certified">${ICONES.etoile} Certifié</div>`
    : '';

  /* Couleur d'accentuation selon l'outil principal */
  const couleurAccent = couleurOutil(projet.tools?.[0]);

  return `
    <article
      class="project-card"
      data-slug="${projet.slug}"
      data-tools="${(projet.tools || []).join(',').toLowerCase()}"
      data-certified="${projet.certified ? 'oui' : 'non'}"
      data-reveal="fade-up"
      data-delay="${index * 60}"
      role="button"
      tabindex="0"
      aria-label="Voir le projet : ${projet.title}"
      style="--card-accent: ${couleurAccent}"
    >
      <!-- Zone image -->
      <div class="card-cover">
        ${couvertureHTML}
        ${badgeCertifie}
        <!-- Indicateur de type (outil principal) -->
        <div class="card-tool-badge">${projet.tools?.[0] ?? 'Data'}</div>
      </div>

      <!-- Corps de la carte -->
      <div class="card-body">
        <h3 class="card-title">${projet.title}</h3>
        <p class="card-excerpt">${projet.excerpt}</p>

        <div class="card-tags">
          ${renderTags(projet.tools)}
        </div>

        <!-- CTA affiché au hover -->
        <div class="card-cta">
          Voir le projet
          ${ICONES.fleche}
        </div>
      </div>

      <!-- Barre d'accent colorée en bas de carte -->
      <div class="card-accent-bar"></div>
    </article>
  `;
}

/* ── Couleur par outil ──────────────────────────────────────── */
/**
 * Retourne une couleur d'accent selon l'outil principal du projet
 * @param {string} outil
 * @returns {string} couleur hex
 */
function couleurOutil(outil) {
  const palette = {
    'python':     '#3b82f6',
    'sql':        '#0074D9',
    'r':          '#10b981',
    'power bi':   '#f59e0b',
    'tableau':    '#ef4444',
    'd3.js':      '#00D9FF',
    'xgboost':    '#8b5cf6',
    'bert':       '#a78bfa',
    'fastapi':    '#10b981',
    'prophet':    '#f59e0b',
    'grafana':    '#ef4444',
  };
  return palette[outil?.toLowerCase()] ?? '#00D9FF';
}

/* ── Squelettes de chargement ────────────────────────────────── */
/**
 * Génère N cartes squelettes pour l'état de chargement
 * @param {number} n
 * @returns {string} HTML
 */
function rendreSqelettes(n = 6) {
  return Array.from({ length: n }, (_, i) => `
    <div class="project-card project-card--skeleton" aria-hidden="true"
         style="animation-delay:${i * 80}ms">
      <div class="card-cover skeleton" style="height:192px;"></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:12px;padding:20px">
        <div class="skeleton" style="height:18px;width:65%;border-radius:4px"></div>
        <div class="skeleton" style="height:13px;width:100%;border-radius:4px"></div>
        <div class="skeleton" style="height:13px;width:78%;border-radius:4px"></div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <div class="skeleton" style="height:22px;width:58px;border-radius:999px"></div>
          <div class="skeleton" style="height:22px;width:48px;border-radius:999px"></div>
          <div class="skeleton" style="height:22px;width:52px;border-radius:999px"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Barre de filtres ────────────────────────────────────────── */
/**
 * Construit la barre de filtres à partir de la liste des projets
 * Extrait tous les outils uniques et construit les boutons filtres
 * @param {Object[]} projets
 * @returns {string} HTML de la barre
 */
function rendreFiltres(projets) {
  /* Collecter tous les outils uniques, triés par fréquence */
  const compteur = {};
  projets.forEach(p => {
    (p.tools || []).forEach(outil => {
      compteur[outil] = (compteur[outil] || 0) + 1;
    });
  });
  const outils = Object.entries(compteur)
    .sort((a, b) => b[1] - a[1])
    .map(([outil]) => outil);

  return `
    <div class="filtres-bar" id="filtres-bar" data-reveal="fade-up" data-delay="100">

      <!-- Recherche textuelle -->
      <div class="filtres-recherche">
        <span class="filtres-recherche-icone">${ICONES.loupe}</span>
        <input
          type="text"
          class="filtres-input"
          id="filtres-input"
          placeholder="Rechercher un projet…"
          aria-label="Rechercher dans les projets"
          autocomplete="off"
        >
        <button class="filtres-clear" id="filtres-clear" aria-label="Effacer la recherche" hidden>
          ${ICONES.croix}
        </button>
      </div>

      <!-- Séparateur -->
      <div class="filtres-sep" aria-hidden="true"></div>

      <!-- Boutons de filtres -->
      <div class="filtres-boutons" role="group" aria-label="Filtrer par outil">
        <!-- Filtre "Tous" -->
        <button
          class="filtre-btn filtre-btn--actif"
          data-filtre="tous"
          aria-pressed="true"
        >Tous <span class="filtre-count">${projets.length}</span></button>

        <!-- Filtre "Certifiés" -->
        <button
          class="filtre-btn filtre-btn--cert"
          data-filtre="certifie"
          aria-pressed="false"
        >${ICONES.etoile} Certifiés <span class="filtre-count">${projets.filter(p => p.certified).length}</span></button>

        <!-- Un bouton par outil -->
        ${outils.map(outil => `
          <button
            class="filtre-btn"
            data-filtre="${outil.toLowerCase()}"
            aria-pressed="false"
            style="--fc: ${couleurOutil(outil)}"
          >${outil} <span class="filtre-count">${compteur[outil]}</span></button>
        `).join('')}
      </div>

      <!-- Compteur de résultats -->
      <div class="filtres-resultat" id="filtres-resultat" aria-live="polite"></div>
    </div>
  `;
}

/* ── Message état vide ───────────────────────────────────────── */
function rendreVide(texte = 'Aucun projet ne correspond à ce filtre.') {
  return `
    <div class="galerie-vide" style="grid-column:1/-1" data-reveal="scale">
      <div class="galerie-vide-icone">${ICONES.filtre}</div>
      <h4>Aucun résultat</h4>
      <p>${texte}</p>
    </div>
  `;
}

/* ── Chargement des projets ──────────────────────────────────── */
/**
 * Charge les projets depuis le JSON (avec cache dans le store)
 * @returns {Promise<Object[]>}
 */
async function chargerProjets() {
  const cache = store.get('projects');
  if (cache?.length) return cache;

const reponse = await fetch(`${API_URL}/api/projects`);
if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`);
const donnees = await reponse.json();
store.set('projects', donnees);
return donnees;
}

/* ── Navigation FLIP vers un projet ─────────────────────────── */
/**
 * Lance la transition immersive carte → page projet
 * @param {HTMLElement} carteEl
 * @param {string} slug
 */
function naviguerVersCarte(carteEl, slug) {
  navigateWithFlip(carteEl, `/projects/${slug}`, router);
}

/* ── Module principal ────────────────────────────────────────── */
/**
 * Monte la page galerie dans le container donné
 * @param {HTMLElement} container
 * @returns {{ destroy(): void }}
 */
export async function mount(container) {

  /* ── Rendu initial avec squelettes ── */
  setHTML(container, `
    <div class="gallery-page">

      <!-- En-tête de page -->
      <div class="page-header">
        <div class="container">
          <p class="page-header__label">Mur de Preuves</p>
          <h2 data-reveal="fade-up">Projets & Analyses</h2>
          <p data-reveal="fade-up" data-delay="80">
            Des problèmes réels. Des données brutes. Des résultats mesurables.
          </p>
        </div>
      </div>

      <div class="container" style="padding-bottom:6rem">
        <!-- Zone filtres (injectée après chargement) -->
        <div id="zone-filtres"></div>

        <!-- Grille de cartes -->
        <div class="gallery-grid" id="gallery-grid" role="list">
          ${rendreSqelettes(6)}
        </div>
      </div>
    </div>
  `);

  /* Lancer le ScrollReveal sur les éléments statiques déjà présents */
  const reveal = ScrollReveal(container);

  const grille      = $('#gallery-grid', container);
  const zoneFiltres = $('#zone-filtres',  container);

  /* ── Chargement des données ── */
  let projets;
  try {
    projets = await chargerProjets();
  } catch (err) {
    console.error('Galerie : échec du chargement des projets', err);
    setHTML(grille, `
      <div class="galerie-vide" style="grid-column:1/-1">
        ${ICONES.graphique}
        <h4>Impossible de charger les projets</h4>
        <p>Vérifiez que le serveur est bien lancé.</p>
      </div>
    `);
    return { destroy() { reveal.destroy(); } };
  }

  /* ── État des filtres ── */
  let filtreActif  = 'tous';   // filtre outil courant
  let texteRecherche = '';     // texte de recherche

  /* ── Injection de la barre de filtres ── */
  setHTML(zoneFiltres, rendreFiltres(projets));
  reveal.ajouterElements(zoneFiltres);

  /* ── Rendu des cartes filtrées ── */
  /**
   * Filtre et affiche les projets selon l'état courant
   * Applique une animation de sortie/entrée douce
   */
  function appliquerFiltres() {
    const rechercheLower = texteRecherche.toLowerCase().trim();

    /* Filtrer les projets */
    const resultat = projets.filter(p => {
      /* Filtre certifié */
      if (filtreActif === 'certifie' && !p.certified) return false;

      /* Filtre outil */
      if (filtreActif !== 'tous' && filtreActif !== 'certifie') {
        const outilsLower = (p.tools || []).map(t => t.toLowerCase());
        if (!outilsLower.includes(filtreActif)) return false;
      }

      /* Filtre texte : titre + excerpt + outils */
      if (rechercheLower) {
        const champ = `${p.title} ${p.excerpt} ${(p.tools || []).join(' ')}`.toLowerCase();
        if (!champ.includes(rechercheLower)) return false;
      }

      return true;
    });

    /* Animation de sortie des cartes actuelles */
    grille.style.opacity   = '0';
    grille.style.transform = 'translateY(8px)';
    grille.style.transition = 'opacity 150ms ease, transform 150ms ease';

    setTimeout(() => {
      /* Injecter les nouvelles cartes ou le message vide */
      if (resultat.length === 0) {
        setHTML(grille, rendreVide());
      } else {
        setHTML(grille, resultat.map((p, i) => rendreCarte(p, i)).join(''));
      }

      /* Remettre la grille visible */
      grille.style.opacity   = '1';
      grille.style.transform = 'translateY(0)';

      /* Lancer les animations d'entrée sur les nouvelles cartes */
      reveal.ajouterElements(grille);

      /* Mettre à jour le compteur */
      const compteurEl = $('#filtres-resultat', container);
      if (compteurEl) {
        compteurEl.textContent = resultat.length < projets.length
          ? `${resultat.length} sur ${projets.length} projets`
          : '';
      }
    }, 150);
  }

  /* ── Rendu initial des cartes ── */
  setHTML(grille, projets.map(rendreCarte).join(''));
  reveal.ajouterElements(grille);

  /* ── Gestion des clics sur les filtres ── */
  const onClicFiltre = (e) => {
    const btn = e.target.closest('.filtre-btn[data-filtre]');
    if (!btn) return;

    /* Mettre à jour l'état actif visuellement */
    $$('.filtre-btn', container).forEach(b => {
      b.classList.remove('filtre-btn--actif');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('filtre-btn--actif');
    btn.setAttribute('aria-pressed', 'true');

    filtreActif = btn.dataset.filtre;
    appliquerFiltres();
  };

  /* ── Gestion de la recherche textuelle ── */
  const inputRecherche = $('#filtres-input', container);
  const btnClear       = $('#filtres-clear',  container);

  const onSaisie = (e) => {
    texteRecherche = e.target.value;
    /* Afficher/masquer le bouton d'effacement */
    if (btnClear) btnClear.hidden = !texteRecherche;
    appliquerFiltres();
  };

  const onEffacer = () => {
    if (inputRecherche) inputRecherche.value = '';
    texteRecherche = '';
    if (btnClear) btnClear.hidden = true;
    inputRecherche?.focus();
    appliquerFiltres();
  };

  /* Raccourci clavier : Escape efface la recherche */
  const onToucheEchap = (e) => {
    if (e.key === 'Escape' && texteRecherche) onEffacer();
  };

  inputRecherche?.addEventListener('input',   onSaisie);
  btnClear?.addEventListener('click',         onEffacer);
  document.addEventListener('keydown',        onToucheEchap);

  /* ── Gestion des clics sur les cartes (délégation) ── */
  const onClicCarte = (e) => {
    const carte = e.target.closest('.project-card[data-slug]');
    if (!carte) return;
    naviguerVersCarte(carte, carte.dataset.slug);
  };

  const onToucheCarte = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const carte = e.target.closest('.project-card[data-slug]');
    if (!carte) return;
    e.preventDefault();
    naviguerVersCarte(carte, carte.dataset.slug);
  };

  const barFiltres = $('#filtres-bar', container);
  barFiltres?.addEventListener('click', onClicFiltre);
  grille.addEventListener('click',    onClicCarte);
  grille.addEventListener('keydown',  onToucheCarte);

  document.title = 'Projets · GnoLab';

  /* ── Nettoyage au démontage de la page ── */
  return {
    destroy() {
      barFiltres?.removeEventListener('click',     onClicFiltre);
      grille.removeEventListener('click',          onClicCarte);
      grille.removeEventListener('keydown',        onToucheCarte);
      inputRecherche?.removeEventListener('input', onSaisie);
      btnClear?.removeEventListener('click',       onEffacer);
      document.removeEventListener('keydown',      onToucheEchap);
      reveal.destroy();
    },
  };
}