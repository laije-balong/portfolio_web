/* ============================================================
   GnoLab — Page d'accueil (Hero + Teaser)
   Hero plein écran avec particules SVG, puis sections
   de teaser : stats clés, aperçu projets, CTA contact
   ============================================================ */

import router           from '../router.js';
import { $, setHTML, throttle } from '../utils/dom.js';
import { ParticleSystem }       from '../particles/ParticleSystem.js';
import { ScrollReveal }         from '../utils/scroll-reveal.js';
import { navigateWithFlip }     from '../utils/flip.js';

/* ════════════════════════════════════════
   BARRES FANTÔMES DU FOND
   Rectangles SVG animés, très discrets (opacité 0.035)
   ════════════════════════════════════════ */
/**
 * Génère les barres SVG d'arrière-plan décoratives
 * @param {number} n — nombre de barres
 * @returns {string} fragment SVG
 */
function rendreBarresFond(n = 15) {
  return Array.from({ length: n }, (_, i) => {
    const x     = (i / n) * 100;
    const h     = 20 + Math.random() * 60;
    const duree = 3 + i * 0.5;
    const debut = i * 0.5;
    return `
      <rect x="${x}%" y="${100 - h}%" width="0.6%" height="${h}%"
            fill="rgba(0,217,255,0.035)" rx="2">
        <animate attributeName="height"
          values="${h}%;${h * 0.6}%;${h}%"
          dur="${duree}s" begin="${debut}s" repeatCount="indefinite"/>
        <animate attributeName="y"
          values="${100 - h}%;${100 - h * 0.6}%;${100 - h}%"
          dur="${duree}s" begin="${debut}s" repeatCount="indefinite"/>
      </rect>`;
  }).join('');
}

/* ════════════════════════════════════════
   SECTION HERO — HTML
   ════════════════════════════════════════ */
function htmlHero() {
  return `
    <section class="hero-section" aria-label="Introduction">

      <!-- Canvas SVG des particules animées -->
      <svg id="particle-canvas" class="hero-canvas"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        ${rendreBarresFond(15)}
      </svg>

      <!-- Contenu principal -->
      <div class="hero-content container">

        <!-- Badge indicateur de phase narrative -->
        <div class="hero-phase-badge" id="phase-badge" aria-live="polite">
          <span class="phase-dot" aria-hidden="true"></span>
          <span id="phase-label">chaos</span>
        </div>

        <!-- Titre H1 -->
        <h1 class="hero-title" data-reveal="fade-up">
          Les données<br>
          <span class="gradient-text">racontent une histoire.</span>
        </h1>

        <p class="hero-subtitle" data-reveal="fade-up" data-delay="120">
          Data Analyst — je transforme des données brutes en décisions
          mesurables. Chaque projet est une enquête.
        </p>

        <!-- Boutons d'action -->
        <div class="hero-ctas" data-reveal="fade-up" data-delay="220">
          <button class="hero-btn hero-btn--primary" id="btn-explorer">
            Explorer les projets
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button class="hero-btn hero-btn--secondary" id="btn-contact">
            Me contacter
          </button>
        </div>

        <!-- Indicateur de scroll -->
        <div class="hero-scroll-cue" data-reveal="fade-up" data-delay="400" aria-hidden="true">
          <span>Défiler</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </div>
    </section>
  `;
}

/* ════════════════════════════════════════
   SECTION STATS — chiffres clés animés
   
const STATS = [
  { valeur: 5,   suffixe: '+',  label: 'Projets livrés',       couleur: 'var(--c-cyan)'   },
  { valeur: 23,  suffixe: '%',  label: 'Réduction coûts stocks', couleur: 'var(--c-violet)' },
  { valeur: 91,  suffixe: '%',  label: 'Précision modèle churn', couleur: 'var(--c-yellow)' },
  { valeur: 340, suffixe: 'k€', label: 'Économies générées/an',  couleur: 'var(--c-green)'  },
];

function htmlStats() {
  return `
    <section class="home-stats" aria-label="Chiffres clés">
      <div class="container">
        <div class="stats-grille">
          ${STATS.map((s, i) => `
            <div class="stat-item" data-reveal="scale" data-delay="${i * 80}">
              <div class="stat-valeur" style="color:${s.couleur}"
                   data-target="${s.valeur}" data-suffixe="${s.suffixe}">
                0${s.suffixe}
              </div>
              <div class="stat-label">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
  ════════════════════════════════════════ */

/* ════════════════════════════════════════
   SECTION PROJETS — aperçu 3 projets
   ════════════════════════════════════════ */
/**
 * Rend un aperçu compact des projets en vedette
 * @param {Array} projets — liste de projets chargée depuis le JSON
 * @returns {string} HTML
 */
