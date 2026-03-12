/* ============================================================
   GnoLab — Point d'entrée de l'application
   Initialisation : thème, header, menu mobile, router
   ============================================================ */

import router from './router.js';
import store  from './state.js';
import { $, throttle } from './utils/dom.js';

/* ════════════════════════════════════════
   THÈME SOMBRE / CLAIR
   ════════════════════════════════════════ */

/**
 * Applique un thème en modifiant data-theme sur <html>
 * et en mettant à jour la meta theme-color
 * @param {'dark'|'light'} theme
 */
function appliquerTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
}

function initTheme() {
  /* Restaurer la préférence persistée (défaut : dark) */
  const sauvegarde = localStorage.getItem('gnolab-theme') ?? 'dark';
  appliquerTheme(sauvegarde);
  store.set('theme', sauvegarde);

  /* Gérer le clic sur le bouton principal (desktop) */
  const basculerTheme = () => {
    const suivant = store.get('theme') === 'dark' ? 'light' : 'dark';
    appliquerTheme(suivant);
    store.set('theme', suivant);
    localStorage.setItem('gnolab-theme', suivant);
  };

  $('#theme-toggle')?.addEventListener('click', basculerTheme);
  /* Bouton dupliqué dans le menu mobile */
  $('#theme-toggle-mobile')?.addEventListener('click', basculerTheme);

  /* Synchroniser le store → DOM si modifié ailleurs */
  store.on('theme', appliquerTheme);
}

/* ════════════════════════════════════════
   HEADER — REVEAL AU SCROLL
   ════════════════════════════════════════ */

function initHeader() {
  const header = $('#site-header');
  if (!header) return;

  /* Afficher le header quand on descend de plus de 100px */
  const onScroll = throttle(() => {
    const depasse = window.pageYOffset > 100;
    header.classList.toggle('is-visible', depasse);
  }, 60);

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Logo → accueil */
  $('#logo-btn')?.addEventListener('click', () => {
    window.location.pathname !== '/'
      ? router.push('/')
      : window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════
   ÉTAT ACTIF DES LIENS NAV
   Surligne le lien correspondant à la route courante
   ════════════════════════════════════════ */

/**
 * Met à jour la classe is-active sur les liens nav
 * en comparant leur data-route avec la route courante
 * @param {string} routeCourante
 */
function mettreAJourNavActif(routeCourante) {
  /* Desktop */
  document.querySelectorAll('.nav-btn[data-route]').forEach(lien => {
    const route = lien.dataset.route;
    /* Correspondance exacte OU préfixe pour les sous-routes (/projects/:slug) */
    const actif = routeCourante === route ||
                  (route !== '/' && routeCourante.startsWith(route));
    lien.classList.toggle('is-active', actif);
    lien.setAttribute('aria-current', actif ? 'page' : '');
  });

  /* Mobile */
  document.querySelectorAll('.menu-lien[data-route]').forEach(lien => {
    const route = lien.dataset.route;
    const actif = routeCourante === route ||
                  (route !== '/' && routeCourante.startsWith(route));
    lien.classList.toggle('is-active', actif);
  });
}

/* ════════════════════════════════════════
   MENU MOBILE (hamburger + drawer)
   ════════════════════════════════════════ */

function initMenuMobile() {
  const hamburger  = $('#hamburger');
  const menuMobile = $('#menu-mobile');
  const backdrop   = $('#menu-backdrop');
  const btnFermer  = $('#menu-close');
  if (!hamburger || !menuMobile) return;

  /* Ouvrir le menu */
  function ouvrir() {
    document.body.classList.add('menu-ouvert');
    hamburger.classList.add('is-ouvert');
    hamburger.setAttribute('aria-expanded', 'true');
    menuMobile.setAttribute('aria-hidden', 'false');
    /* Piéger le focus dans le panneau */
    setTimeout(() => btnFermer?.focus(), 50);
  }

  /* Fermer le menu */
  function fermer() {
    document.body.classList.remove('menu-ouvert');
    hamburger.classList.remove('is-ouvert');
    hamburger.setAttribute('aria-expanded', 'false');
    menuMobile.setAttribute('aria-hidden', 'true');
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    document.body.classList.contains('menu-ouvert') ? fermer() : ouvrir();
  });

  /* Fermer en cliquant sur le fond */
  backdrop?.addEventListener('click', fermer);
  btnFermer?.addEventListener('click', fermer);

  /* Fermer avec la touche Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-ouvert')) {
      fermer();
    }
  });

  /* Fermer automatiquement à la navigation */
  document.querySelectorAll('.menu-lien, .menu-cta').forEach(lien => {
    lien.addEventListener('click', fermer);
  });

  /* Fermer si on passe en desktop (resize) */
  window.addEventListener('resize', throttle(() => {
    if (window.innerWidth > 768) fermer();
  }, 200));
}

/* ════════════════════════════════════════
   LIENS data-link — délégation globale
   Capture tous les <a data-link> pour le routeur SPA
   ════════════════════════════════════════ */

function initLiensRoutes() {
  document.addEventListener('click', (e) => {
    const lien = e.target.closest('a[data-link]');
    if (!lien) return;

    e.preventDefault();
    const href = lien.getAttribute('href');
    if (href && href !== window.location.pathname) {
      router.push(href);
    }
  });
}

/* ════════════════════════════════════════
   BOUTON RETOUR EN HAUT
   ════════════════════════════════════════ */

function initRetourHaut() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const onScroll = throttle(() => {
    btn.classList.toggle('is-visible', window.pageYOffset > 600);
  }, 200);

  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════
   CURSOR DOT (desktop uniquement)
   Amélioration progressive — ignoré sur tactile
   ════════════════════════════════════════ */

function initCursorDot() {
  const dot = document.getElementById('cursor-dot');

  /* Supprimer sur écrans tactiles */
  if (!dot || window.matchMedia('(pointer: coarse)').matches) {
    dot?.remove();
    return;
  }

  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '0.6'; });

  /* Suivi fluide avec interpolation linéaire */
  const loop = () => {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    dot.style.left = `${cx}px`;
    dot.style.top  = `${cy}px`;
    requestAnimationFrame(loop);
  };
  loop();

  /* Agrandir sur les éléments interactifs */
  document.addEventListener('mouseover', e => {
    const interactif = e.target.closest(
      'button, a, [role="button"], .project-card, .state-btn, .filtre-btn'
    );
    dot.style.transform = interactif
      ? 'translate(-50%,-50%) scale(2.5)'
      : 'translate(-50%,-50%) scale(1)';
    dot.style.opacity = interactif ? '0.25' : '0.6';
  });
}

