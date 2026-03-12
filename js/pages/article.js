/* ============================================================
   GnoLab — Page Article
   Lecture d'un article, rendu Markdown → HTML via marked.js
   ============================================================ */

import router from '../router.js';
import { $, setHTML } from '../utils/dom.js';
import { API_URL }    from '../config.js';

/* ── marked.js depuis CDN (aucun build step) ─────────────── */
let marked = null;
async function getMarked() {
  if (marked) return marked;
  const m = await import('https://cdn.jsdelivr.net/npm/marked/src/marked.min.js');
  marked  = m.marked ?? m.default;
  /* Options : liens s'ouvrent dans un nouvel onglet */
  marked.setOptions({
    breaks: true,
    gfm:    true,
  });
  return marked;
}

/* ── Icônes ──────────────────────────────────────────────── */
const IC = {
  back:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  cal:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ── Squelette de chargement ─────────────────────────────── */
const SQUELETTE = `
  <div class="art-page">
    <div class="art-container">
      <div class="art-header">
        <div class="sk-line sk-line--short" style="margin-bottom:1.5rem"></div>
        <div class="sk-line" style="height:2.5rem;margin-bottom:1rem"></div>
        <div class="sk-line sk-line--med"></div>
      </div>
      <div class="art-cover sk-block" style="height:340px;border-radius:12px;margin:2rem 0"></div>
      <div class="art-body">
        ${Array(6).fill(0).map(() => `
          <div class="sk-line" style="margin-bottom:.75rem"></div>
        `).join('')}
      </div>
    </div>
  </div>`;

/* ════════════════════════════════════════════════════════════
   MONTAGE
   ════════════════════════════════════════════════════════════ */

export async function mount(container, { slug } = {}) {

  setHTML(container, SQUELETTE);

  if (!slug) {
    router.replace('/blog');
    return;
  }

  /* ── Charger l'article ── */
  let article;
  try {
    const res = await fetch(`${API_URL}/api/articles/${slug}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    article = await res.json();
  } catch {
    setHTML(container, `
      <div class="art-page">
        <div class="art-container" style="text-align:center;padding-top:8rem;">
          <p class="page-header__label">Introuvable</p>
          <h2 style="margin:1rem 0">Article non trouvé</h2>
          <p style="color:var(--c-text-secondary);margin-bottom:2rem">
            Cet article n'existe pas ou a été supprimé.
          </p>
          <button class="art-back-btn" id="back-btn">
            ${IC.back} Retour au blog
          </button>
        </div>
      </div>`);
    $('#back-btn', container)?.addEventListener('click', () => router.push('/blog'));
    return;
  }

  document.title = `${article.title} · GnoLab`;

  /* ── Rendu Markdown ── */
  const parser  = await getMarked();
  const bodyHtml = article.content
    ? parser.parse(article.content)
    : '<p style="color:var(--c-text-secondary)">Contenu à venir.</p>';

  const tags    = article.tags || [];
  const couvHtml = article.cover
    ? `<div class="art-cover">
         <img src="${article.cover}" alt="${article.title}" loading="lazy" class="art-cover-img">
       </div>`
    : '';

  setHTML(container, `
    <div class="art-page">
      <div class="art-container">

        <!-- Retour -->
        <button class="art-back-btn" id="back-btn">
          ${IC.back} Blog
        </button>

        <!-- En-tête -->
        <header class="art-header">
          ${tags.length ? `
            <div class="art-tags-top">
              ${tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}
            </div>` : ''}

          <h1 class="art-title">${article.title}</h1>

          ${article.excerpt
            ? `<p class="art-excerpt">${article.excerpt}</p>`
            : ''}

          <div class="art-meta">
            ${IC.cal}
            <span>${formatDate(article.published_at)}</span>
            ${article.reading_time ? `
              <span class="art-meta-dot">·</span>
              ${IC.clock}
              <span>${article.reading_time} min de lecture</span>` : ''}
          </div>
        </header>

        <!-- Couverture -->
        ${couvHtml}

        <!-- Corps de l'article -->
        <div class="art-body prose" id="art-body">
          ${bodyHtml}
        </div>

        <!-- Footer article -->
        <footer class="art-footer">
          ${tags.length ? `
            <div class="art-footer-tags">
              <span class="art-footer-label">Tags :</span>
              ${tags.map(t =>
                `<button class="blog-tag blog-tag--link" data-tag="${t}">${t}</button>`
              ).join('')}
            </div>` : ''}
          <button class="art-back-btn art-back-btn--footer" id="back-btn-footer">
            ${IC.back} Retour au blog
          </button>
        </footer>

      </div>
    </div>`);

  /* ── Événements ── */
  $('#back-btn', container)?.addEventListener('click', () => router.push('/blog'));
  $('#back-btn-footer', container)?.addEventListener('click', () => router.push('/blog'));

  /* Clic sur un tag → filtre le blog */
  container.querySelectorAll('.blog-tag--link').forEach(btn => {
    btn.addEventListener('click', () => {
      router.push(`/blog?tag=${encodeURIComponent(btn.dataset.tag)}`);
    });
  });

  /* Ouvrir les liens externes du contenu dans un nouvel onglet */
  container.querySelectorAll('.art-body a[href^="http"]').forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
}
