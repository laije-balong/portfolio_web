/* ============================================================
   DataBars — Pulsating bar chart particle visual
   Specs: 3–5 bars, each with independent baseHeight + amplitude * sin(freq*t + phase)
   ============================================================ */

import { random, randomInt, TAU } from '../utils/math.js';

const NS = 'http://www.w3.org/2000/svg';

/**
 * @param {SVGGElement} group  the particle's <g> element to inject into
 * @param {string}      pid   unique particle id (for gradient ids)
 * @returns {{ update(t: number): void, destroy(): void }}
 */
export function DataBars(group, pid) {
  const numBars = randomInt(3, 5);
  const barW    = 12;
  const barGap  = 4;
  const stride  = barW + barGap;

  // ── Per-bar config ─────────────────────────────────────────
  const bars = Array.from({ length: numBars }, (_, i) => ({
    baseHeight: random(30, 80),
    amplitude:  random(10, 20),
    frequency:  random(0.0003, 0.001),   // rad/ms
    phase:      random(0, TAU),
    x:          i * stride,
  }));

  const totalW = numBars * stride - barGap;
  const gradId = `dbg-${pid}`;
  const filtId = `dbf-${pid}`;

  // ── Build static SVG structure ──────────────────────────────
  group.innerHTML = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%"   stop-color="#0074D9" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#00D9FF" stop-opacity="0.7"/>
      </linearGradient>
      <filter id="${filtId}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Glass container -->
    <rect
      class="db-glass"
      x="${-8}"
      y="${-100}"
      width="${totalW + 16}"
      height="${120}"
      rx="4"
      fill="rgba(255,255,255,0.04)"
      stroke="rgba(255,255,255,0.08)"
      stroke-width="0.5"
    />

    <!-- Bar group -->
    <g class="db-bars">
      ${bars.map((b, i) => `
        <g class="db-bar-group" data-i="${i}">
          <!-- Main bar -->
          <rect
            class="db-bar"
            x="${b.x}"
            y="0"
            width="${barW}"
            height="${b.baseHeight}"
            rx="2"
            fill="url(#${gradId})"
            transform="scale(1,-1)"
          />
          <!-- Highlight strip -->
          <rect
            class="db-highlight"
            x="${b.x}"
            y="${-(b.baseHeight * 0.2 + 1)}"
            width="${barW}"
            height="${Math.max(b.baseHeight * 0.2, 4)}"
            rx="2"
            fill="white"
            opacity="0.18"
            transform="scale(1,-1)"
          />
        </g>
      `).join('')}
    </g>

    <!-- Baseline -->
    <line
      x1="${-4}" y1="0"
      x2="${totalW + 4}" y2="0"
      stroke="rgba(255,255,255,0.15)"
      stroke-width="0.5"
    />
  `;

  // Cache DOM refs for fast updates
  const barEls       = Array.from(group.querySelectorAll('.db-bar'));
  const highlightEls = Array.from(group.querySelectorAll('.db-highlight'));

  // ── Update (called each RAF frame) ──────────────────────────
  function update(t) {
    for (let i = 0; i < numBars; i++) {
      const b  = bars[i];
      const h  = b.baseHeight + b.amplitude * Math.sin(b.frequency * t + b.phase);
      const hh = Math.max(h * 0.2, 4);

      // Bar: rect goes from y=0 downward in flipped space = upward visually
      barEls[i].setAttribute('height', h);

      // Highlight at top
      highlightEls[i].setAttribute('y', -(h));
      highlightEls[i].setAttribute('height', hh);
    }
  }

  function destroy() {
    group.innerHTML = '';
  }

  return { update, destroy };
}
