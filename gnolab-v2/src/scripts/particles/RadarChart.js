/* ============================================================
   RadarChart — 5-axis pulsating radar with concentric level rings
   Specs: numAxes=5, maxRadius=[40,60], per-axis frequency & phase
   ============================================================ */

import { random, clamp, TAU } from '../utils/math.js';

/**
 * @param {SVGGElement} group
 * @param {string}      pid
 * @returns {{ update(t: number): void, destroy(): void }}
 */
export function RadarChart(group, pid) {
  const NUM_AXES  = 5;
  const NUM_LEVELS = 3;
  const maxRadius  = random(40, 60);
  const gradId     = `rcg-${pid}`;
  const filtId     = `rcf-${pid}`;

  // ── Per-axis config ──────────────────────────────────────────
  const axes = Array.from({ length: NUM_AXES }, () => ({
    baseValue: random(0.6, 0.95),
    amplitude: random(0.05, 0.15),
    frequency: random(0.0004, 0.0008), // rad/ms
    phase:     random(0, TAU),
  }));

  // ── Angle per axis (start at top = -π/2) ────────────────────
  const angles = axes.map((_, i) => (i / NUM_AXES) * TAU - Math.PI / 2);

  // ── Helper: value at time t for axis i ──────────────────────
  function axisValue(i, t) {
    const a = axes[i];
    return clamp(a.baseValue + a.amplitude * Math.sin(a.frequency * t + a.phase), 0, 1);
  }

  // ── Build polygon points string ──────────────────────────────
  function buildPolygonPoints(values) {
    return values.map((v, i) => {
      const r = v * maxRadius;
      const x = Math.cos(angles[i]) * r;
      const y = Math.sin(angles[i]) * r;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  // ── Level ring points (concentric) ──────────────────────────
  function buildLevelPoints(fraction) {
    return angles.map(a => {
      const r = fraction * maxRadius;
      return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
    }).join(' ');
  }

  // ── Axis lines (spokes) HTML ─────────────────────────────────
  const spokesHTML = angles.map(a => {
    const x = (Math.cos(a) * maxRadius).toFixed(2);
    const y = (Math.sin(a) * maxRadius).toFixed(2);
    return `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="rgba(139,92,246,0.15)" stroke-width="0.5"/>`;
  }).join('');

  // ── Axis vertex dots ─────────────────────────────────────────
  const dotsHTML = angles.map((a, i) => {
    const x = (Math.cos(a) * maxRadius).toFixed(2);
    const y = (Math.sin(a) * maxRadius).toFixed(2);
    const delay = (i * 0.2).toFixed(1);
    return `
      <circle
        class="rc-dot"
        cx="${x}" cy="${y}"
        r="3"
        fill="#8b5cf6"
        opacity="0.8"
      >
        <animate
          attributeName="r"
          values="3;5;3"
          dur="2s"
          begin="${delay}s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0.4;0.8"
          dur="2s"
          begin="${delay}s"
          repeatCount="indefinite"
        />
      </circle>
    `;
  }).join('');

  // ── Build DOM ────────────────────────────────────────────────
  group.innerHTML = `
    <defs>
      <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#8b5cf6" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.05"/>
      </radialGradient>
      <filter id="${filtId}">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Spokes -->
    <g class="rc-spokes">${spokesHTML}</g>

    <!-- Concentric level rings -->
    ${[1/3, 2/3, 1].map((f, i) => `
      <polygon
        class="rc-level"
        points="${buildLevelPoints(f)}"
        fill="none"
        stroke="rgba(139,92,246,${0.12 + i * 0.05})"
        stroke-width="0.5"
      />
    `).join('')}

    <!-- Main data polygon (filled) -->
    <polygon
      class="rc-poly"
      fill="url(#${gradId})"
      stroke="#8b5cf6"
      stroke-width="1.5"
      stroke-linejoin="round"
      filter="url(#${filtId})"
    />

    <!-- Vertex dots -->
    <g class="rc-dots">${dotsHTML}</g>
  `;

  const polyEl = group.querySelector('.rc-poly');
  const dotEls = Array.from(group.querySelectorAll('.rc-dot'));

  // ── Update ───────────────────────────────────────────────────
  function update(t) {
    const values = axes.map((_, i) => axisValue(i, t));
    polyEl.setAttribute('points', buildPolygonPoints(values));

    // Update dot positions to follow axis values
    values.forEach((v, i) => {
      const r = v * maxRadius;
      const x = (Math.cos(angles[i]) * r).toFixed(2);
      const y = (Math.sin(angles[i]) * r).toFixed(2);
      dotEls[i]?.setAttribute('cx', x);
      dotEls[i]?.setAttribute('cy', y);
    });
  }

  function destroy() {
    group.innerHTML = '';
  }

  return { update, destroy };
}
