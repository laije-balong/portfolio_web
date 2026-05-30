/* ============================================================
   Particle — Individual particle with SVG group + visual component
   ============================================================ */

import { random, isInViewport, uid } from '../utils/math.js';
import { DataBars }      from './DataBars.js';
import { TrendLine }     from './TrendLine.js';
import { DonutChart }    from './DonutChart.js';
import { RadarChart }    from './RadarChart.js';
import { NucleusCluster } from './NucleusCluster.js';

const GRAPH_TYPES = ['dataBars', 'trendLine', 'donutChart', 'radarChart', 'nucleusCluster'];
const NS = 'http://www.w3.org/2000/svg';

/**
 * Velocity ranges by phase
 */
const VELOCITY = {
  chaos:    0.3,
  analysis: 0.02,
  clarity:  0.002,
};

export class Particle {
  /**
   * @param {number} vw     viewport width
   * @param {number} vh     viewport height
   * @param {string} phase  'chaos' | 'analysis' | 'clarity'
   * @param {SVGElement} svgRoot  the main SVG to inject into
   */
  constructor(vw, vh, phase, svgRoot) {
    this.id    = uid('particle');
    this.vw    = vw;
    this.vh    = vh;
    this.phase = phase;

    // ── Position ──────────────────────────────────────────────
    this.x = random(0, vw);
    this.y = random(0, vh);

    // ── Velocity ──────────────────────────────────────────────
    const vRange = VELOCITY[phase] ?? VELOCITY.chaos;
    this.vx = random(-vRange, vRange);
    this.vy = random(-vRange, vRange);

    // ── Rotation ──────────────────────────────────────────────
    this.rotation = random(0, 360);
    this.omega    = random(-0.0005, 0.0005); // deg/ms

    // ── Opacity ───────────────────────────────────────────────
    this.opacity     = random(0.3, 0.8);
    this.baseOpacity = this.opacity;

    // ── Type ──────────────────────────────────────────────────
    this.type = GRAPH_TYPES[Math.floor(Math.random() * GRAPH_TYPES.length)];

    // ── Lifecycle ─────────────────────────────────────────────
    this.timeOutOfViewport = 0;
    this._destroyed = false;

    // ── SVG group ─────────────────────────────────────────────
    this._group = document.createElementNS(NS, 'g');
    this._group.setAttribute('class', `particle particle--${this.type}`);
    this._group.setAttribute('data-id', this.id);
    svgRoot.appendChild(this._group);

    // ── Visual component ──────────────────────────────────────
    this._visual = this._createVisual();

    // ── Apply initial transform ───────────────────────────────
    this._applyTransform();
  }

  // ── Factory for visual component ──────────────────────────────
  _createVisual() {
    switch (this.type) {
      case 'dataBars':       return DataBars(this._group, this.id);
      case 'trendLine':      return TrendLine(this._group, this.id);
      case 'donutChart':     return DonutChart(this._group, this.id);
      case 'radarChart':     return RadarChart(this._group, this.id);
      case 'nucleusCluster': return NucleusCluster(this._group, this.id);
      default:               return DataBars(this._group, this.id);
    }
  }

  // ── Apply transform to SVG group ──────────────────────────────
  _applyTransform() {
    this._group.setAttribute(
      'transform',
      `translate(${this.x.toFixed(2)},${this.y.toFixed(2)}) rotate(${this.rotation.toFixed(2)})`
    );
    this._group.setAttribute('opacity', this.opacity.toFixed(3));
  }

  // ── Update per frame ──────────────────────────────────────────
  /**
   * @param {number} deltaTime  ms since last frame
   * @param {number} t          absolute time in ms (Date.now())
   */
  update(deltaTime, t) {
    if (this._destroyed) return;

    // Move
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.rotation += this.omega * deltaTime;

    // Wrap around viewport edges
    if (this.x < -100)       this.x = this.vw + 100;
    if (this.x > this.vw + 100) this.x = -100;
    if (this.y < -100)       this.y = this.vh + 100;
    if (this.y > this.vh + 100) this.y = -100;

    // Viewport tracking for lifecycle
    const inView = isInViewport(this.x, this.y, this.vw, this.vh, 100);
    if (inView) {
      this.timeOutOfViewport = 0;
    } else {
      this.timeOutOfViewport += deltaTime;
    }

    // Apply transform
    this._applyTransform();

    // Update visual
    this._visual?.update(t);
  }

  // ── Lifecycle ──────────────────────────────────────────────────
  shouldDestroy() {
    return this.timeOutOfViewport > 5000;
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._visual?.destroy();
    this._group?.remove();
    this._group  = null;
    this._visual = null;
  }

  // ── Phase transition ───────────────────────────────────────────
  /**
   * @param {'analysis'|'clarity'} newPhase
   */
  transitionToPhase(newPhase) {
    this.phase = newPhase;

    if (newPhase === 'analysis') {
      this.vx *= 0.4;
      this.vy *= 0.4;
      this.omega *= 0.7;
      this.opacity = random(0.4, 0.7);
      this.baseOpacity = this.opacity;
    } else if (newPhase === 'clarity') {
      this.vx *= 0.1;
      this.vy *= 0.1;
      this.omega *= 0.5;
      this.opacity = random(0.6, 0.9);
      this.baseOpacity = this.opacity;
    }
  }

  // ── Resize ──────────────────────────────────────────────────────
  /**
   * @param {number} newW
   * @param {number} newH
   */
  resize(newW, newH) {
    this.x = (this.x / this.vw) * newW;
    this.y = (this.y / this.vh) * newH;
    this.vw = newW;
    this.vh = newH;
  }
}
