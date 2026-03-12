/* ============================================================
   GnoLab — Dashboard Admin (version complète)
   Gère : login, projets (CRUD), articles (CRUD + éditeur Markdown)
   Route : /admin
   ============================================================ */

import { API_URL } from '../config.js';

/* ── Clé de stockage du token ────────────────────────────── */
const TOKEN_KEY = 'gnolab-admin-token';

/* ── Helpers auth ────────────────────────────────────────── */
const getToken   = ()  => localStorage.getItem(TOKEN_KEY);
const setToken   = (t) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = ()  => localStorage.removeItem(TOKEN_KEY);
const authHeader = ()  => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

/* ── API calls ───────────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: authHeader(),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ── Formater une date ISO ───────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

/* ════════════════════════════════════════════════════════════
   VUE LOGIN
   ════════════════════════════════════════════════════════════ */

function htmlLogin(erreur = '') {
  return `
    <div class="adm-login-wrap">
      <div class="adm-login-box">
        <div class="adm-login-logo">
          <span class="adm-logo-g">G</span><span class="adm-logo-rest">noLab</span>
          <span class="adm-login-badge">Admin</span>
        </div>
        <h1 class="adm-login-title">Connexion</h1>
        ${erreur ? `<p class="adm-error">${erreur}</p>` : ''}
        <form class="adm-login-form" id="login-form">
          <div class="adm-field">
            <label for="login-username">Identifiant</label>
            <input type="text" id="login-username" autocomplete="username" required placeholder="admin" />
          </div>
          <div class="adm-field">
            <label for="login-password">Mot de passe</label>
            <input type="password" id="login-password" autocomplete="current-password" required placeholder="••••••••" />
          </div>
          <button type="submit" class="adm-btn adm-btn-primary" id="login-btn">
            Se connecter
          </button>
        </form>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   VUE DASHBOARD (structure HTML fixe)
   ════════════════════════════════════════════════════════════ */

function htmlDashboard(projets) {
  const rows = projets.length
    ? projets.map(p => `
        <tr class="adm-table-row" data-id="${p.id}">
          <td class="adm-td adm-td-title">
            <span class="adm-project-title">${p.title}</span>
            <code class="adm-slug">${p.slug}</code>
          </td>
          <td class="adm-td">
            ${p.tools?.map(t => `<span class="adm-tag">${t}</span>`).join('') || '—'}
          </td>
          <td class="adm-td adm-td-center">
            <button class="adm-toggle-pub ${p.published ? 'is-pub' : 'is-draft'}"
              data-id="${p.id}" data-pub="${p.published ? '1' : '0'}">
              ${p.published ? 'Publié' : 'Brouillon'}
            </button>
          </td>
          <td class="adm-td adm-td-center">
            ${p.certified
              ? `<span class="adm-cert-badge">✦ Certifié</span>`
              : `<span class="adm-text-dim">—</span>`}
          </td>
          <td class="adm-td adm-td-actions">
            <button class="adm-btn adm-btn-sm adm-btn-edit" data-id="${p.id}">Éditer</button>
            <button class="adm-btn adm-btn-sm adm-btn-danger" data-id="${p.id}" data-title="${p.title}">Supprimer</button>
          </td>
        </tr>`).join('')
    : `<tr><td colspan="5" class="adm-td adm-empty">Aucun projet. Crée le premier !</td></tr>`;

  return `
    <div class="adm-layout">

      <!-- Barre latérale -->
      <aside class="adm-sidebar">
        <div class="adm-sidebar-logo">
          <span class="adm-logo-g">G</span><span class="adm-logo-rest">noLab</span>
        </div>
        <nav class="adm-sidenav">
          <button class="adm-nav-item is-active" data-view="projects">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Projets
          </button>
          <button class="adm-nav-item" data-view="articles">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Articles
          </button>
        </nav>
        <div class="adm-sidebar-footer">
          <a href="/" class="adm-nav-item" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Voir le site
          </a>
          <button class="adm-nav-item adm-logout" id="logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- Contenu principal -->
      <main class="adm-main">
        <header class="adm-topbar">
          <h2 class="adm-page-title">Projets <span class="adm-count">${projets.length}</span></h2>
          <button class="adm-btn adm-btn-primary" id="new-project-btn">+ Nouveau projet</button>
        </header>

        <div class="adm-content" id="adm-content">
          <div class="adm-table-wrap">
            <table class="adm-table">
              <thead>
                <tr>
                  <th class="adm-th">Titre</th>
                  <th class="adm-th">Outils</th>
                  <th class="adm-th adm-td-center">Statut</th>
                  <th class="adm-th adm-td-center">Cert.</th>
                  <th class="adm-th adm-td-actions">Actions</th>
                </tr>
              </thead>
              <tbody id="projects-tbody">${rows}</tbody>
            </table>
          </div>
          <div id="adm-message" class="adm-message" style="display:none"></div>
        </div>
      </main>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   FORMULAIRE PROJET
   ════════════════════════════════════════════════════════════ */

function htmlFormProjet(p = null) {
  const mode = p ? 'Éditer' : 'Nouveau projet';
  const v = (field, fallback = '') => p?.[field] ?? fallback;

  return `
    <div class="adm-modal-backdrop" id="projet-modal">
      <div class="adm-modal">
        <div class="adm-modal-header">
          <h3>${mode}</h3>
          <button class="adm-modal-close" id="modal-close">✕</button>
        </div>
        <form class="adm-form" id="projet-form">
          <input type="hidden" id="form-id" value="${v('id')}" />
          <div class="adm-form-grid">
            <div class="adm-field adm-field-full">
              <label>Titre *</label>
              <input type="text" id="form-title" value="${v('title')}" required placeholder="Mon super projet" />
            </div>
            <div class="adm-field adm-field-full">
              <label>Extrait</label>
              <textarea id="form-excerpt" rows="2" placeholder="Description courte...">${v('excerpt')}</textarea>
            </div>
            <div class="adm-field">
              <label>Outils (séparés par virgules)</label>
              <input type="text" id="form-tools"
                value="${Array.isArray(v('tools')) ? v('tools', []).join(', ') : v('tools')}"
                placeholder="Python, SQL, Pandas" />
            </div>
            <div class="adm-field">
              <label>URL image de couverture</label>
              <input type="text" id="form-cover" value="${v('cover')}" placeholder="/assets/images/projects/..." />
            </div>
            <div class="adm-field adm-field-full">
              <label>Challenge</label>
              <textarea id="form-challenge" rows="3" placeholder="Quel problème as-tu résolu ?">${v('challenge')}</textarea>
            </div>
            <div class="adm-field adm-field-full">
              <label>Solution</label>
              <textarea id="form-solution" rows="3" placeholder="Comment tu l'as résolu...">${v('solution')}</textarea>
            </div>
            <div class="adm-field adm-field-full">
              <label>Preuves</label>
              <textarea id="form-proofs" rows="2" placeholder="Résultats mesurables...">${v('proofs')}</textarea>
            </div>
            <div class="adm-field">
              <label>URL certificat</label>
              <input type="text" id="form-certificate" value="${v('certificate')}"
                placeholder="/assets/images/projects/certificates/..." />
            </div>
            <div class="adm-field adm-field-checkboxes">
              <label class="adm-checkbox-label">
                <input type="checkbox" id="form-certified" ${v('certified') ? 'checked' : ''} />
                Projet certifié
              </label>
              <label class="adm-checkbox-label">
                <input type="checkbox" id="form-published" ${v('published', true) ? 'checked' : ''} />
                Publié
              </label>
            </div>
          </div>
          <div class="adm-form-footer">
            <button type="button" class="adm-btn adm-btn-ghost" id="form-cancel">Annuler</button>
            <button type="submit" class="adm-btn adm-btn-primary" id="form-submit">
              ${p ? 'Enregistrer' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   MONTAGE DU MODULE
   ════════════════════════════════════════════════════════════ */

export async function mount(container) {
  document.title = 'Admin · GnoLab';

  if (!document.getElementById('adm-styles')) {
    const style = document.createElement('style');
    style.id = 'adm-styles';
    style.textContent = ADMIN_CSS;
    document.head.appendChild(style);
  }

  let projets = [];

  /* ───────────────────────────────────────
     UTILITAIRES PARTAGÉS
     ─────────────────────────────────────── */

  function afficherMessage(texte, type = 'success') {
    const el = document.getElementById('adm-message');
    if (!el) return;
    el.textContent = texte;
    el.className = `adm-message adm-message-${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  }

  function setTitre(texte, count) {
    const titre = document.querySelector('.adm-page-title');
    if (titre) titre.innerHTML = `${texte} <span class="adm-count">${count}</span>`;
  }

  /* ═══════════════════════════════════════
     PROJETS
     ═══════════════════════════════════════ */

  async function chargerEtAfficherProjets() {
    projets = await apiFetch('/api/projects?all=1');
    const tbody = document.getElementById('projects-tbody');
    if (!tbody) return;

    setTitre('Projets', projets.length);

    const topBtn = document.getElementById('new-project-btn');
    if (topBtn) {
      topBtn.textContent = '+ Nouveau projet';
      topBtn.onclick = () => ouvrirFormulaire(null);
    }

    if (!projets.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="adm-td adm-empty">Aucun projet. Crée le premier !</td></tr>`;
      return;
    }

    tbody.innerHTML = projets.map(p => `
      <tr class="adm-table-row" data-id="${p.id}">
        <td class="adm-td adm-td-title">
          <span class="adm-project-title">${p.title}</span>
          <code class="adm-slug">${p.slug}</code>
        </td>
        <td class="adm-td">
          ${p.tools?.map(t => `<span class="adm-tag">${t}</span>`).join('') || '—'}
        </td>
        <td class="adm-td adm-td-center">
          <button class="adm-toggle-pub ${p.published ? 'is-pub' : 'is-draft'}"
            data-id="${p.id}" data-pub="${p.published ? '1' : '0'}" data-type="project">
            ${p.published ? 'Publié' : 'Brouillon'}
          </button>
        </td>
        <td class="adm-td adm-td-center">
          ${p.certified ? `<span class="adm-cert-badge">✦ Certifié</span>` : `<span class="adm-text-dim">—</span>`}
        </td>
        <td class="adm-td adm-td-actions">
          <button class="adm-btn adm-btn-sm adm-btn-edit" data-id="${p.id}">Éditer</button>
          <button class="adm-btn adm-btn-sm adm-btn-danger" data-id="${p.id}" data-title="${p.title}">Supprimer</button>
        </td>
      </tr>`).join('');

    attacherEvenementsProjet();
  }

  function ouvrirFormulaire(projet = null) {
    document.getElementById('adm-content').insertAdjacentHTML('beforebegin', htmlFormProjet(projet));

    const modal  = document.getElementById('projet-modal');
    const form   = document.getElementById('projet-form');
    const fermer = () => modal.remove();

    document.getElementById('modal-close').addEventListener('click', fermer);
    document.getElementById('form-cancel').addEventListener('click', fermer);
    modal.addEventListener('click', e => { if (e.target === modal) fermer(); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('form-submit');
      btn.disabled = true;
      btn.textContent = 'Enregistrement…';

      const tools = document.getElementById('form-tools').value
        .split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        title:       document.getElementById('form-title').value.trim(),
        excerpt:     document.getElementById('form-excerpt').value.trim(),
        challenge:   document.getElementById('form-challenge').value.trim(),
        solution:    document.getElementById('form-solution').value.trim(),
        proofs:      document.getElementById('form-proofs').value.trim(),
        tools,
        cover:       document.getElementById('form-cover').value.trim(),
        certificate: document.getElementById('form-certificate').value.trim(),
        certified:   document.getElementById('form-certified').checked,
        published:   document.getElementById('form-published').checked,
      };

      try {
        const id = document.getElementById('form-id').value;
        if (id) {
          await apiFetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
          afficherMessage('Projet mis à jour ✓');
        } else {
          await apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(payload) });
          afficherMessage('Projet créé ✓');
        }
        fermer();
        await chargerEtAfficherProjets();
      } catch (err) {
        afficherMessage(err.message, 'error');
        btn.disabled = false;
        btn.textContent = projet ? 'Enregistrer' : 'Créer le projet';
      }
    });
  }

  function attacherEvenementsProjet() {
    document.querySelectorAll('.adm-btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = projets.find(x => String(x.id) === btn.dataset.id);
        if (p) ouvrirFormulaire(p);
      });
    });

    document.querySelectorAll('.adm-btn-danger').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Supprimer « ${btn.dataset.title} » ? Action irréversible.`)) return;
        try {
          await apiFetch(`/api/projects/${btn.dataset.id}`, { method: 'DELETE' });
          afficherMessage('Projet supprimé.');
          await chargerEtAfficherProjets();
        } catch (err) {
          afficherMessage(err.message, 'error');
        }
      });
    });

    document.querySelectorAll('.adm-toggle-pub[data-type="project"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pubActuel = btn.dataset.pub === '1';
        try {
          await apiFetch(`/api/projects/${btn.dataset.id}`, {
            method: 'PUT',
            body: JSON.stringify({ published: !pubActuel }),
          });
          await chargerEtAfficherProjets();
        } catch (err) {
          afficherMessage(err.message, 'error');
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     ARTICLES
     ═══════════════════════════════════════ */

  async function chargerEtAfficherArticles() {
    const res      = await apiFetch('/api/articles?published=0');
    const articles = res.articles || [];

    const adm = document.getElementById('adm-content');
    if (!adm) return;

    setTitre('Articles', articles.length);

    const topBtn = document.getElementById('new-project-btn');
    if (topBtn) {
      topBtn.textContent = '+ Nouvel article';
      topBtn.onclick = () => ouvrirFormArticle(null, articles);
    }

    const rows = articles.length
      ? articles.map(a => `
          <tr class="adm-table-row" data-id="${a.id}">
            <td class="adm-td adm-td-title">
              <span class="adm-project-title">${a.title}</span>
              <code class="adm-slug">${a.slug}</code>
            </td>
            <td class="adm-td">
              ${(a.tags || []).map(t => `<span class="adm-tag">${t}</span>`).join('') || '—'}
            </td>
            <td class="adm-td adm-td-center">
              ${a.reading_time ? `${a.reading_time} min` : '—'}
            </td>
            <td class="adm-td adm-td-center">
              <button class="adm-toggle-pub ${a.published ? 'is-pub' : 'is-draft'}"
                data-id="${a.id}" data-pub="${a.published ? '1' : '0'}" data-type="article">
                ${a.published ? 'Publié' : 'Brouillon'}
              </button>
            </td>
            <td class="adm-td adm-td-center">${formatDate(a.published_at)}</td>
            <td class="adm-td adm-td-actions">
              <button class="adm-btn adm-btn-sm adm-btn-edit art-btn-edit" data-id="${a.id}">Éditer</button>
              <button class="adm-btn adm-btn-sm adm-btn-danger art-btn-del" data-id="${a.id}" data-title="${a.title}">Supprimer</button>
            </td>
          </tr>`).join('')
      : `<tr><td colspan="6" class="adm-td adm-empty">Aucun article. Rédige le premier !</td></tr>`;

    adm.innerHTML = `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th class="adm-th">Titre</th>
              <th class="adm-th">Tags</th>
              <th class="adm-th adm-td-center">Lecture</th>
              <th class="adm-th adm-td-center">Statut</th>
              <th class="adm-th adm-td-center">Publié le</th>
              <th class="adm-th adm-td-actions">Actions</th>
            </tr>
          </thead>
          <tbody id="articles-tbody">${rows}</tbody>
        </table>
      </div>
      <div id="adm-message" class="adm-message" style="display:none"></div>`;

    adm.querySelectorAll('.art-btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = articles.find(x => String(x.id) === btn.dataset.id);
        if (a) ouvrirFormArticle(a, articles);
      });
    });

    adm.querySelectorAll('.art-btn-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Supprimer « ${btn.dataset.title} » ?`)) return;
        try {
          await apiFetch(`/api/articles/${btn.dataset.id}`, { method: 'DELETE' });
          afficherMessage('Article supprimé.');
          await chargerEtAfficherArticles();
        } catch (err) {
          afficherMessage(err.message, 'error');
        }
      });
    });

    adm.querySelectorAll('.adm-toggle-pub[data-type="article"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pub = btn.dataset.pub === '1';
        try {
          await apiFetch(`/api/articles/${btn.dataset.id}`, {
            method: 'PUT',
            body: JSON.stringify({ published: !pub }),
          });
          await chargerEtAfficherArticles();
        } catch (err) {
          afficherMessage(err.message, 'error');
        }
      });
    });
  }

  function ouvrirFormArticle(article = null) {
    const mode = article ? "Éditer l'article" : 'Nouvel article';
    const v    = (f, fb = '') => article?.[f] ?? fb;
    const tags = Array.isArray(v('tags')) ? v('tags', []).join(', ') : v('tags');

    document.getElementById('adm-content').insertAdjacentHTML('beforebegin', `
      <div class="adm-modal-backdrop" id="article-modal">
        <div class="adm-modal adm-modal--wide">
          <div class="adm-modal-header">
            <h3>${mode}</h3>
            <button class="adm-modal-close" id="art-modal-close">✕</button>
          </div>
          <form class="adm-form" id="article-form">
            <input type="hidden" id="art-id" value="${v('id')}" />

            <div class="adm-form-grid">
              <div class="adm-field adm-field-full">
                <label>Titre *</label>
                <input type="text" id="art-title" value="${v('title')}" required placeholder="Mon article" />
              </div>
              <div class="adm-field adm-field-full">
                <label>Extrait</label>
                <textarea id="art-excerpt" rows="2" placeholder="Résumé court affiché dans la liste...">${v('excerpt')}</textarea>
              </div>
              <div class="adm-field">
                <label>Tags (virgule)</label>
                <input type="text" id="art-tags" value="${tags}" placeholder="Dev, Python, Pédagogie" />
              </div>
              <div class="adm-field">
                <label>Image de couverture (URL)</label>
                <input type="text" id="art-cover" value="${v('cover')}" placeholder="/assets/images/blog/..." />
              </div>
            </div>

            <div class="adm-field-label-top">
              <label>Contenu (Markdown)</label>
            </div>
            <div class="md-editor">
              <div class="md-editor__pane">
                <div class="md-editor__label"><span>✎</span> Markdown</div>
                <textarea class="md-editor__textarea" id="art-content"
                  placeholder="# Mon titre&#10;&#10;Commence à écrire en Markdown..."
                  spellcheck="false">${v('content')}</textarea>
              </div>
              <div class="md-editor__pane">
                <div class="md-editor__label"><span>◉</span> Aperçu</div>
                <div class="md-editor__preview prose" id="art-preview">
                  <p style="color:var(--c-text-dim);font-style:italic">L'aperçu apparaît ici…</p>
                </div>
              </div>
            </div>

            <div class="adm-form-grid" style="margin-top:var(--sp-4)">
              <div class="adm-field">
                <label class="adm-checkbox-label" style="padding-top:var(--sp-4)">
                  <input type="checkbox" id="art-published" ${v('published', false) ? 'checked' : ''} />
                  Publier immédiatement
                </label>
              </div>
              <div class="adm-field">
                <label>Temps de lecture (min) — auto si vide</label>
                <input type="number" id="art-reading-time" value="${v('reading_time')}" min="1" max="60" placeholder="auto" />
              </div>
            </div>

            <div class="adm-form-footer">
              <button type="button" class="adm-btn adm-btn-ghost" id="art-form-cancel">Annuler</button>
              <button type="submit" class="adm-btn adm-btn-primary" id="art-form-submit">
                ${article ? 'Enregistrer' : "Créer l'article"}
              </button>
            </div>
          </form>
        </div>
      </div>`);

    /* marked.js chargé à la demande depuis CDN */
    let markedLib = null;
    async function ensureMarked() {
      if (markedLib) return markedLib;
      const m  = await import('https://cdn.jsdelivr.net/npm/marked/src/marked.min.js');
      markedLib = m.marked ?? m.default;
      markedLib.setOptions({ breaks: true, gfm: true });
      return markedLib;
    }

    const textarea = document.getElementById('art-content');
    const preview  = document.getElementById('art-preview');

    async function mettreAJourApercu() {
      const md = textarea.value;
      if (!md.trim()) {
        preview.innerHTML = `<p style="color:var(--c-text-dim);font-style:italic">L'aperçu apparaît ici…</p>`;
        return;
      }
      const m = await ensureMarked();
      preview.innerHTML = m.parse(md);
    }

    textarea.addEventListener('input', mettreAJourApercu);
    if (article?.content) mettreAJourApercu();

    const modal  = document.getElementById('article-modal');
    const fermer = () => modal.remove();
    document.getElementById('art-modal-close').addEventListener('click', fermer);
    document.getElementById('art-form-cancel').addEventListener('click', fermer);
    modal.addEventListener('click', e => { if (e.target === modal) fermer(); });

    document.getElementById('article-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('art-form-submit');
      btn.disabled = true;
      btn.textContent = 'Enregistrement…';

      const content = textarea.value;
      const m       = await ensureMarked();

      const rtRaw = document.getElementById('art-reading-time').value;
      let reading_time = rtRaw ? parseInt(rtRaw) : null;
      if (!reading_time && content) {
        const texte = m.parse(content).replace(/<[^>]+>/g, '');
        reading_time = Math.max(1, Math.round(texte.split(/\s+/).length / 200));
      }

      const tags = document.getElementById('art-tags').value
        .split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        title:        document.getElementById('art-title').value.trim(),
        excerpt:      document.getElementById('art-excerpt').value.trim(),
        content,
        cover:        document.getElementById('art-cover').value.trim(),
        tags,
        reading_time,
        published:    document.getElementById('art-published').checked,
      };

      try {
        const id = document.getElementById('art-id').value;
        if (id) {
          await apiFetch(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
          afficherMessage('Article mis à jour ✓');
        } else {
          await apiFetch('/api/articles', { method: 'POST', body: JSON.stringify(payload) });
          afficherMessage('Article créé ✓');
        }
        fermer();
        await chargerEtAfficherArticles();
      } catch (err) {
        afficherMessage(err.message, 'error');
        btn.disabled = false;
        btn.textContent = article ? 'Enregistrer' : "Créer l'article";
      }
    });
  }

  /* ═══════════════════════════════════════
     ONGLETS SIDEBAR
     ═══════════════════════════════════════ */

  function initOnglets() {
    document.querySelectorAll('.adm-nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.adm-nav-item[data-view]')
          .forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        if (btn.dataset.view === 'projects') {
          await chargerEtAfficherProjets();
        } else if (btn.dataset.view === 'articles') {
          await chargerEtAfficherArticles();
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     RENDU INITIAL — LOGIN ou DASHBOARD
     ═══════════════════════════════════════ */

  if (!getToken()) {
    container.innerHTML = htmlLogin();

    container.querySelector('#login-form').addEventListener('submit', async function handler(e) {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      btn.disabled = true;
      btn.textContent = 'Connexion…';

      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: document.getElementById('login-username').value.trim(),
            password: document.getElementById('login-password').value,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Identifiants incorrects.');

        setToken(data.token);
        container.innerHTML = '';
        await mount(container);

      } catch (err) {
        container.innerHTML = htmlLogin(err.message);
        container.querySelector('#login-form').addEventListener('submit', handler);
      }
    });

    return;
  }

  /* ─ DASHBOARD ─ */
  try {
    projets = await apiFetch('/api/projects?all=1');
  } catch (err) {
    if (err.message.includes('Token')) {
      clearToken();
      container.innerHTML = '';
      await mount(container);
      return;
    }
  }

  container.innerHTML = htmlDashboard(projets);

  attacherEvenementsProjet();
  initOnglets();

  document.getElementById('new-project-btn')?.addEventListener('click', () => {
    ouvrirFormulaire(null);
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearToken();
    container.innerHTML = '';
    mount(container);
  });
}

