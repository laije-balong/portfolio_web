/* ============================================================
   ParticleSystem — Manager + RAF loop
   Specs: maxParticles 45 desktop / 25 mobile
          chaos→analysis at 3000ms, analysis→clarity at 8000ms
   ============================================================ */

import { Particle } from './Particle.js';
import { debounce } from '../utils/dom.js';

const MAX_DESKTOP = 45;
const MAX_MOBILE  = 25;
const MOBILE_BP   = 768;

export class ParticleSystem {
  /**
   * @param {SVGElement} svgRoot  the SVG canvas to render into
   */
  constructor(svgRoot) {
    this._svg         = svgRoot;
    this._particles   = [];
    this._phase       = 'chaos';
    this._phaseStart  = Date.now();
    this._rafId       = null;
    this._lastTime    = Date.now();
    this._phaseLabel  = null;  // optional DOM el for phase display
    this._running     = false;

    this._vw = window.innerWidth;
    this._vh = window.innerHeight;

    this._maxParticles = this._vw < MOBILE_BP ? MAX_MOBILE : MAX_DESKTOP;
  }

  /**
   * Attach an optional phase label element (for HUD display)
   * @param {HTMLElement} el
   */
  setPhaseLabel(el) {
    this._phaseLabel = el;
  }

  /**
   * Initialize particles and start the loop
   */
  init() {
    this._vw = window.innerWidth;
    this._vh = window.innerHeight;
    this._maxParticles = this._vw < MOBILE_BP ? MAX_MOBILE : MAX_DESKTOP;
    this._phaseStart = Date.now();
    this._phase = 'chaos';

    // Clear existing
    this._particles.forEach(p => p.destroy());
    this._particles = [];

    // Fill initial particles
    const count = this._maxParticles;
    for (let i = 0; i < count; i++) {
      this._spawnParticle();
    }

    // Set SVG dimensions
    this._svg.setAttribute('width',  this._vw);
    this._svg.setAttribute('height', this._vh);
    this._svg.setAttribute('viewBox', `0 0 ${this._vw} ${this._vh}`);

    // Resize handler (debounced)
    this._onResize = debounce(this._handleResize.bind(this), 200);
    window.addEventListener('resize', this._onResize);

    // Start loop
    this._running  = true;
    this._lastTime = Date.now();
    this._tick();
  }

  /**
   * Stop the animation loop and destroy all particles
   */
  destroy() {
    this._running = false;

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    this._particles.forEach(p => p.destroy());
    this._particles = [];

    window.removeEventListener('resize', this._onResize);

    // Clear SVG
    while (this._svg.firstChild) this._svg.firstChild.remove();
  }

  // ── Private ───────────────────────────────────────────────────

  _tick() {
    if (!this._running) return;

    const now       = Date.now();
    const deltaTime = Math.min(now - this._lastTime, 64); // cap at ~15fps min
    this._lastTime  = now;

    this._update(deltaTime, now);

    this._rafId = requestAnimationFrame(this._tick.bind(this));
  }

  _update(deltaTime, now) {
    const elapsed = now - this._phaseStart;

    // ── Phase transitions ────────────────────────────────────
    if (this._phase === 'chaos' && elapsed > 3000) {
      this._transitionToPhase('analysis');
    } else if (this._phase === 'analysis' && elapsed > 8000) {
      this._transitionToPhase('clarity');
    }

    // ── Update all particles ──────────────────────────────────
    for (const p of this._particles) {
      p.update(deltaTime, now);
    }

    // ── Prune destroyed particles ─────────────────────────────
    const toRemove = this._particles.filter(p => p.shouldDestroy());
    toRemove.forEach(p => p.destroy());
    this._particles = this._particles.filter(p => !p.shouldDestroy() && !p._destroyed);

    // ── Replenish ─────────────────────────────────────────────
    while (this._particles.length < this._maxParticles) {
      this._spawnParticle();
    }
  }

  _spawnParticle() {
    const p = new Particle(this._vw, this._vh, this._phase, this._svg);
    this._particles.push(p);
  }

  _transitionToPhase(newPhase) {
    this._phase      = newPhase;
    this._phaseStart = Date.now();

    for (const p of this._particles) {
      p.transitionToPhase(newPhase);
    }

    // Update HUD label if present
    if (this._phaseLabel) {
      this._phaseLabel.textContent = newPhase;
    }
  }

  _handleResize() {
    const newW = window.innerWidth;
    const newH = window.innerHeight;

    this._maxParticles = newW < MOBILE_BP ? MAX_MOBILE : MAX_DESKTOP;

    // Update SVG dimensions
    this._svg.setAttribute('width',  newW);
    this._svg.setAttribute('height', newH);
    this._svg.setAttribute('viewBox', `0 0 ${newW} ${newH}`);

    // Resize particles proportionally
    for (const p of this._particles) {
      p.resize(newW, newH);
    }

    this._vw = newW;
    this._vh = newH;

    // Trim if over new max
    while (this._particles.length > this._maxParticles) {
      const p = this._particles.pop();
      p.destroy();
    }
  }
}
