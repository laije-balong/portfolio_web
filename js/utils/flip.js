/* ============================================================
   GnoLab — FLIP Transition Engine
   Card → fullscreen expansion → navigate → reveal page
   Duration: 450ms, easing cubic-bezier(.2,.8,.2,1)
   ============================================================ */

import { wait } from './dom.js';

const EASING   = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const DURATION = 450;

/**
 * Creates and manages the FLIP overlay element.
 * Singleton — only one transition at a time.
 */
class FlipEngine {
  constructor() {
    this._overlay  = null;
    this._active   = false;
  }

  /**
   * Capture card rect, spawn overlay, animate to fullscreen.
   * Caller should navigate() immediately after — the page renders
   * beneath the overlay which then fades away.
   *
   * @param {DOMRect}  sourceRect   getBoundingClientRect() of the card
   * @param {string}   bgColor      card background color
   * @returns {Promise<void>}       resolves when expand animation ends
   */
  async expand(sourceRect, bgColor = '#071022') {
    if (this._active) return;
    this._active = true;

    // Lock scroll
    document.body.style.overflow = 'hidden';

    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'flip-overlay';
    overlay.style.cssText = `
      position: fixed;
      top:    ${sourceRect.top}px;
      left:   ${sourceRect.left}px;
      width:  ${sourceRect.width}px;
      height: ${sourceRect.height}px;
      border-radius: 12px;
      background: ${bgColor};
      z-index: 200;
      pointer-events: none;
      will-change: top, left, width, height, border-radius;
    `;

    document.body.appendChild(overlay);
    this._overlay = overlay;

    // Force reflow before animating
    overlay.getBoundingClientRect();

    // Animate to fullscreen using WAAPI
    const anim = overlay.animate([
      {
        top:          `${sourceRect.top}px`,
        left:         `${sourceRect.left}px`,
        width:        `${sourceRect.width}px`,
        height:       `${sourceRect.height}px`,
        borderRadius: '12px',
      },
      {
        top:          '0px',
        left:         '0px',
        width:        '100vw',
        height:       '100vh',
        borderRadius: '0px',
      },
    ], {
      duration: DURATION,
      easing:   EASING,
      fill:     'forwards',
    });

    await anim.finished;
  }

  /**
   * Reveal the underlying page by fading out the overlay.
   * Call this after the page has been mounted and is ready.
   *
   * @param {number} [delay=80]  ms to wait after page mount before fading
   * @returns {Promise<void>}
   */
  async reveal(delay = 80) {
    if (!this._overlay) return;

    await wait(delay);

    const overlay = this._overlay;

    const anim = overlay.animate([
      { opacity: 1 },
      { opacity: 0 },
    ], {
      duration: 280,
      easing:   'ease-out',
      fill:     'forwards',
    });

    await anim.finished;

    overlay.remove();
    this._overlay = null;
    this._active  = false;

    // Restore scroll
    document.body.style.overflow = '';
  }

  /**
   * Emergency cleanup (e.g. browser back during transition)
   */
  abort() {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
    this._active = false;
    document.body.style.overflow = '';
  }

  get isActive() { return this._active; }
}

/* ── Singleton export ── */
export const flip = new FlipEngine();

/**
 * Full navigate-with-flip helper.
 * Usage: await navigateWithFlip(cardEl, '/projects/my-slug', router)
 *
 * @param {HTMLElement} cardEl
 * @param {string}      path
 * @param {import('../router.js').default} router
 */
export async function navigateWithFlip(cardEl, path, router) {
  const rect = cardEl.getBoundingClientRect();

  // Get card's computed bg or fall back to dark
  const bg = getComputedStyle(cardEl).backgroundColor || '#071022';

  // Start expansion
  await flip.expand(rect, bg);

  // Navigate (page mounts beneath overlay)
  await router.push(path);

  // Fade out overlay to reveal page
  await flip.reveal();
}
