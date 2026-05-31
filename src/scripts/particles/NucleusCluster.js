/* ============================================================
   NucleusCluster Core + orbiting satellites + synaptic connections
   Specs: 4 fixed satellites (triangle, square, rectangle, diamond),
          connections every 800–1500ms with 600ms lifetime
   ============================================================ */

import { random, uid } from '../utils/math.js';

const CORE_COLOR = '#f59e0b';

// Exact satellite config from spec
const SATELLITE_DEFS = [
  { shape: 'triangle',  radius: 35, speed: 0.0008, phase: 0,              size: 12, isElliptical: true,  ellipseRatio: 1.2 },
  { shape: 'square',    radius: 45, speed: 0.0006, phase: Math.PI / 2,    size: 10, isElliptical: true,  ellipseRatio: 1.3 },
  { shape: 'rectangle', radius: 28, speed: 0.001,  phase: Math.PI,        size: { w: 14, h: 6 }, isElliptical: false },
  { shape: 'diamond',   radius: 40, speed: 0.0007, phase: 1.5 * Math.PI,  size: 11, isElliptical: false },
];

/**
 * @param {SVGGElement} group
 * @param {string}      pid
 * @returns {{ update(t: number): void, destroy(): void }}
 */
export function NucleusCluster(group, pid) {
  const haloId = `nch-${pid}`;
  const glowId = `ncg-${pid}`;

  // ── Connection state ──────────────────────────────────────────
  let connections = [];          // active connection objects
  let nextConnAt  = random(800, 1500); // ms until next connection attempt
  let lastConnCheck = 0;

  // ── Build static DOM structure ───────────────────────────────
  group.innerHTML = `
    <defs>
      <radialGradient id="${haloId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="${CORE_COLOR}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${CORE_COLOR}" stop-opacity="0"/>
      </radialGradient>
      <filter id="${glowId}">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Connections layer (drawn below satellites) -->
    <g class="nc-connections"></g>

    <!-- Orbital paths (subtle ellipses) -->
    ${SATELLITE_DEFS.map((s, i) => {
      const rx = s.isElliptical ? s.radius * s.ellipseRatio : s.radius;
      const ry = s.radius;
      return `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}"
        fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>`;
    }).join('')}

    <!-- Satellite shapes -->
    <g class="nc-satellites">
      ${SATELLITE_DEFS.map((s, i) => `
        <g class="nc-sat" data-i="${i}">
          ${shapeSVG(s, i, pid)}
        </g>
      `).join('')}
    </g>

    <!-- Core halo -->
    <circle class="nc-halo" cx="0" cy="0" r="15" fill="url(#${haloId})" opacity="0.8"/>

    <!-- Core -->
    <circle
      class="nc-core" cx="0" cy="0" r="6"
      fill="${CORE_COLOR}" opacity="0.9"
      filter="url(#${glowId})"
    >
      <animate attributeName="r"
        values="5;7;5" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity"
        values="0.9;0.6;0.9" dur="3s" repeatCount="indefinite"/>
    </circle>
  `;

  const connLayer  = group.querySelector('.nc-connections');
  const satGroups  = Array.from(group.querySelectorAll('.nc-sat'));
  const haloEl     = group.querySelector('.nc-halo');

  // ── Satellite position at time t ──────────────────────────────
  function satPos(def, t) {
    const angle  = def.phase + def.speed * t;
    const rx     = def.isElliptical ? def.radius * def.ellipseRatio : def.radius;
    const ry     = def.radius;
    return {
      x:     Math.cos(angle) * rx,
      y:     Math.sin(angle) * ry,
      angle: angle,
    };
  }

  // ── Connection management ─────────────────────────────────────
  function maybeCreateConnection(t, positions) {
    if (t - lastConnCheck < nextConnAt) return;

    lastConnCheck = t;
    nextConnAt    = random(800, 1500);

    if (Math.random() >= 0.3) return;

    const type  = Math.random() < 0.5 ? 'core' : 'satellite';
    const fromIdx = Math.floor(Math.random() * SATELLITE_DEFS.length);
    const toIdx   = Math.floor(Math.random() * SATELLITE_DEFS.length);

    connections.push({
      id:        uid('conn'),
      fromIdx:   type === 'core' ? -1 : fromIdx,  // -1 = core
      toIdx:     toIdx,
      startTime: t,
      duration:  600,
      type,
    });
  }

  function renderConnections(t, positions) {
    // Remove expired
    connections = connections.filter(c => t - c.startTime < c.duration);

    connLayer.innerHTML = connections.map(c => {
      const elapsed  = t - c.startTime;
      const progress = elapsed / c.duration;

      // Opacity: ramp in 0→200ms, hold, fade 200ms from end
      let opacity;
      if (elapsed < 200) {
        opacity = Math.pow(elapsed / 200, 0.3);
      } else if (elapsed > c.duration - 400) {
        opacity = (c.duration - elapsed) / 400;
      } else {
        opacity = 1;
      }

      opacity = Math.max(0, Math.min(1, opacity)) * 0.7;

      const from = c.fromIdx === -1 ? { x: 0, y: 0 } : positions[c.fromIdx];
      const to   = positions[c.toIdx];
      if (!from || !to) return '';

      return `<line
        x1="${from.x.toFixed(2)}" y1="${from.y.toFixed(2)}"
        x2="${to.x.toFixed(2)}"   y2="${to.y.toFixed(2)}"
        stroke="${CORE_COLOR}"
        stroke-width="0.5"
        opacity="${opacity.toFixed(3)}"
      />`;
    }).join('');
  }

  // ── Update ────────────────────────────────────────────────────
  function update(t) {
    const positions = SATELLITE_DEFS.map(def => satPos(def, t));

    // Move satellites
    positions.forEach((pos, i) => {
      const satG = satGroups[i];
      if (!satG) return;

      // Find the inner shape element and rotate it
      const shapeEl = satG.firstElementChild;
      if (shapeEl) {
        shapeEl.setAttribute('transform', `translate(${pos.x.toFixed(2)},${pos.y.toFixed(2)}) rotate(${(pos.angle * 180 / Math.PI).toFixed(2)})`);
      }

      // Active check: is this satellite in a connection?
      const isActive = connections.some(c => c.fromIdx === i || c.toIdx === i);
      const fill  = isActive ? CORE_COLOR : 'none';
      const stroke = CORE_COLOR;
      const pathEl = satG.querySelector('path, rect');
      if (pathEl) {
        pathEl.setAttribute('fill', isActive ? CORE_COLOR : 'rgba(245,158,11,0.12)');
        pathEl.setAttribute('stroke', stroke);
      }
    });

    // Connections
    maybeCreateConnection(t, positions);
    renderConnections(t, positions);

    // Halo pulse
    const haloR = 15 + 3 * Math.sin(t * 0.00033);
    haloEl?.setAttribute('r', haloR.toFixed(2));
  }

  function destroy() {
    group.innerHTML = '';
  }

  return { update, destroy };
}

