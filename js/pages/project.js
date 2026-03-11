/* ============================================================
   GnoLab — Page Projet (vue détaillée)
   Layout split : récit à gauche, MiniChart interactif à droite
   ============================================================ */

import router from '../router.js';
import store  from '../state.js';
import { $, $$, setHTML, renderTags } from '../utils/dom.js';
import { flip }       from '../utils/flip.js';
import { MiniChart }  from '../charts/MiniChart.js';
import { ScrollReveal }   from '../utils/scroll-reveal.js';
import { ouvrirLightbox } from '../utils/lightbox.js';


/* ── Mini-highlighter syntaxique (Python/JS) ──────────────────
   Pas de dépendance externe. Tokenisation par regex ordonnée.
   Couvre : mots-clés, strings, commentaires, nombres, fonctions.
   ──────────────────────────────────────────────────────────── */
function highlighter(code, lang = 'python') {
  const KW_PY = /\b(def|class|return|import|from|as|if|elif|else|for|while|with|in|not|and|or|True|False|None|pass|raise|try|except|finally|yield|async|await|lambda)\b/g;
  const KW_JS = /\b(const|let|var|function|return|import|export|from|if|else|for|while|of|in|new|class|extends|async|await|typeof|null|undefined|true|false)\b/g;
  const KW    = lang === 'python' ? KW_PY : KW_JS;

  /* Ordre important : commentaires et strings d'abord */
  const RULES = [
    [/#[^\n]*/g,                            'hl-comm'],   // # commentaire Python
    [/\/\/[^\n]*/g,                         'hl-comm'],   // // commentaire JS
    [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, 'hl-str'],    // triple quotes
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 'hl-str'],  // strings
    [KW,                                     'hl-kw'],    // mots-clés
    [/\b([A-Z][a-zA-Z0-9_]*)\b/g,           'hl-type'],  // Types / Classes
    [/\b([a-z_][a-z0-9_]*)(?=\s*\()/g,     'hl-fn'],    // fonctions()
    [/\b(\d+\.?\d*)\b/g,                  'hl-num'],   // nombres
    [/@[\w.]+/g,                            'hl-deco'],  // @decorateurs
  ];

  /* Remplacer les tokens par des <span> avec classes CSS.
     On travaille sur un tableau de segments pour éviter les
     collisions de remplacement. */
  const PLACEHOLDER = '\x00';
  let result = code;

  // Échapper le HTML d'abord
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Appliquer chaque règle
  RULES.forEach(([re, cls]) => {
    result = result.replace(re, m =>
      `<span class="${cls}">${m}</span>`
    );
  });

  return result;
}

/* ── Icônes ──────────────────────────────────────────────────── */
const ICONES = {
  retour: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m0 0l7 7m-7-7 7-7"/></svg>`,
  cert:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  lien:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  etoile: `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
};

/* ── États de visualisation disponibles ─────────────────────── */
const ETATS = [
  { id: 'raw',     label: 'Brut',     desc: 'Données originales non traitées' },
  { id: 'cleaned', label: 'Nettoyé',  desc: 'Données structurées et filtrées' },
  { id: 'results', label: 'Résultats', desc: 'Insights et métriques finaux' },
];

/* ── Chargement d'un projet ──────────────────────────────────── */
/**
 * Récupère un projet par son slug depuis le cache ou l'API
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
async function chargerProjet(slug) {
  /* Chercher dans le cache du store en priorité */
  const cache = store.get('projects') || [];
  const trouve = cache.find(p => p.slug === slug);
  if (trouve) return trouve;

  /* Sinon appeler directement l'endpoint par slug */
  const reponse = await fetch(`${API_URL}/api/projects/${slug}`);
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
  return await reponse.json();
}

/* ── Construction du HTML de la page ────────────────────────── */
/**
 * @param {Object} projet  — données complètes du projet
 * @returns {string} HTML complet de la page
 */
function construirePage(projet) {
  /* Badge certifié optionnel */
  const badgeCertif = projet.certified
    ? `<span class="proj-badge-cert">${ICONES.etoile} Certifié</span>`
    : '';

  /* Bouton certificat optionnel */
  const btnCertif = projet.certified && projet.certificate
    ? `<button class="proj-btn-cert cert-btn" data-cert-url="${projet.certificate}"
         aria-label="Voir le certificat du projet">
         ${ICONES.cert} Voir le certificat ${ICONES.lien}
       </button>`
    : '';

  return `
    <div class="projet-page">

      <!-- ── En-tête navigation ── -->
      <div class="proj-header container" data-reveal="fade-up">
        <button class="proj-btn-retour" id="back-btn" aria-label="Retour aux projets">
          ${ICONES.retour} Retour
        </button>
        ${badgeCertif}
      </div>

      <!-- ── Layout split ── -->
      <div class="container proj-layout">

        <!-- Colonne gauche : récit scrollable -->
        <div class="projet-recit">

          <!-- Titre + tags -->
          <div class="proj-intro" data-reveal="fade-right">
            <h1 class="proj-titre">${projet.title}</h1>
            <p class="proj-excerpt">${projet.excerpt}</p>
            <div class="proj-tags">${renderTags(projet.tools)}</div>
          </div>

          <!-- Section Challenge -->
          <section class="proj-section" data-reveal="fade-right" data-delay="80">
            <div class="proj-section-label">01 — Challenge</div>
            <h3 class="proj-section-titre">Le problème à résoudre</h3>
            <p class="proj-section-texte">${projet.challenge || 'Non renseigné.'}</p>
          </section>

          <!-- Section Solution -->
          <section class="proj-section" data-reveal="fade-right" data-delay="80">
            <div class="proj-section-label">02 — Solution</div>
            <h3 class="proj-section-titre">L'approche technique</h3>
            <p class="proj-section-texte">${projet.solution || 'Non renseigné.'}</p>
          </section>

          <!-- Section Preuves -->
          <section class="proj-section" data-reveal="fade-right" data-delay="80">
            <div class="proj-section-label">03 — Résultats</div>
            <h3 class="proj-section-titre">Preuves mesurables</h3>
            <p class="proj-section-texte">${projet.proofs || 'Non renseigné.'}</p>
          </section>

          <!-- Section Extrait de code -->
          ${projet.snippet ? `
          <section class="proj-section proj-section--code" data-reveal="fade-right" data-delay="100">
            <div class="proj-section-label">04 — Extrait de code</div>
            <h3 class="proj-section-titre">Implémentation</h3>
            <div class="code-block">
              <div class="code-block__bar">
                <span class="code-block__dot"></span>
                <span class="code-block__dot"></span>
                <span class="code-block__dot"></span>
                <span class="code-block__filename">${projet.snippet.filename}</span>
                <span class="code-block__lang">${projet.snippet.lang}</span>
              </div>
              <pre class="code-block__pre"><code class="code-block__code">${highlighter(projet.snippet.code, projet.snippet.lang)}</code></pre>
            </div>
          </section>
          ` : ''}

          <!-- Bouton certificat -->
          ${btnCertif ? `<div class="proj-certif-wrap" data-reveal="fade-up">${btnCertif}</div>` : ''}
        </div>

        <!-- Colonne droite : visualisation interactive (sticky) -->
        <aside class="proj-viz-panel">
          <div class="visual-card" data-reveal="fade-left">

            <!-- En-tête de la carte visuelle -->
            <div class="visual-card__header">
              <span class="visual-card__label">Visualisation interactive</span>
              <span class="visual-card__outil">${projet.tools?.[0] ?? 'Data'}</span>
            </div>

            <!-- Zone du graphique animé -->
            <div class="visual-card__canvas" id="viz-canvas"></div>

            <!-- Boutons d'état Brut / Nettoyé / Résultats -->
            <div class="state-buttons" role="group" aria-label="Choisir la vue">
              ${ETATS.map(e => `
                <button
                  class="state-btn ${e.id === 'raw' ? 'is-active' : ''}"
                  data-state="${e.id}"
                  title="${e.desc}"
                  aria-pressed="${e.id === 'raw'}"
                >${e.label}</button>
              `).join('')}
            </div>

            <!-- Description de l'état actif -->
            <p class="visual-card__desc" id="viz-desc">${ETATS[0].desc}</p>
          </div>
        </aside>
      </div>
    </div>
  `;
}

/* ── Module principal ─────────────────────────────────────────── */
/**
 * Monte la page projet identifiée par le slug dans l'URL
 * @param {HTMLElement} container
 * @param {Object}      params    — paramètres de route { slug }
 * @returns {{ destroy(): void }}
 */
export async function mount(container, params) {
  const slug = params?.slug;

  /* ── Squelette de chargement ── */
  setHTML(container, `
    <div class="container" style="padding-top:6rem">
      <div class="proj-layout">
        <div class="projet-recit" style="padding-top:2rem">
          <div class="skeleton" style="height:40px;width:55%;margin-bottom:1.5rem;border-radius:8px"></div>
          <div class="skeleton" style="height:60px;width:90%;margin-bottom:1rem;border-radius:8px"></div>
          <div class="skeleton" style="height:16px;width:100%;margin-bottom:0.5rem;border-radius:4px"></div>
          <div class="skeleton" style="height:16px;width:80%;border-radius:4px"></div>
        </div>
        <div class="proj-viz-panel" style="padding-top:2rem">
          <div class="skeleton" style="height:360px;border-radius:16px"></div>
        </div>
      </div>
    </div>
  `);

  /* ── Chargement du projet ── */
  let projet;
  try {
    projet = await chargerProjet(slug);
  } catch (err) {
    console.error('Page projet : échec du chargement', err);
  }

  /* Projet introuvable */
  if (!projet) {
    setHTML(container, `
      <div class="container" style="padding-top:8rem;text-align:center">
        <h2>Projet introuvable</h2>
        <p style="margin-block:1rem">Le projet « ${slug} » n'existe pas.</p>
        <button class="hero-btn hero-btn--secondary" id="back-404">
          Retour aux projets
        </button>
      </div>
    `);
    $('#back-404', container)?.addEventListener('click', () => router.push('/projects'));
    return { destroy() {} };
  }

  /* ── Rendu de la page ── */
  setHTML(container, construirePage(projet));
  document.title = `${projet.title} · GnoLab`;

  /* Révéler l'overlay FLIP (agrandi pendant le clic sur la carte) */
  flip.reveal(60);

  /* ── Animations scroll ── */
  const reveal = ScrollReveal(container);

  /* ── MiniChart interactif ── */
  const vizCanvas = $('#viz-canvas', container);
  const descViz   = $('#viz-desc',   container);
  let miniChart   = null;
  let etatActif   = 'raw';

  if (vizCanvas) {
    miniChart = MiniChart(vizCanvas, projet);
  }

  /* ── Changement d'état de visualisation ── */
  /**
   * Bascule le graphique vers le nouvel état et met à jour les boutons
   * @param {string} nouvelEtat — 'raw' | 'cleaned' | 'results'
   */
  const changerEtat = (nouvelEtat) => {
    if (nouvelEtat === etatActif) return;
    etatActif = nouvelEtat;

    /* Mettre à jour les boutons */
    $$('.state-btn', container).forEach(btn => {
      const actif = btn.dataset.state === nouvelEtat;
      btn.classList.toggle('is-active', actif);
      btn.setAttribute('aria-pressed', String(actif));
    });

    /* Mettre à jour la description */
    const config = ETATS.find(e => e.id === nouvelEtat);
    if (descViz && config) descViz.textContent = config.desc;

    /* Déléguer au MiniChart */
    miniChart?.switchTo(nouvelEtat);
  };

  /* Délégation d'événements sur les boutons d'état */
  const onClicEtat = (e) => {
    const btn = e.target.closest('.state-btn[data-state]');
    if (btn) changerEtat(btn.dataset.state);
  };

  const groupeEtats = container.querySelector('.state-buttons');
  groupeEtats?.addEventListener('click', onClicEtat);

  /* ── Bouton retour ── */
  const btnRetour = $('#back-btn', container);
  const versGalerie = () => router.push('/projects');
  btnRetour?.addEventListener('click', versGalerie);

  /* ── Bouton certificat ── */
  const btnCertif = container.querySelector('.cert-btn[data-cert-url]');
  const ouvrirCertif = () => {
    const url = btnCertif?.dataset.certUrl;
    if (url) ouvrirLightbox(url, `Certificat — ${projet.title}`);
  };
  btnCertif?.addEventListener('click', ouvrirCertif);

  /* ── Nettoyage au démontage ── */
  return {
    destroy() {
      groupeEtats?.removeEventListener('click',  onClicEtat);
      btnRetour?.removeEventListener('click',     versGalerie);
      btnCertif?.removeEventListener('click',     ouvrirCertif);
      miniChart?.destroy();
      reveal.destroy();
    },
  };
}