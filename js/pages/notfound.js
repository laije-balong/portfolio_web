/* ============================================================
   GnoLab — 404 Page
   ============================================================ */

import router from '../router.js';
import { setHTML, $ } from '../../utils/dom.js';

export async function mount(container) {
  document.title = '404 · GnoLab';

  setHTML(container, /* html */`
    <div class="notfound-page">
      <div class="notfound-inner">
        <p class="mono" style="color:var(--c-cyan);font-size:var(--fs-xs);letter-spacing:.12em;text-transform:uppercase;margin-bottom:var(--sp-4);">
          // erreur_404.log
        </p>

        <div class="notfound-code" aria-hidden="true">
          <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" width="200">
            <text x="50%" y="65" text-anchor="middle"
              font-family="Syne, sans-serif"
              font-size="72" font-weight="700"
              fill="none"
              stroke="rgba(0,217,255,0.15)"
              stroke-width="1.5"
              letter-spacing="-4"
            >404</text>
            <text x="50%" y="65" text-anchor="middle"
              font-family="Syne, sans-serif"
              font-size="72" font-weight="700"
              fill="rgba(0,217,255,0.06)"
              letter-spacing="-4"
            >404</text>
          </svg>
        </div>

        <h2 style="margin-bottom:var(--sp-3);">Page introuvable</h2>
        <p style="max-width:360px;margin-inline:auto;margin-bottom:var(--sp-8);">
          Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer.
        </p>

        <div style="display:flex;gap:var(--sp-3);justify-content:center;flex-wrap:wrap;">
          <button class="hero-btn hero-btn--primary" id="btn-home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Accueil
          </button>
          <button class="hero-btn hero-btn--secondary" id="btn-projects">
            Voir les projets
          </button>
        </div>
      </div>
    </div>
  `);

  const btnHome = $('#btn-home', container);
  const btnProj = $('#btn-projects', container);
  const onHome  = () => router.push('/');
  const onProj  = () => router.push('/projects');

  btnHome?.addEventListener('click', onHome);
  btnProj?.addEventListener('click', onProj);

  return {
    destroy() {
      btnHome?.removeEventListener('click', onHome);
      btnProj?.removeEventListener('click', onProj);
    },
  };
}
