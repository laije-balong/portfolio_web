/* ============================================================
   RawChart — État "Brut"
   Scatter plot chaotique : points bruités, outliers rouges,
   grille instable, jitter par frame
   ============================================================ */

import { random, randomInt, uid } from '../utils/math.js';

const W = 300, H = 220;
const POINT_COUNT = 42;
const OUTLIER_RATIO = 0.18; // ~8 points sont des outliers

/**
 * @param {string} pid  unique id for SVG defs
 * @returns {{ el: SVGElement, start(): void, stop(): void }}
 */
export function RawChart(pid) {
  const gid   = `rc-${pid}`;
  const fid   = `rf-${pid}`;
  const nid   = `rn-${pid}`;

  // ── Generate point cloud (pseudo-random but seeded visually) ──
  const points = Array.from({ length: POINT_COUNT }, (_, i) => {
    const isOutlier = Math.random() < OUTLIER_RATIO;
    return {
      baseX: random(28, W - 28),
      baseY: random(28, H - 52),
      jitterAmp: isOutlier ? random(3, 7) : random(0.5, 2.5),
      jitterFreqX: random(0.001, 0.004),
      jitterFreqY: random(0.001, 0.004),
      phaseX: random(0, Math.PI * 2),
      phaseY: random(0, Math.PI * 2),
      r: isOutlier ? random(4, 6) : random(2.5, 4),
      isOutlier,
      opacity: isOutlier ? random(0.7, 1) : random(0.4, 0.85),
    };
  });

  // ── SVG element ───────────────────────────────────────────────
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'mc-svg mc-raw');

  svg.innerHTML = `
    <defs>
      <radialGradient id="${gid}-bg" cx="50%" cy="50%" r="60%">
        <stop offset="0%"   stop-color="#ef4444" stop-opacity="0.07"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
      </radialGradient>
      <filter id="${fid}">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"
          seed="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise"
          scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="${nid}">
        <feGaussianBlur stdDeviation="1.2"/>
      </filter>
    </defs>

    <!-- Background glow -->
    <rect width="${W}" height="${H}" fill="url(#${gid}-bg)"/>

    <!-- Unstable grid -->
    <g class="rc-grid" opacity="0.08" stroke="#ef4444" stroke-width="0.5" fill="none">
      ${[0.25,0.5,0.75].map(f =>
        `<line x1="${W*f}" y1="0" x2="${W*f}" y2="${H}"/>
         <line x1="0" y1="${(H-40)*f+10}" x2="${W}" y2="${(H-40)*f+10}"/>`
      ).join('')}
    </g>

    <!-- Noise label top-right -->
    <text x="${W-8}" y="16" text-anchor="end"
      font-family="JetBrains Mono, monospace" font-size="9"
      fill="#ef4444" opacity="0.5" letter-spacing="0.06em">NOISE:HIGH</text>

    <!-- Points group -->
    <g class="rc-points" filter="url(#${fid})">
      ${points.map((p, i) => `
        <circle
          class="rc-pt"
          data-i="${i}"
          cx="${p.baseX.toFixed(2)}"
          cy="${p.baseY.toFixed(2)}"
          r="${p.r.toFixed(2)}"
          fill="${p.isOutlier ? '#ef4444' : '#0074D9'}"
          opacity="${p.opacity.toFixed(2)}"
        />
      `).join('')}
    </g>

    <!-- Outlier halos -->
    <g class="rc-halos" opacity="0.3">
      ${points.filter(p => p.isOutlier).map(p => `
        <circle cx="${p.baseX.toFixed(2)}" cy="${p.baseY.toFixed(2)}"
          r="${(p.r * 2.5).toFixed(2)}" fill="none"
          stroke="#ef4444" stroke-width="0.8"
          stroke-dasharray="2 3"/>
      `).join('')}
    </g>

    <!-- Bottom label -->
    <text x="${W/2}" y="${H-6}" text-anchor="middle"
      font-family="JetBrains Mono, monospace" font-size="9"
      fill="#ef4444" opacity="0.45" letter-spacing="0.08em">DONNÉES BRUTES — OUTLIERS DÉTECTÉS</text>

    <!-- Sigma annotation -->
    <text x="12" y="18"
      font-family="JetBrains Mono, monospace" font-size="10"
      fill="#ef4444" opacity="0.6">σ = 4.72</text>
  `;

  // Cache point elements
  const ptEls   = Array.from(svg.querySelectorAll('.rc-pt'));
  const haloEls = Array.from(svg.querySelectorAll('.rc-halos circle'));
  let rafId = null;

  function tick(t) {
    points.forEach((p, i) => {
      const jx = p.jitterAmp * Math.sin(p.jitterFreqX * t + p.phaseX);
      const jy = p.jitterAmp * Math.sin(p.jitterFreqY * t + p.phaseY);
      const nx = (p.baseX + jx).toFixed(2);
      const ny = (p.baseY + jy).toFixed(2);
      ptEls[i]?.setAttribute('cx', nx);
      ptEls[i]?.setAttribute('cy', ny);
    });

    // Halo pulse
    const outlierPts = points.filter(p => p.isOutlier);
    haloEls.forEach((el, i) => {
      const p   = outlierPts[i];
      if (!p) return;
      const jx = p.jitterAmp * Math.sin(p.jitterFreqX * t + p.phaseX);
      const jy = p.jitterAmp * Math.sin(p.jitterFreqY * t + p.phaseY);
      el.setAttribute('cx', (p.baseX + jx).toFixed(2));
      el.setAttribute('cy', (p.baseY + jy).toFixed(2));
      const r = p.r * (2.5 + 0.6 * Math.sin(t * 0.002 + i));
      el.setAttribute('r', r.toFixed(2));
    });

    rafId = requestAnimationFrame(tick);
  }

  return {
    el: svg,
    start() { rafId = requestAnimationFrame(tick); },
    stop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } },
  };
}