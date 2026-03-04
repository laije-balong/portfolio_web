/* ============================================================
   GnoLab — Home Page
   ============================================================ */

import router from '../router.js';
import { $, setHTML, throttle } from '../utils/dom.js';
import { ParticleSystem } from '../particles/ParticleSystem.js';

/**
 * Icons (inline SVG strings)
 */
const ICONS = {
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  chartBar:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/></svg>`,
  download:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

function buildHeroHTML() {
  return /* html */`
    <section class="hero-section" id="hero">

      <!-- SVG particle canvas (particle system injects here later) -->
      <svg class="hero-canvas" id="particle-canvas" aria-hidden="true"></svg>

      <!-- Ghost background bars -->
      <svg class="ghost-bars" aria-hidden="true" id="ghost-bars"></svg>

      <!-- Phase indicator -->
      <div class="phase-indicator" id="phase-indicator" aria-live="polite">
        <span class="phase-dot"></span>
        <span id="phase-label">chaos</span>
      </div>

      <!-- Main content -->
      <div class="hero-content">
        <p class="hero-label">
          Data Analyst
        </p>

        <h1 class="hero-title">
          Les données<br>
          <span class="gradient-text">racontent tout</span>
        </h1>

        <p class="hero-subtitle">
          Je transforme des ensembles de données complexes en décisions 
          éclairées. Explorez les projets qui illustrent chaque étape : 
          du chaos brut à la clarté mesurable.
        </p>

        <div class="hero-actions">
          <button class="hero-btn hero-btn--primary" id="btn-explore" aria-label="Explorer les projets">
            ${ICONS.chartBar}
            Voir les projets
            ${ICONS.arrowRight}
          </button>
          <button class="hero-btn hero-btn--secondary" id="btn-contact">
            Me contacter
          </button>
        </div>
      </div>

      <!-- Scroll cue -->
      <div class="hero-scroll-cue" aria-hidden="true">
        <div class="scroll-line"></div>
        <span>Défiler</span>
      </div>
    </section>
  `;
}

function buildGhostBars(svgEl) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const count = 15;

  for (let i = 0; i < count; i++) {
    const x = (i / count) * W + Math.random() * (W / count) * 0.5;
    const baseH = 40 + Math.random() * 200;
    const dur   = 3 + i * 0.5;
    const begin = i * 0.5;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', H - baseH);
    rect.setAttribute('width', '10');
    rect.setAttribute('height', baseH);
    rect.setAttribute('fill', 'white');

    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    anim.setAttribute('attributeName', 'height');
    anim.setAttribute('values', `${baseH};${baseH * 1.4};${baseH}`);
    anim.setAttribute('dur', `${dur}s`);
    anim.setAttribute('begin', `${begin}s`);
    anim.setAttribute('repeatCount', 'indefinite');

    const animY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animY.setAttribute('attributeName', 'y');
    animY.setAttribute('values', `${H - baseH};${H - baseH * 1.4};${H - baseH}`);
    animY.setAttribute('dur', `${dur}s`);
    animY.setAttribute('begin', `${begin}s`);
    animY.setAttribute('repeatCount', 'indefinite');

    rect.appendChild(anim);
    rect.appendChild(animY);
    svgEl.appendChild(rect);
  }

  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
}

/**
 * Mount the home page
 * @param {HTMLElement} container
 * @returns {{ destroy: Function }}
 */
export async function mount(container) {
  setHTML(container, buildHeroHTML());

  // Build ghost bars
  const ghostBars = $('#ghost-bars', container);
  if (ghostBars) buildGhostBars(ghostBars);

  // Button bindings
  const btnExplore = $('#btn-explore', container);
  const btnContact = $('#btn-contact', container);

  const onExplore = () => router.push('/projects');
  const onContact = () => {
    // TODO: scroll to contact section or navigate
    router.push('/projects');
  };

  btnExplore?.addEventListener('click', onExplore);
  btnContact?.addEventListener('click', onContact);

  // Resize handler for ghost bars
  const onResize = throttle(() => {
    if (ghostBars) {
      while (ghostBars.firstChild) ghostBars.firstChild.remove();
      buildGhostBars(ghostBars);
    }
  }, 300);

  window.addEventListener('resize', onResize);

  // Show phase indicator after a short delay
  let phaseTimer;
  phaseTimer = setTimeout(() => {
    const indicator = $('#phase-indicator', container);
    indicator?.classList.add('is-visible');
  }, 800);

  // ── Particle system ───────────────────────────────────────────
  const canvas = document.getElementById('particle-canvas');
  let particleSystem = null;

  if (canvas) {
    particleSystem = new ParticleSystem(canvas);

    // Connect phase HUD
    const phaseLabel = document.getElementById('phase-label');
    if (phaseLabel) particleSystem.setPhaseLabel(phaseLabel);

    particleSystem.init();
  }

  return {
    destroy() {
      btnExplore?.removeEventListener('click', onExplore);
      btnContact?.removeEventListener('click', onContact);
      window.removeEventListener('resize', onResize);
      clearTimeout(phaseTimer);
      particleSystem?.destroy();
    },
  };
}
