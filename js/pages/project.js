/* ============================================================
   GnoLab — Project Detail Page
   ============================================================ */

import router from '../router.js';
import store from '../state.js';
import { $, $$, setHTML, animate, flipFrom, renderTags, wait } from '../utils/dom.js';

const ICONS = {
  back:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m0 0l7 7m-7-7 7-7"/></svg>`,
  cert:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  ext:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
};

const STATES = [
  { id: 'raw',     label: 'Brut' },
  { id: 'cleaned', label: 'Nettoyé' },
  { id: 'results', label: 'Résultats' },
];

/**
 * Placeholder visual canvas per state
 * Will be replaced by MiniChart particle components in next module
 */
function renderPlaceholderVisual(state, project) {
  const colors = {
    raw:     '#ef4444',
    cleaned: '#f59e0b',
    results: '#10b981',
  };

  const color = colors[state] || '#0074D9';
  const labels = {
    raw:     'Données brutes',
    cleaned: 'Données nettoyées',
    results: 'Résultats finaux',
  };

  return /* html */`
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Visualisation ${labels[state]}"
    >
      <defs>
        <radialGradient id="vglow-${state}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <rect width="300" height="200" fill="url(#vglow-${state})"/>

      ${state === 'raw' ? renderRawBars(color) : ''}
      ${state === 'cleaned' ? renderCleanBars(color) : ''}
      ${state === 'results' ? renderResultLine(color) : ''}

      <!-- Label -->
      <text
        x="150" y="185"
        text-anchor="middle"
        font-family="JetBrains Mono, monospace"
        font-size="9"
        fill="${color}"
        opacity="0.6"
        letter-spacing="0.08em"
      >${labels[state].toUpperCase()}</text>
    </svg>
  `;
}

function renderRawBars(color) {
  const bars = [30, 85, 45, 110, 60, 90, 35, 75, 120, 50];
  return bars.map((h, i) => {
    const x = 30 + i * 24;
    const y = 165 - h;
    return `<rect x="${x}" y="${y}" width="14" height="${h}" fill="${color}" opacity="${0.3 + Math.random() * 0.4}" rx="2"/>`;
  }).join('');
}

function renderCleanBars(color) {
  const bars = [45, 62, 78, 88, 72, 95, 68, 85, 92, 75];
  return bars.map((h, i) => {
    const x = 30 + i * 24;
    const y = 165 - h;
    return `
      <rect x="${x}" y="${y}" width="14" height="${h}" fill="${color}" opacity="0.7" rx="2"/>
      <rect x="${x}" y="${y}" width="14" height="${Math.max(h * 0.15, 4)}" fill="white" opacity="0.15" rx="2"/>
    `;
  }).join('');
}

