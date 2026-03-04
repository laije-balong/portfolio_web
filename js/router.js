/* ============================================================
   GnoLab Router — History API SPA
   ============================================================ */

import store from './state.js';
import { $, wait } from './utils/dom.js';

/**
 * Route definition
 * @typedef {Object} Route
 * @property {string|RegExp} path
 * @property {Function} component   async () => page module
 * @property {string} [title]
 */

class Router {
  constructor() {
    /** @type {Route[]} */
    this._routes = [];
    this._outlet = null;
    this._currentPage = null;    // mounted page instance
    this._isTransitioning = false;

    this._onPopState = this._onPopState.bind(this);
    this._onLinkClick = this._onLinkClick.bind(this);
  }

  /**
   * Register routes
   * @param {Route[]} routes
   * @returns {Router}
   */
  register(routes) {
    this._routes = routes;
    return this;
  }

  /**
   * Mount router to a DOM element
   * @param {string} selector
   * @returns {Router}
   */
  mount(selector) {
    this._outlet = $(selector);
    if (!this._outlet) throw new Error(`Router: outlet "${selector}" not found`);

    // Listen for browser back/forward
    window.addEventListener('popstate', this._onPopState);

    // Delegate link clicks
    document.addEventListener('click', this._onLinkClick);

    // Initial render
    this._navigate(window.location.pathname, false);

    return this;
  }

  /**
   * Programmatically navigate to a path
   * @param {string} path
   */
  async push(path) {
    await this._navigate(path, true);
  }

  /**
   * Replace current history entry
   * @param {string} path
   */
  async replace(path) {
    await this._navigate(path, false, true);
  }

  // ── Private ──────────────────────────────────────────────

  _onPopState() {
    this._navigate(window.location.pathname, false);
  }

  _onLinkClick(e) {
    // Find closest anchor with data-link or internal href
    const anchor = e.target.closest('a[data-link], a[href^="/"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//')) return;

    e.preventDefault();
    this.push(href);
  }

  /**
   * Core navigation logic
   * @param {string} path
   * @param {boolean} pushHistory
   * @param {boolean} [replaceHistory]
   */
  async _navigate(path, pushHistory = true, replaceHistory = false) {
    if (this._isTransitioning) return;

    // Normalize path
    const cleanPath = path || '/';

    // Find matching route
    const match = this._matchRoute(cleanPath);
    if (!match) {
      console.warn(`Router: no match for "${cleanPath}"`);
      return;
    }

    this._isTransitioning = true;

    // Update history
    if (pushHistory) {
      history.pushState({ path: cleanPath }, '', cleanPath);
    } else if (replaceHistory) {
      history.replaceState({ path: cleanPath }, '', cleanPath);
    }

    // Update store
    store.set('currentRoute', cleanPath);

    // Scroll lock during transition
    document.body.style.overflow = 'hidden';

    // Exit animation for current page
    if (this._currentPage) {
      await this._exitPage();
    }

    // Load and render new page
    try {
      const pageModule = await match.route.component();
      const title = match.route.title || 'GnoLab Portfolio';
      document.title = title;

      await this._enterPage(pageModule, match.params);
    } catch (err) {
      console.error('Router: page load failed', err);
    }

    // Restore scroll
    document.body.style.overflow = '';
    window.scrollTo(0, 0);

    this._isTransitioning = false;
  }

  /**
   * Animate out and destroy current page
   */
  async _exitPage() {
    if (!this._outlet.firstElementChild) return;

    const el = this._outlet.firstElementChild;
    el.classList.add('page-exit');

    // Call page destroy hook if present
    this._currentPage?.destroy?.();

    await wait(200); // match page-exit animation duration
    el.remove();
    this._currentPage = null;
  }

  /**
   * Render new page with enter animation
   * @param {Object} pageModule
   * @param {Object} params  route params (e.g. { slug: 'my-project' })
   */
  async _enterPage(pageModule, params = {}) {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('page-enter');

    this._outlet.appendChild(wrapper);

    // Mount page
    if (typeof pageModule.mount === 'function') {
      this._currentPage = await pageModule.mount(wrapper, params);
    } else if (typeof pageModule.default === 'function') {
      this._currentPage = await pageModule.default(wrapper, params);
    }
  }

  /**
   * Match a path against registered routes
   * @param {string} path
   * @returns {{ route: Route, params: Object }|null}
   */
  _matchRoute(path) {
    for (const route of this._routes) {
      const result = this._testRoute(route.path, path);
      if (result !== null) {
        return { route, params: result };
      }
    }
    return null;
  }

  /**
   * Test a route pattern against a path
   * Supports: '/projects/:slug' pattern syntax
   * @param {string|RegExp} pattern
   * @param {string} path
   * @returns {Object|null}  params object or null
   */
  _testRoute(pattern, path) {
    if (pattern instanceof RegExp) {
      const m = path.match(pattern);
      return m ? m.groups ?? {} : null;
    }

    // Convert path pattern to regex
    const paramNames = [];
    const regexStr = pattern
      .replace(/\//g, '\\/')
      .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
        paramNames.push(name);
        return '([^\\/]+)';
      });

    const regex = new RegExp(`^${regexStr}$`);
    const match = path.match(regex);
    if (!match) return null;

    const params = {};
    paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1]);
    });

    return params;
  }
}

/* ── Singleton ── */
const router = new Router();

export default router;
