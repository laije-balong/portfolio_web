/* ============================================================
   GnoLab — Router SPA (History API)
   Gère la navigation côté client sans rechargement de page
   ============================================================ */

import store from './state.js';
import { $ }  from './utils/dom.js';

/**
 * Durées des animations de transition (en ms)
 * Doivent correspondre aux keyframes dans base.css
 */
const DUREE_SORTIE  = 180;
const DUREE_ENTREE  = 320;

class Router {
  constructor() {
    /** @type {Array<{path: string, component: Function, title?: string}>} */
    this._routes   = [];
    this._outlet   = null;
    this._pageCourante = null;   /* instance de la page montée */
    this._enTransition = false;

    this._onPopState = this._onPopState.bind(this);
  }

  /* ── API publique ───────────────────────────────────────────── */

  /**
   * Enregistre les routes de l'application
   * @param {Array} routes
   * @returns {Router}
   */
  register(routes) {
    this._routes = routes;
    return this;
  }

  /**
   * Monte le router sur l'élément outlet
   * et déclenche le rendu initial
   * @param {string} selecteur — ex: '#page-outlet'
   * @returns {Router}
   */
  mount(selecteur) {
    this._outlet = $(selecteur);
    if (!this._outlet) throw new Error(`Router: outlet "${selecteur}" introuvable`);

    /* Écouter le bouton précédent/suivant du navigateur */
    window.addEventListener('popstate', this._onPopState);

    /* Rendu de la route initiale */
    this._naviguer(window.location.pathname, false);

    return this;
  }

  /**
   * Navigue vers un nouveau chemin (ajoute une entrée dans l'historique)
   * @param {string} chemin
   */
  async push(chemin) {
    await this._naviguer(chemin, true);
  }

  /**
   * Remplace l'entrée courante dans l'historique
   * @param {string} chemin
   */
  async replace(chemin) {
    await this._naviguer(chemin, false, true);
  }

  /* ── Méthodes privées ───────────────────────────────────────── */

  _onPopState() {
    this._naviguer(window.location.pathname, false);
  }

  /**
   * Logique centrale de navigation
   * @param {string}  chemin
   * @param {boolean} ajouterHistorique
   * @param {boolean} [remplacerHistorique]
   */
  async _naviguer(chemin, ajouterHistorique = true, remplacerHistorique = false) {
    /* Éviter les transitions simultanées */
    if (this._enTransition) return;

    const cheminPropre = chemin || '/';

    /* Trouver la route correspondante */
    const correspondance = this._trouverRoute(cheminPropre);
    if (!correspondance) {
      console.warn(`Router: aucune route pour "${cheminPropre}" → redirection 404`);
      await this._naviguer('/404', false, true);
      return;
    }

    this._enTransition = true;

    /* Mettre à jour l'historique du navigateur */
    if (ajouterHistorique) {
      history.pushState({ chemin: cheminPropre }, '', cheminPropre);
    } else if (remplacerHistorique) {
      history.replaceState({ chemin: cheminPropre }, '', cheminPropre);
    }

    /* Notifier le store → met à jour le nav actif dans app.js */
    store.set('currentRoute', cheminPropre);

    /* Animation de sortie de la page courante */
    if (this._pageCourante) {
      await this._animerSortie();
    }

    /* Charger et monter la nouvelle page */
    try {
      const module = await correspondance.route.component();
      if (correspondance.route.title) {
        document.title = correspondance.route.title;
      }
      await this._animerEntree(module, correspondance.params);
    } catch (err) {
      console.error('Router: échec du chargement de la page', err);
    }

    /* Remonter en haut de page après navigation */
    window.scrollTo(0, 0);

    this._enTransition = false;
  }

  /**
   * Anime la sortie de la page courante et la détruit
   */
  async _animerSortie() {
    const el = this._outlet.firstElementChild;
    if (!el) return;

    /* Déclencher l'animation CSS de sortie */
    el.classList.add('page-exit');

    /* Appeler le hook de nettoyage de la page */
    this._pageCourante?.destroy?.();

    /* Attendre la fin de l'animation */
    await new Promise(r => setTimeout(r, DUREE_SORTIE));

    el.remove();
    this._pageCourante = null;
  }

  /**
   * Monte la nouvelle page avec animation d'entrée
   * @param {Object} module  — module ES importé dynamiquement
   * @param {Object} params  — paramètres de route (ex: { slug: 'mon-projet' })
   */
  async _animerEntree(module, params = {}) {
    /* Créer le wrapper de page */
    const wrapper = document.createElement('div');
    wrapper.classList.add('page-enter');

    this._outlet.appendChild(wrapper);

    /* Monter la page (chercher export mount ou default) */
    if (typeof module.mount === 'function') {
      this._pageCourante = await module.mount(wrapper, params);
    } else if (typeof module.default === 'function') {
      this._pageCourante = await module.default(wrapper, params);
    }
  }

  /**
   * Recherche la route correspondant à un chemin donné
   * Supporte les paramètres dynamiques (:slug, :id, etc.)
   * @param {string} chemin
   * @returns {{ route: Object, params: Object }|null}
   */
  _trouverRoute(chemin) {
    for (const route of this._routes) {
      const resultat = this._testerRoute(route.path, chemin);
      if (resultat !== null) {
        return { route, params: resultat };
      }
    }
    return null;
  }

  /**
   * Teste un pattern de route contre un chemin réel
   * Supporte la syntaxe ':parametre' pour les segments dynamiques
   * @param {string|RegExp} pattern
   * @param {string} chemin
   * @returns {Object|null} — params extraits, ou null si pas de correspondance
   */
  _testerRoute(pattern, chemin) {
    /* Regex passée directement */
    if (pattern instanceof RegExp) {
      const m = chemin.match(pattern);
      return m ? (m.groups ?? {}) : null;
    }

    /* Convertir le pattern texte en regex */
    const nomsParams = [];
    const regexStr   = pattern
      .replace(/\//g, '\\/')
      .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, nom) => {
        nomsParams.push(nom);
        return '([^\\/]+)';
      });

    const regex = new RegExp(`^${regexStr}$`);
    const match = chemin.match(regex);
    if (!match) return null;

    /* Construire l'objet params */
    const params = {};
    nomsParams.forEach((nom, i) => {
      params[nom] = decodeURIComponent(match[i + 1]);
    });

    return params;
  }
}

/* ── Instance singleton ── */
const router = new Router();
export default router;