/* ════════════════════════════════════════════════════════════
   STYLES ADMIN (injectés dans <head> une seule fois)
   ════════════════════════════════════════════════════════════ */

const ADMIN_CSS = `
.adm-login-wrap, .adm-layout {
  min-height: 100vh;
  font-family: var(--font-body);
  color: var(--c-text-primary);
  background: var(--c-bg);
}
.adm-login-wrap {
  display: flex; align-items: center; justify-content: center;
  padding: var(--sp-6);
}
.adm-login-box {
  background: var(--c-bg-panel);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--sp-10) var(--sp-8);
  width: 100%; max-width: 400px;
  box-shadow: var(--shadow-card);
}
.adm-login-logo {
  display: flex; align-items: center; gap: var(--sp-2);
  margin-bottom: var(--sp-6);
  font-family: var(--font-display);
  font-size: var(--fs-xl); font-weight: var(--fw-bold);
}
.adm-logo-g    { color: var(--c-cyan); }
.adm-logo-rest { color: var(--c-text-primary); }
.adm-login-badge {
  font-size: var(--fs-xs);
  background: rgba(0,217,255,0.1); color: var(--c-cyan);
  border: 1px solid rgba(0,217,255,0.2);
  border-radius: var(--r-full);
  padding: 2px var(--sp-2);
  font-family: var(--font-body); font-weight: var(--fw-medium);
  margin-left: var(--sp-2);
}
.adm-login-title {
  font-size: var(--fs-xl); font-weight: var(--fw-bold);
  margin-bottom: var(--sp-6); color: var(--c-text-primary);
}
.adm-login-form { display: flex; flex-direction: column; gap: var(--sp-4); }

.adm-field { display: flex; flex-direction: column; gap: var(--sp-2); }
.adm-field label {
  font-size: var(--fs-sm); color: var(--c-text-secondary); font-weight: var(--fw-medium);
}
.adm-field input, .adm-field textarea {
  background: var(--c-bg-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-text-primary);
  font-family: var(--font-body); font-size: var(--fs-base);
  padding: var(--sp-3) var(--sp-4);
  outline: none; transition: border-color var(--t-fast); resize: vertical;
}
.adm-field input:focus, .adm-field textarea:focus { border-color: var(--c-cyan); }

.adm-btn {
  display: inline-flex; align-items: center; gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  border-radius: var(--r-md); border: none; cursor: pointer;
  font-family: var(--font-body); font-size: var(--fs-sm); font-weight: var(--fw-medium);
  transition: all var(--t-fast); text-decoration: none;
}
.adm-btn-primary {
  background: var(--c-cyan); color: #000;
  width: 100%; justify-content: center;
}
.adm-btn-primary:hover { opacity: 0.9; }
.adm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.adm-btn-ghost {
  background: var(--c-surface); color: var(--c-text-secondary);
  border: 1px solid var(--c-border);
}
.adm-btn-ghost:hover { background: var(--c-surface-hover); }
.adm-btn-sm { padding: var(--sp-1) var(--sp-3); font-size: var(--fs-xs); }
.adm-btn-edit {
  background: rgba(59,130,246,0.15); color: var(--c-blue-500, #3b82f6);
  border: 1px solid rgba(59,130,246,0.2);
}
.adm-btn-edit:hover { background: rgba(59,130,246,0.25); }
.adm-btn-danger {
  background: rgba(239,68,68,0.12); color: var(--c-red);
  border: 1px solid rgba(239,68,68,0.2);
}
.adm-btn-danger:hover { background: rgba(239,68,68,0.22); }
.adm-error {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
  color: var(--c-red); border-radius: var(--r-md);
  padding: var(--sp-3) var(--sp-4); font-size: var(--fs-sm); margin-bottom: var(--sp-2);
}

.adm-layout { display: grid; grid-template-columns: 220px 1fr; }
.adm-sidebar {
  background: var(--c-bg-panel); border-right: 1px solid var(--c-border);
  min-height: 100vh; display: flex; flex-direction: column;
  padding: var(--sp-6) 0; position: sticky; top: 0;
}
.adm-sidebar-logo {
  font-family: var(--font-display); font-size: var(--fs-lg); font-weight: var(--fw-bold);
  padding: 0 var(--sp-5) var(--sp-6); border-bottom: 1px solid var(--c-border);
}
.adm-sidenav {
  display: flex; flex-direction: column; gap: var(--sp-1);
  padding: var(--sp-4) var(--sp-3); flex: 1;
}
.adm-sidebar-footer {
  padding: var(--sp-4) var(--sp-3); border-top: 1px solid var(--c-border);
  display: flex; flex-direction: column; gap: var(--sp-1);
}
.adm-nav-item {
  display: flex; align-items: center; gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md);
  border: none; background: transparent;
  color: var(--c-text-secondary); font-family: var(--font-body);
  font-size: var(--fs-sm); cursor: pointer;
  transition: all var(--t-fast); text-decoration: none;
  width: 100%; text-align: left;
}
.adm-nav-item:hover    { background: var(--c-surface-hover); color: var(--c-text-primary); }
.adm-nav-item.is-active { background: rgba(0,217,255,0.08); color: var(--c-cyan); }
.adm-logout { color: var(--c-red) !important; }
.adm-logout:hover { background: rgba(239,68,68,0.08) !important; }

.adm-main { padding: var(--sp-8); }
.adm-topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--sp-6);
}
.adm-page-title {
  font-size: var(--fs-xl); font-weight: var(--fw-bold);
  display: flex; align-items: center; gap: var(--sp-3);
}
.adm-count {
  font-size: var(--fs-sm); background: var(--c-surface);
  color: var(--c-text-secondary); border-radius: var(--r-full);
  padding: 2px var(--sp-3);
}
.adm-topbar .adm-btn-primary { width: auto; }

.adm-content { }
.adm-table-wrap { overflow-x: auto; }
.adm-table { width: 100%; border-collapse: collapse; font-size: var(--fs-sm); }
.adm-th {
  text-align: left; padding: var(--sp-3) var(--sp-4);
  color: var(--c-text-dim); font-weight: var(--fw-medium);
  font-size: var(--fs-xs); text-transform: uppercase;
  letter-spacing: 0.08em; border-bottom: 1px solid var(--c-border);
}
.adm-td { padding: var(--sp-4); border-bottom: 1px solid var(--c-border); vertical-align: middle; }
.adm-td-center  { text-align: center; }
.adm-td-actions { text-align: right; white-space: nowrap; }
.adm-table-row:hover .adm-td { background: var(--c-surface); }
.adm-td-title { max-width: 320px; }
.adm-project-title { display: block; font-weight: var(--fw-medium); color: var(--c-text-primary); }
.adm-slug  { display: block; font-size: var(--fs-xs); color: var(--c-text-dim); font-family: var(--font-mono); margin-top: 2px; }
.adm-tag   { display: inline-block; font-size: var(--fs-xs); background: var(--c-surface); color: var(--c-text-secondary); border-radius: var(--r-sm); padding: 1px var(--sp-2); margin: 2px 2px 0 0; }
.adm-text-dim { color: var(--c-text-dim); }
.adm-empty { text-align: center; color: var(--c-text-dim); padding: var(--sp-12) !important; }

.adm-toggle-pub {
  font-size: var(--fs-xs); font-weight: var(--fw-medium);
  padding: 2px var(--sp-3); border-radius: var(--r-full);
  border: 1px solid; cursor: pointer; font-family: var(--font-body);
  transition: all var(--t-fast);
}
.adm-toggle-pub.is-pub   { background: rgba(16,185,129,0.1); color: var(--c-green); border-color: rgba(16,185,129,0.2); }
.adm-toggle-pub.is-pub:hover   { background: rgba(16,185,129,0.2); }
.adm-toggle-pub.is-draft { background: var(--c-surface); color: var(--c-text-dim); border-color: var(--c-border); }
.adm-toggle-pub.is-draft:hover { background: var(--c-surface-hover); }
.adm-cert-badge { font-size: var(--fs-xs); color: var(--c-yellow); }

.adm-message { margin-top: var(--sp-4); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md); font-size: var(--fs-sm); }
.adm-message-success { background: rgba(16,185,129,0.1); color: var(--c-green); border: 1px solid rgba(16,185,129,0.2); }
.adm-message-error   { background: rgba(239,68,68,0.1);  color: var(--c-red);   border: 1px solid rgba(239,68,68,0.2); }

.adm-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  z-index: var(--z-modal);
  display: flex; align-items: flex-start; justify-content: center;
  padding: var(--sp-8) var(--sp-4); overflow-y: auto;
  backdrop-filter: blur(4px);
}
.adm-modal {
  background: var(--c-bg-panel); border: 1px solid var(--c-border);
  border-radius: var(--r-xl); width: 100%; max-width: 680px;
  box-shadow: var(--shadow-hover);
}
.adm-modal--wide { max-width: 1100px; }
.adm-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--sp-5) var(--sp-6); border-bottom: 1px solid var(--c-border);
}
.adm-modal-header h3 { font-size: var(--fs-lg); font-weight: var(--fw-bold); }
.adm-modal-close {
  background: var(--c-surface); border: none; color: var(--c-text-secondary);
  border-radius: var(--r-md); width: 32px; height: 32px; cursor: pointer;
  font-size: var(--fs-sm); display: flex; align-items: center; justify-content: center;
}
.adm-modal-close:hover { background: var(--c-surface-hover); color: var(--c-text-primary); }

.adm-form { padding: var(--sp-6); }
.adm-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.adm-field-full { grid-column: 1 / -1; }
.adm-field-checkboxes {
  grid-column: 1 / -1; display: flex; gap: var(--sp-6);
  align-items: center; padding-top: var(--sp-2);
}
.adm-checkbox-label {
  display: flex; align-items: center; gap: var(--sp-2);
  font-size: var(--fs-sm); color: var(--c-text-secondary); cursor: pointer;
}
.adm-checkbox-label input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: var(--c-cyan); cursor: pointer;
}
.adm-form-footer {
  display: flex; justify-content: flex-end; gap: var(--sp-3);
  padding-top: var(--sp-5); border-top: 1px solid var(--c-border); margin-top: var(--sp-5);
}
.adm-form-footer .adm-btn-primary { width: auto; }

/* Éditeur Markdown */
.adm-field-label-top { margin-top: var(--sp-4); }
.adm-field-label-top label {
  font-size: var(--fs-sm); color: var(--c-text-secondary);
  font-weight: var(--fw-medium); display: block; margin-bottom: var(--sp-2);
}
.md-editor {
  display: grid; grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-border); border-radius: var(--r-lg);
  overflow: hidden; min-height: 480px; margin-top: var(--sp-2);
}
.md-editor__pane { display: flex; flex-direction: column; }
.md-editor__pane:first-child { border-right: 1px solid var(--c-border); }
.md-editor__label {
  display: flex; align-items: center; gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4); background: var(--c-bg-card);
  border-bottom: 1px solid var(--c-border);
  font-size: var(--fs-xs); font-family: var(--font-mono);
  color: var(--c-text-dim); text-transform: uppercase; letter-spacing: 0.08em;
}
.md-editor__label span { color: var(--c-cyan); }
.md-editor__textarea {
  flex: 1; width: 100%; background: var(--c-bg-deep);
  color: var(--c-text-primary); font-family: var(--font-mono);
  font-size: var(--fs-sm); line-height: 1.7;
  padding: var(--sp-5) var(--sp-6);
  border: none; outline: none; resize: none; tab-size: 2;
}
.md-editor__preview {
  flex: 1; padding: var(--sp-5) var(--sp-6);
  overflow-y: auto; background: var(--c-bg-panel);
}

/* Responsive */
@media (max-width: 768px) {
  .adm-layout { grid-template-columns: 1fr; }
  .adm-sidebar { display: none; }
  .adm-form-grid { grid-template-columns: 1fr; }
  .adm-field-full { grid-column: 1; }
  .adm-modal--wide { max-width: 100%; }
  .md-editor { grid-template-columns: 1fr; }
  .md-editor__pane:first-child { border-right: none; border-bottom: 1px solid var(--c-border); }
}
`;