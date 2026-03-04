/* ============================================================
   GnoLab — App Entry Point
   ============================================================ */

import router from './router.js';
import store  from './state.js';
import { $, toggleClass, throttle } from './utils/dom.js';

/* ────────────────────────────────────────
   Cursor dot (desktop only, progressive)
   ──────────────────────────────────────── */
function initCursorDot() {
  const dot = document.getElementById('cursor-dot');
  if (!dot || window.matchMedia('(pointer: coarse)').matches) {
    dot?.remove();
    return;
  }

  let mx = -100, my = -100;
  let cx = -100, cy = -100;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '0.6';
  });

  // Smooth follow with lerp
  function loop() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    dot.style.left = `${cx}px`;
    dot.style.top  = `${cy}px`;
    rafId = requestAnimationFrame(loop);
  }

  loop();

  // Grow on interactive elements
  document.addEventListener('mouseover', e => {
    const isInteractive = e.target.closest('button, a, [role="button"], .project-card, .state-btn');
    dot.style.transform = isInteractive
      ? 'translate(-50%,-50%) scale(2.5)'
      : 'translate(-50%,-50%) scale(1)';
    dot.style.opacity = isInteractive ? '0.3' : '0.6';
  });
}

/* ────────────────────────────────────────
   Header behaviour
   ──────────────────────────────────────── */
function initHeader() {
  const header = $('#site-header');
  if (!header) return;

  const onScroll = throttle(() => {
    toggleClass(header, 'is-visible', window.pageYOffset > 100);
  }, 60);

  window.addEventListener('scroll', onScroll, { passive: true });

  // Logo click → home
  header.querySelector('.header-logo')?.addEventListener('click', () => {
    if (window.location.pathname !== '/') {
      router.push('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Nav buttons
  header.querySelector('[data-nav="projects"]')?.addEventListener('click', () => {
    router.push('/projects');
  });
}

/* ────────────────────────────────────────
   Theme toggle
   ──────────────────────────────────────── */
function initTheme() {
  // Restore persisted preference
  const saved = localStorage.getItem('gnolab-theme') ?? 'dark';
  applyTheme(saved);
  store.set('theme', saved);

  const btn = $('#theme-toggle');
  btn?.addEventListener('click', () => {
    const next = store.get('theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('theme', next);
    localStorage.setItem('gnolab-theme', next);
  });

  // Sync store → DOM if changed externally
  store.on('theme', applyTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
}

/* ────────────────────────────────────────
   Back to top
   ──────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const onScroll = throttle(() => {
    toggleClass(btn, 'is-visible', window.pageYOffset > 600);
  }, 200);

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ────────────────────────────────────────
   Router setup
   ──────────────────────────────────────── */
function initRouter() {
  router
    .register([
      {
        path: '/',
        title: 'GnoLab',
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
        path: '/contact',
        title: 'Contact · GnoLab',
        component: () => import('./pages/contact.js'),
      },
      {
        path: '/404',
        title: '404 · GnoLab',
        component: () => import('./pages/notfound.js'),
      },
    ])
    .mount('#page-outlet');
}

/* ────────────────────────────────────────
   Boot
   ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initBackToTop();
  initCursorDot();
  initRouter();
});