function renderResultLine(color) {
  const pts = [
    [30, 140], [60, 120], [90, 100], [120, 95], [150, 80],
    [180, 70], [210, 55], [240, 45], [270, 35],
  ];

  let path = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const cpx1 = px + (cx - px) / 3;
    const cpx2 = px + 2 * (cx - px) / 3;
    path += ` C ${cpx1} ${py} ${cpx2} ${cy} ${cx} ${cy}`;
  }

  // Area path
  const areaPath = path + ` L ${pts.at(-1)[0]} 165 L ${pts[0][0]} 165 Z`;

  // Arrow at end
  const [lx, ly] = pts.at(-1);
  const arrowPath = `M ${lx} ${ly} l 8 -4 l -4 8 Z`;

  return /* html */`
    <path d="${areaPath}" fill="${color}" opacity="0.08"/>
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <path d="${arrowPath}" fill="${color}" opacity="0.7"/>
    ${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="${color}" opacity="0.8"/>`).join('')}
  `;
}

/**
 * Build the full project page HTML
 * @param {Object} project
 * @param {string} activeState
 */
function buildProjectHTML(project, activeState) {
  const stateButtons = STATES.map(s => /* html */`
    <button
      class="state-btn ${s.id === activeState ? 'is-active' : ''}"
      data-state="${s.id}"
      aria-pressed="${s.id === activeState}"
    >${s.label}</button>
  `).join('');

  const certButton = project.certified && project.certificate
    ? /* html */`
        <button class="cert-btn" data-cert-url="${project.certificate}">
          ${ICONS.cert}
          Voir le certificat
          ${ICONS.ext}
        </button>
      `
    : '';

  return /* html */`
    <div class="project-page">
      <div class="container">
        <div class="project-layout">

          <!-- ── Left: Narrative ── -->
          <div class="project-narrative">
            <button class="project-back-btn" id="back-btn">
              ${ICONS.back}
              Retour aux projets
            </button>

            <h1 class="project-title">${project.title}</h1>
            <p class="project-excerpt-large">${project.excerpt}</p>

            <div class="card-tags" style="margin-bottom:2.5rem;">
              ${renderTags(project.tools)}
            </div>

            <div class="project-section">
              <p class="project-section__label">Challenge</p>
              <h4>Le problème</h4>
              <p>${project.challenge || 'Description en cours de rédaction.'}</p>
            </div>

            <div class="project-section">
              <p class="project-section__label">Solution</p>
              <h4>L'approche</h4>
              <p>${project.solution || 'Description en cours de rédaction.'}</p>
            </div>

            <div class="project-section">
              <p class="project-section__label">Preuves & Code</p>
              <h4>Les résultats</h4>
              <p>${project.proofs || 'Métriques en cours de compilation.'}</p>
            </div>
          </div>

          <!-- ── Right: Visual Panel ── -->
          <aside class="project-visual-panel">
            <div class="visual-card">

              <div class="visual-card__header">
                <div class="visual-card__dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="visual-card__title">${project.slug}.viz</span>
              </div>

              <div class="state-buttons" role="group" aria-label="État de la visualisation">
                ${stateButtons}
              </div>

              <div class="visual-card__canvas" id="viz-canvas">
                ${renderPlaceholderVisual(activeState, project)}
              </div>

              ${certButton}
            </div>
          </aside>

        </div>
      </div>
    </div>
  `;
}

/**
 * Load a project by slug
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
async function loadProject(slug) {
  // Try store cache
  const projects = store.get('projects') || [];
  const cached = projects.find(p => p.slug === slug);
  if (cached) return cached;

  // Fetch all and cache
  const res = await fetch('/data/projects.json');
  if (!res.ok) return null;
  const all = await res.json();
  store.set('projects', all);
  return all.find(p => p.slug === slug) ?? null;
}

/**
 * Mount the project detail page
 * @param {HTMLElement} container
 * @param {{ slug: string }} params
 * @returns {{ destroy: Function }}
 */
export async function mount(container, params) {
  const { slug } = params;

  // Loading state
  setHTML(container, /* html */`
    <div class="project-page">
      <div class="container">
        <div class="project-layout">
          <div class="project-narrative" style="padding-top:4rem;">
            <div class="skeleton" style="height:44px;width:60%;margin-bottom:2rem;"></div>
            <div class="skeleton" style="height:56px;width:90%;margin-bottom:1rem;"></div>
            <div class="skeleton" style="height:20px;width:100%;margin-bottom:0.5rem;"></div>
            <div class="skeleton" style="height:20px;width:85%;"></div>
          </div>
          <div class="project-visual-panel" style="padding-top:4rem;">
            <div class="skeleton" style="height:360px;border-radius:16px;"></div>
          </div>
        </div>
      </div>
    </div>
  `);

  // Load data
  let project;
  try {
    project = await loadProject(slug);
  } catch (err) {
    console.error('ProjectPage: load failed', err);
  }

  if (!project) {
    setHTML(container, /* html */`
      <div class="container" style="padding-top:8rem;text-align:center;">
        <h2>Projet introuvable</h2>
        <p>Le projet &laquo; ${slug} &raquo; n'existe pas.</p>
        <button class="hero-btn hero-btn--secondary" style="margin-top:2rem;" id="back-404">
          Retour aux projets
        </button>
      </div>
    `);
    $('#back-404', container)?.addEventListener('click', () => router.push('/projects'));
    return { destroy() {} };
  }

  // Render page
  let activeState = 'raw';
  setHTML(container, buildProjectHTML(project, activeState));

  // FLIP animation if we have a source rect
  const flipRect = store.get('flipSource');
  if (flipRect) {
    const vizCard = container.querySelector('.visual-card');
    if (vizCard) {
      await wait(16); // let paint happen
      flipFrom(vizCard, flipRect, 450);
    }
    store.set('flipSource', null);
  }

  // Document title
  document.title = `${project.title} · GnoLab`;

  // ── State switching ──
  const vizCanvas = $('#viz-canvas', container);
  const stateButtons = $$('.state-btn', container);

  const switchState = (newState) => {
    if (newState === activeState) return;
    activeState = newState;

    // Update button active states
    stateButtons.forEach(btn => {
      const isActive = btn.dataset.state === newState;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    // Transition visual
    vizCanvas.style.opacity = '0';
    vizCanvas.style.transform = 'scale(0.97)';
    vizCanvas.style.transition = 'opacity 150ms ease-in, transform 150ms ease-in';

    setTimeout(() => {
      setHTML(vizCanvas, renderPlaceholderVisual(newState, project));
      vizCanvas.style.opacity = '1';
      vizCanvas.style.transform = 'scale(1)';
      vizCanvas.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
    }, 150);
  };

  const onStateClick = (e) => {
    const btn = e.target.closest('.state-btn[data-state]');
    if (btn) switchState(btn.dataset.state);
  };

  const stateGroup = container.querySelector('.state-buttons');
  stateGroup?.addEventListener('click', onStateClick);

  // ── Back button ──
  const backBtn = $('#back-btn', container);
  const onBack = () => router.push('/projects');
  backBtn?.addEventListener('click', onBack);

  // ── Certificate button ──
  const certBtn = container.querySelector('.cert-btn[data-cert-url]');
  const onCert = () => {
    const url = certBtn.dataset.certUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };
  certBtn?.addEventListener('click', onCert);

  return {
    destroy() {
      stateGroup?.removeEventListener('click', onStateClick);
      backBtn?.removeEventListener('click', onBack);
      certBtn?.removeEventListener('click', onCert);
    },
  };
}