/* ── Shape SVG builders ──────────────────────────────────────── */
function shapeSVG(def, i, pid) {
  switch (def.shape) {
    case 'triangle':
      return triangleSVG(def);
    case 'square':
      return squareSVG(def);
    case 'rectangle':
      return rectangleSVG(def);
    case 'diamond':
      return diamondSVG(def);
    default:
      return squareSVG(def);
  }
}

function triangleSVG(def) {
  const s = def.size;
  const h = s * (Math.sqrt(3) / 2);
  const pts = `0,${-(h * 2 / 3)} ${s / 2},${h / 3} ${-s / 2},${h / 3}`;
  return `<path
    d="M ${pts.split(' ').map(p => p.split(',')).map(([x, y]) => `${x} ${y}`).join(' L ')} Z"
    fill="rgba(245,158,11,0.12)"
    stroke="${CORE_COLOR}"
    stroke-width="1"
    transform="translate(0,0)"
  />`;
}

function squareSVG(def) {
  const s = def.size;
  return `<rect
    x="${-s / 2}" y="${-s / 2}"
    width="${s}" height="${s}"
    rx="2"
    fill="rgba(245,158,11,0.12)"
    stroke="${CORE_COLOR}"
    stroke-width="1"
    transform="translate(0,0)"
  />`;
}

function rectangleSVG(def) {
  const { w = 14, h = 6 } = typeof def.size === 'object' ? def.size : { w: def.size, h: def.size * 0.5 };
  return `<rect
    x="${-w / 2}" y="${-h / 2}"
    width="${w}" height="${h}"
    rx="2"
    fill="rgba(245,158,11,0.12)"
    stroke="${CORE_COLOR}"
    stroke-width="1"
    transform="translate(0,0)"
  />`;
}

function diamondSVG(def) {
  const s = def.size;
  return `<path
    d="M 0 ${-s / 2} L ${s / 2} 0 L 0 ${s / 2} L ${-s / 2} 0 Z"
    fill="rgba(245,158,11,0.12)"
    stroke="${CORE_COLOR}"
    stroke-width="1"
    transform="translate(0,0)"
  />`;
}
