/* ============================================================
   GnoLab — Page Blog
   Grille d'articles avec filtres par catégorie et tags.
   Contenu : notes techniques, tutoriels, pédagogie, veille tech.
   ============================================================ */

import router from '../router.js';
import { $, setHTML }         from '../utils/dom.js';
import { ScrollReveal }       from '../utils/scroll-reveal.js';
import { API_URL }            from '../config.js';

/* ── Catégories éditoriales ──────────────────────────────── */
const CATEGORIES = [
  { id: 'tous',       label: 'Tout' },
  { id: 'technique',  label: 'Dev & Systèmes' },
  { id: 'tutoriel',   label: 'Tutoriels' },
  { id: 'pedagogie',  label: 'Pédagogie' },
  { id: 'veille',     label: 'Veille tech' },
];

/* ── Icônes ──────────────────────────────────────────────── */
const IC = {
  clock:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  arrow:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  tag:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  empty:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
};

/* ── Formater la date ─────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ── Squelette de chargement ─────────────────────────────── */
function squelettes(n = 6) {
  return Array(n).fill(0).map(() => `
    <div class="blog-card blog-card--skeleton">
      <div class="blog-card__cover sk-block"></div>
      <div class="blog-card__body">
        <div class="sk-line sk-line--short"></div>
        <div class="sk-line"></div>
        <div class="sk-line sk-line--med"></div>
      </div>
    </div>`).join('');
}

/* ── Rendu d'une carte article ───────────────────────────── */
function rendreCarte(article, index) {
  const tags = article.tags || [];
  const cat  = tags[0] || '';

  const couv = article.cover
    ? `<img src="${article.cover}" alt="${article.title}" loading="lazy" class="blog-card__img"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';

  return `
    <article class="blog-card" data-reveal="fade-up" data-delay="${index * 60}"
             role="article" tabindex="0" data-slug="${article.slug}">

      <div class="blog-card__cover">
        ${couv}
        <div class="blog-card__cover-fallback" ${article.cover ? 'style="display:none"' : ''}>
          ${IC.empty}
        </div>
        ${cat ? `<span class="blog-card__cat">${cat}</span>` : ''}
      </div>

      <div class="blog-card__body">
        <div class="blog-card__meta">
          ${IC.clock}
          <span>${article.reading_time ? `${article.reading_time} min` : 'Lecture rapide'}</span>
          <span class="blog-card__dot">·</span>
          <span>${formatDate(article.published_at)}</span>
        </div>

        <h3 class="blog-card__title">${article.title}</h3>

        ${article.excerpt
          ? `<p class="blog-card__excerpt">${article.excerpt}</p>`
          : ''}

        <div class="blog-card__footer">
          <div class="blog-card__tags">
            ${tags.slice(0, 3).map(t =>
              `<span class="blog-tag">${t}</span>`
            ).join('')}
          </div>
          <span class="blog-card__cta">
            Lire ${IC.arrow}
          </span>
        </div>
      </div>
    </article>`;
}

/* ── Barre de filtres ────────────────────────────────────── */
function rendreFiltres(actif) {
  return `
    <div class="blog-filters" role="group" aria-label="Filtrer par catégorie">
      ${CATEGORIES.map(c => `
        <button class="blog-filter-btn ${c.id === actif ? 'is-active' : ''}"
          data-cat="${c.id}" aria-pressed="${c.id === actif}">
          ${c.label}
        </button>`).join('')}
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   MONTAGE
   ════════════════════════════════════════════════════════════ */

export async function mount(container) {
  document.title = 'Blog · GnoLab';

  setHTML(container, `
    <div class="blog-page">

      <!-- En-tête -->
      <div class="page-header">
        <div class="container">
          <p class="page-header__label">Journal</p>
          <h2 data-reveal="fade-up">Notes & Tutoriels</h2>
          <p class="ct-subtitle" data-reveal="fade-up" data-delay="80">
            Technique, pédagogie, veille — des écrits courts et utiles.
          </p>
        </div>
      </div>

      <div class="container" style="padding-bottom: 6rem;">

        <!-- Filtres -->
        <div id="blog-filters-zone" data-reveal="fade-up" data-delay="100">
          ${rendreFiltres('tous')}
        </div>

        <!-- Grille -->
        <div class="blog-grid" id="blog-grid" role="list">
          ${squelettes(6)}
        </div>

        <!-- Pagination -->
        <div class="blog-pagination" id="blog-pagination"></div>

      </div>
    </div>
  `);

  const reveal      = ScrollReveal(container);
  const grille      = $('#blog-grid', container);
  const pagZone     = $('#blog-pagination', container);
  const filtresZone = $('#blog-filters-zone', container);

  /* ── État ── */
  let categorie = 'tous';
  let page      = 1;
  const LIMIT   = 9;

  /* ── Charger et afficher ── */
  async function chargerArticles() {
    grille.classList.add('is-loading');

    try {
      const tag    = categorie !== 'tous' ? `&tag=${encodeURIComponent(categorie)}` : '';
      const url    = `${API_URL}/api/articles?published=1${tag}&page=${page}&limit=${LIMIT}`;
      const data   = await fetch(url).then(r => r.json());
      const { articles, pages: totalPages } = data;

      if (!articles.length) {
        setHTML(grille, `
          <div class="blog-vide">
            ${IC.empty}
            <p>Aucun article dans cette catégorie pour l'instant.</p>
          </div>`);
        setHTML(pagZone, '');
        return;
      }

      setHTML(grille, articles.map((a, i) => rendreCarte(a, i)).join(''));
      reveal.ajouterElements(grille);

      /* Pagination */
      if (totalPages > 1) {
        setHTML(pagZone, `
          <div class="blog-pag-inner">
            <button class="blog-pag-btn" ${page <= 1 ? 'disabled' : ''} data-dir="-1">
              ← Précédent
            </button>
            <span class="blog-pag-info">${page} / ${totalPages}</span>
            <button class="blog-pag-btn" ${page >= totalPages ? 'disabled' : ''} data-dir="1">
              Suivant →
            </button>
          </div>`);

        pagZone.querySelectorAll('.blog-pag-btn:not([disabled])').forEach(btn => {
          btn.addEventListener('click', () => {
            page += parseInt(btn.dataset.dir);
            chargerArticles();
            container.scrollIntoView({ behavior: 'smooth' });
          });
        });
      } else {
        setHTML(pagZone, '');
      }

    } catch (err) {
      setHTML(grille, `
        <div class="blog-vide">
          ${IC.empty}
          <p>Impossible de charger les articles. L'API est-elle lancée ?</p>
        </div>`);
    } finally {
      grille.classList.remove('is-loading');
    }
  }

  /* ── Clic sur un article ── */
  grille.addEventListener('click', e => {
    const carte = e.target.closest('.blog-card');
    if (carte?.dataset.slug) {
      router.push(`/blog/${carte.dataset.slug}`);
    }
  });

  /* ── Filtres catégories ── */
  filtresZone.addEventListener('click', e => {
    const btn = e.target.closest('.blog-filter-btn');
    if (!btn) return;
    categorie = btn.dataset.cat;
    page = 1;

    filtresZone.querySelectorAll('.blog-filter-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.cat === categorie);
      b.setAttribute('aria-pressed', b.dataset.cat === categorie);
    });

    chargerArticles();
  });

  await chargerArticles();

  return { destroy() { reveal.destroy(); } };
}