function htmlApercuProjets(projets) {
  /* Afficher les 3 premiers projets */
  const vedettes = projets.slice(0, 3);

  /* Couleur d'accent par outil principal */
  const paletteOutils = {
    'python': '#3b82f6', 'sql': '#0074D9', 'r': '#10b981',
    'power bi': '#f59e0b', 'tableau': '#ef4444', 'd3.js': '#00D9FF',
    'xgboost': '#8b5cf6', 'bert': '#a78bfa', 'fastapi': '#10b981',
    'prophet': '#f59e0b', 'grafana': '#ef4444',
  };
  const couleurOutil = (outil) =>
    paletteOutils[(outil || '').toLowerCase()] || '#94a3b8';

  return `
    <section class="home-projets" aria-label="Projets en vedette">
      <div class="container">

        <!-- En-tête de section -->
        <div class="section-entete" data-reveal="fade-up">
          <div class="section-label">
            <span class="section-dot" aria-hidden="true"></span>
            Réalisations récentes
          </div>
          <h2 class="section-titre">Le Mur de Preuves</h2>
          <p class="section-sous-titre">
            Chaque projet est une analyse complète : problème, méthode, résultats mesurables.
          </p>
        </div>

        <!-- Grille de cartes -->
        <div class="apercu-grille">
          ${vedettes.map((p, i) => {
            const outil       = p.tools?.[0] ?? '';
            const couleur     = couleurOutil(outil);
            const badgeCertif = p.certified
              ? `<span class="apercu-badge-cert" aria-label="Projet certifié">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                   </svg>
                   Certifié
                 </span>`
              : '';

            return `
              <article class="apercu-card"
                       style="--card-accent:${couleur}"
                       data-slug="${p.slug}"
                       data-reveal="fade-up"
                       data-delay="${i * 90}"
                       role="button"
                       tabindex="0"
                       aria-label="Voir le projet : ${p.title}">

                <!-- Badge certifié -->
                ${badgeCertif}

                <!-- Badge outil principal -->
                <span class="apercu-outil">${outil}</span>

                <!-- Contenu -->
                <h3 class="apercu-titre">${p.title}</h3>
                <p  class="apercu-excerpt">${p.excerpt}</p>

                <!-- Tags outils -->
                <div class="apercu-tags">
                  ${(p.tools || []).slice(0, 3).map(t =>
                    `<span class="tag">${t}</span>`
                  ).join('')}
                </div>

                <!-- CTA hover -->
                <div class="apercu-cta" aria-hidden="true">
                  Voir l'analyse
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>

                <!-- Barre d'accent colorée -->
                <div class="apercu-accent-bar" aria-hidden="true"></div>
              </article>
            `;
          }).join('')}
        </div>

        <!-- Bouton voir tous -->
        <div class="home-projets-cta" data-reveal="fade-up">
          <button class="hero-btn hero-btn--secondary" id="btn-tous-projets">
            Voir tous les projets
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `;
}

/* ════════════════════════════════════════
   SECTION COMPÉTENCES — aperçu rapide
   ════════════════════════════════════════ */
const COMPETENCES = [
  { icone: '📊', titre: 'Analyse Exploratoire',   desc: 'SQL · Python · Pandas · Viz' },
  { icone: '🤖', titre: 'Machine Learning',        desc: 'XGBoost · Scikit-learn · BERT' },
  { icone: '📈', titre: 'Data Visualisation',     desc: 'D3.js · Power BI · Tableau · Grafana' },
  { icone: '⚙️', titre: 'Data Engineering',       desc: 'ETL · InfluxDB · FastAPI · SQL Server' },
];

