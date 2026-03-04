/* ============================================================
   GnoLab — Gallery Page (Le Mur de Preuves)
   ============================================================ */

import router from '../router.js';
import store from '../state.js';
import { $, $$, setHTML, renderTags } from '../utils/dom.js';

const STAR_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const ARROW_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
const CHART_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/></svg>`;

/**
 * Render a single project card
 * @param {Object} project
 * @param {number} index
 * @returns {string} HTML
 */
function renderCard(project, index) {
  const hasImage = project.cover && !project.cover.includes('placeholder');
  const certBadge = project.certified
    ? `<div class="badge-certified">${STAR_ICON} Certifié</div>`
    : '';

  const coverHTML = hasImage
    ? `<img src="${project.cover}" alt="${project.title}" loading="lazy" onerror="this.parentElement.innerHTML='${buildFallbackCover()}'">`
    : buildFallbackCover();

  return /* html */`
    <article
      class="project-card"
      data-slug="${project.slug}"
      data-index="${index}"
      role="button"
      tabindex="0"
      aria-label="Voir le projet : ${project.title}"
    >
      <div class="card-cover">
        ${coverHTML}
        ${certBadge}
      </div>

      <div class="card-body">
        <h3 class="card-title">${project.title}</h3>
        <p class="card-excerpt">${project.excerpt}</p>

        <div class="card-tags">
          ${renderTags(project.tools)}
        </div>

        <div class="card-cta">
          Voir l'analyse
          ${ARROW_ICON}
        </div>
      </div>
    </article>
  `;
}

function buildFallbackCover() {
  return `<div class="card-cover-fallback">${CHART_ICON}</div>`;
}

function renderSkeleton(count = 6) {
  return Array.from({ length: count }, () => /* html */`
    <div class="project-card" aria-hidden="true">
      <div class="card-cover skeleton" style="height:192px;"></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
        <div class="skeleton" style="height:20px;width:70%;"></div>
        <div class="skeleton" style="height:14px;width:95%;"></div>
        <div class="skeleton" style="height:14px;width:80%;"></div>
        <div style="display:flex;gap:8px;">
          <div class="skeleton" style="height:22px;width:60px;"></div>
          <div class="skeleton" style="height:22px;width:50px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * FLIP helper — capture rect, navigate, animate expansion
 * @param {HTMLElement} cardEl
 * @param {string} slug
 */
function flipNavigate(cardEl, slug) {
  const rect = cardEl.getBoundingClientRect();
  store.set('flipSource', rect);
  router.push(`/projects/${slug}`);
}

/**
 * Load projects from JSON
 * @returns {Promise<Object[]>}
 */
async function loadProjects() {
  // Check store cache first
  const cached = store.get('projects');
  if (cached?.length) return cached;

  const res = await fetch('/data/projects.json');
  if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`);
  const data = await res.json();
  store.set('projects', data);
  return data;
}

/**
 * Mount the gallery page
 * @param {HTMLElement} container
 * @returns {{ destroy: Function }}
 */
export async function mount(container) {
  // Initial render with skeleton
  setHTML(container, /* html */`
    <div class="gallery-page">
      <div class="page-header">
        <div class="container">
          <p class="page-header__label">Mur de Preuves</p>
          <h2>Projets & Analyses</h2>
          <p>Des problèmes réels. Des données brutes. Des résultats mesurables.</p>
        </div>
      </div>

      <div class="container" style="padding-bottom: 6rem;">
        <div class="gallery-grid" id="gallery-grid">
          ${renderSkeleton(6)}
        </div>
      </div>
    </div>
  `);

  const grid = $('#gallery-grid', container);

  // Load real data
  let projects;
  try {
    projects = await loadProjects();
  } catch (err) {
    console.error('Gallery: failed to load projects', err);
    setHTML(grid, /* html */`
      <div class="empty-state" style="grid-column:1/-1;">
        ${CHART_ICON}
        <h4>Impossible de charger les projets</h4>
        <p>Vérifiez que le serveur est bien lancé.</p>
      </div>
    `);
    return { destroy() {} };
  }

  // Render cards
  setHTML(grid, projects.map(renderCard).join(''));

  // Event delegation for card clicks
  const onCardClick = (e) => {
    const card = e.target.closest('.project-card[data-slug]');
    if (!card) return;
    flipNavigate(card, card.dataset.slug);
  };

  const onCardKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.project-card[data-slug]');
    if (!card) return;
    e.preventDefault();
    flipNavigate(card, card.dataset.slug);
  };

  grid.addEventListener('click', onCardClick);
  grid.addEventListener('keydown', onCardKeyDown);

  return {
    destroy() {
      grid.removeEventListener('click', onCardClick);
      grid.removeEventListener('keydown', onCardKeyDown);
    },
  };
}