/* ════════════════════════════════════════
   ROUTER — configuration des routes
   ════════════════════════════════════════ */

function initRouter() {
  router
    .register([
      {
        path: '/',
        title: 'GnoLab — Portfolio Data Analyst',
        component: () => import('./pages/home.js'),
      },
      {
        path: '/projects',
        title: 'Projets · GnoLab',
        component: () => import('./pages/gallery.js'),
      },
      {
        path: '/projects/:slug',
        title: 'Projet · GnoLab',
        component: () => import('./pages/project.js'),
      },
      {
        path: '/about',
        title: 'À propos · GnoLab',
        component: () => import('./pages/about.js'),
      },
      {
        path: '/contact',
        title: 'Contact · GnoLab',
        component: () => import('./pages/contact.js'),
      },
            {
        path: '/admin',
        title: 'Admin · GnoLab',
        component: () => import('./pages/admin.js'),
      },
      {
        path: '/admin/:section',
        title: 'Admin · GnoLab',
        component: () => import('./pages/admin.js'),
      },
      {
      path: '/blog',
      title: 'Blog · GnoLab',
      component: () => import('./pages/blog.js'),
      },
      {
      path: '/blog/:slug',
      title: 'Article · GnoLab',
      component: () => import('./pages/article.js'),
      },
      {
        path: '/404',
        title: '404 · GnoLab',
        component: () => import('./pages/notfound.js'),
      },
    ])
    .mount('#page-outlet');

  /* Mettre à jour le nav actif à chaque changement de route */
  store.on('currentRoute', mettreAJourNavActif);

  /* Appliquer immédiatement sur la route initiale */
  mettreAJourNavActif(window.location.pathname);
}

/* ════════════════════════════════════════
   ANNÉE COPYRIGHT — mise à jour automatique
   ════════════════════════════════════════ */
function initCopyright() {
  const el = document.getElementById('footer-copyright');
  if (el) el.textContent = `© ${new Date().getFullYear()} GnoLab`;
}

/* ════════════════════════════════════════
   DÉMARRAGE
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCopyright();
  initHeader();
  initMenuMobile();
  initLiensRoutes();
  initRetourHaut();
  initCursorDot();
  initRouter();
});