function htmlCompetences() {
  return `
    <section class="home-skills" aria-label="Compétences">
      <div class="container">
        <div class="skills-grille">
          ${COMPETENCES.map((c, i) => `
            <div class="skill-item" data-reveal="fade-up" data-delay="${i * 60}">
              <div class="skill-icone" aria-hidden="true">${c.icone}</div>
              <h4 class="skill-titre">${c.titre}</h4>
              <p  class="skill-desc">${c.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/* ════════════════════════════════════════
   SECTION CTA FINAL
   ════════════════════════════════════════ */
function htmlCTA() {
  return `
    <section class="home-cta-final" aria-label="Appel à l'action">
      <div class="container">
        <div class="cta-final-inner" data-reveal="scale">
          <div class="cta-final-label">
            <span class="section-dot" aria-hidden="true"></span>
            Disponible pour projets
          </div>
          <h2 class="cta-final-titre">
            Vous avez des données.<br>
            <span class="gradient-text">Construisons la suite ensemble.</span>
          </h2>
          <p class="cta-final-sous">
            Analyse, modélisation, visualisation — discutons de votre projet.
          </p>
          <div class="cta-final-btns">
            <button class="hero-btn hero-btn--primary" id="btn-contact-final">
              Démarrer une conversation
            </button>
            <button class="hero-btn hero-btn--secondary" id="btn-about-final">
              En savoir plus
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ════════════════════════════════════════
   ANIMATION DES COMPTEURS
   Fait défiler les chiffres de 0 à leur valeur finale
   ════════════════════════════════════════ */
/**
 * Anime un compteur numérique de 0 à target
 * @param {HTMLElement} el
 * @param {number} target
 * @param {string} suffixe
 * @param {number} duree — durée en ms
 */
function animerCompteur(el, target, suffixe, duree = 1500) {
  const debut  = performance.now();
  const easing = (t) => 1 - Math.pow(1 - t, 3); /* ease-out-cubic */

  function tick(now) {
    const t       = Math.min((now - debut) / duree, 1);
    const valeur  = Math.round(easing(t) * target);
    el.textContent = valeur + suffixe;
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


/**
 * Initialise l'IntersectionObserver sur les compteurs
 * Lance l'animation une fois que la section entre dans le viewport
 * @param {HTMLElement} container
 */
function initCompteurs(container) {
  const items = container.querySelectorAll('.stat-valeur[data-target]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.dataset.target, 10);
      const suffixe = el.dataset.suffixe || '';
      animerCompteur(el, target, suffixe);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  items.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════
   MODULE PRINCIPAL
   ════════════════════════════════════════ */
/**
 * Monte la page d'accueil complète
 * @param {HTMLElement} container
 * @returns {{ destroy(): void }}
 */
export async function mount(container) {
  document.title = 'GnoLab — Portfolio Data Analyst';

  /* ── Charger les projets pour le teaser ── */
  let projets = [];
  try {
    const rep  = await fetch('/data/projects.json');
    projets    = await rep.json();
  } catch (_) {
    /* Graceful degradation : le teaser affichera un état vide */
  }

  /* ── Construire tout le HTML ── */
  setHTML(container, [
    htmlHero(),
    /* htmlStats(), a utiliser peut etre plus tard*/
    htmlApercuProjets(projets),
    htmlCompetences(),
    htmlCTA(),
  ].join(''));

  /* ── Système de particules ── */
  const canvas = document.getElementById('particle-canvas');
  let particleSystem = null;
  if (canvas) {
    particleSystem = new ParticleSystem(canvas);
    const labelPhase = document.getElementById('phase-label');
    if (labelPhase) particleSystem.setPhaseLabel(labelPhase);
    particleSystem.init();
  }

  /* ── Animations scroll (fade-up, scale, etc.) ── */
  const reveal = ScrollReveal(container);

  /* ── Compteurs animés ── */
  initCompteurs(container);

  /* ── Navigation : boutons hero ── */
  const btnExplorer = $('#btn-explorer', container);
  const btnContact  = $('#btn-contact',  container);
  const btnTous     = $('#btn-tous-projets', container);
  const btnContactF = $('#btn-contact-final', container);
  const btnAboutF   = $('#btn-about-final',   container);

  const versGalerie = () => router.push('/projects');
  const versContact = () => router.push('/contact');
  const versAbout   = () => router.push('/about');

  btnExplorer?.addEventListener('click', versGalerie);
  btnContact?.addEventListener('click',  versContact);
  btnTous?.addEventListener('click',     versGalerie);
  btnContactF?.addEventListener('click', versContact);
  btnAboutF?.addEventListener('click',   versAbout);

  /* ── Cartes aperçu projets → navigation avec FLIP ── */
  /* Même mécanique que la galerie : la carte se déploie en plein écran */
  const lancerFlip = (carteEl) => {
    const slug = carteEl.dataset.slug;
    if (slug) navigateWithFlip(carteEl, `/projects/${slug}`, router);
  };

  const onClicApercu = (e) => {
    const carte = e.target.closest('.apercu-card[data-slug]');
    if (carte) lancerFlip(carte);
  };

  const onToucheApercu = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const carte = e.target.closest('.apercu-card[data-slug]');
    if (carte) { e.preventDefault(); lancerFlip(carte); }
  };

  /* Délégation sur le conteneur de la section — plus propre que N listeners */
  const sectionProjets = container.querySelector('.home-projets');
  sectionProjets?.addEventListener('click',   onClicApercu);
  sectionProjets?.addEventListener('keydown', onToucheApercu);

  /* ── Redimensionnement ── */
  const onResize = throttle(() => { /* ParticleSystem gère son propre resize */ }, 200);
  window.addEventListener('resize', onResize);

  /* ── Nettoyage au démontage ── */
  return {
    destroy() {
      btnExplorer?.removeEventListener('click', versGalerie);
      btnContact?.removeEventListener('click',  versContact);
      btnTous?.removeEventListener('click',     versGalerie);
      btnContactF?.removeEventListener('click', versContact);
      btnAboutF?.removeEventListener('click',   versAbout);
      sectionProjets?.removeEventListener('click',   onClicApercu);
      sectionProjets?.removeEventListener('keydown', onToucheApercu);
      window.removeEventListener('resize', onResize);
      particleSystem?.destroy();
      reveal.destroy();
    },
  };
}