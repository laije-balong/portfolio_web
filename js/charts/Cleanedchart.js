/* ============================================================
   CleanedChart — État "Nettoyé"
   Données structurées : clusters, outliers supprimés,
   ligne de tendance qui émerge, distributions propres
   ============================================================ */

import { random, uid } from '../utils/math.js';

const W = 300, H = 220;

// 3 clusters de points propres
const CLUSTERS = [
  { cx: 68,  cy: 160, spread: 18, count: 10, color: '#00D9FF' },
  { cx: 150, cy: 105, spread: 20, count: 14, color: '#8b5cf6' },
  { cx: 235, cy: 58,  spread: 16, count: 12, color: '#10b981' },
];

/**
 * @param {string} pid
 * @returns {{ el: SVGElement, start(): void, stop(): void }}
 */
export function CleanedChart(pid) {
  const gid = `cc-${pid}`;

  // Generate clustered points
  const points = CLUSTERS.flatMap((cl, ci) =>
    Array.from({ length: cl.count }, (_, i) => ({
      baseX:  cl.cx + (Math.random() - 0.5) * cl.spread * 2,
      baseY:  cl.cy + (Math.random() - 0.5) * cl.spread * 2,
      breathFreq: random(0.0008, 0.0015),
      breathPhase: random(0, Math.PI * 2),
      breathAmp: random(0.5, 1.5),
      r:      random(2.5, 4),
      color:  cl.color,
      clusterIdx: ci,
      opacity: random(0.55, 0.9),
    }))
  );

  // Trend line: linear regression through cluster centers
  // y = mx + b  — computed from CLUSTERS
  const xs  = CLUSTERS.map(c => c.cx);
  const ys  = CLUSTERS.map(c => c.cy);
  const n   = xs.length;
  const sumX  = xs.reduce((a, b) => a + b, 0);
  const sumY  = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const m   = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b   = (sumY - m * sumX) / n;

  const trendX1 = 20,  trendY1 = m * 20 + b;
  const trendX2 = 280, trendY2 = m * 280 + b;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg   = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'mc-svg mc-cleaned');

  svg.innerHTML = `
    <defs>
      <radialGradient id="${gid}-bg" cx="50%" cy="50%" r="60%">
        <stop offset="0%"   stop-color="#00D9FF" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
      </radialGradient>
      ${CLUSTERS.map((cl, i) => `
        <radialGradient id="${gid}-cl${i}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${cl.color}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${cl.color}" stop-opacity="0"/>
        </radialGradient>
      `).join('')}
      <linearGradient id="${gid}-trend" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#00D9FF" stop-opacity="0.3"/>
        <stop offset="50%"  stop-color="#8b5cf6" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.3"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${W}" height="${H}" fill="url(#${gid}-bg)"/>

    <!-- Clean grid -->
    <g opacity="0.06" stroke="#00D9FF" stroke-width="0.5" fill="none">
      ${[0.25,0.5,0.75].map(f =>
        `<line x1="${W*f}" y1="8" x2="${W*f}" y2="${H-30}" stroke-dasharray="3 4"/>
         <line x1="16" y1="${(H-38)*f+8}" x2="${W-8}" y2="${(H-38)*f+8}" stroke-dasharray="3 4"/>`
      ).join('')}
    </g>

    <!-- Axes -->
    <line x1="16" y1="${H-30}" x2="${W-8}" y2="${H-30}"
      stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <line x1="16" y1="8" x2="16" y2="${H-30}"
      stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

    <!-- Cluster halos -->
    ${CLUSTERS.map((cl, i) => `
      <ellipse class="cl-halo" data-i="${i}"
        cx="${cl.cx}" cy="${cl.cy}"
        rx="${cl.spread * 1.4}" ry="${cl.spread * 1.4}"
        fill="url(#${gid}-cl${i})"
      />
    `).join('')}

    <!-- Trend line -->
    <line class="cc-trend"
      x1="${trendX1.toFixed(1)}" y1="${trendY1.toFixed(1)}"
      x2="${trendX2.toFixed(1)}" y2="${trendY2.toFixed(1)}"
      stroke="url(#${gid}-trend)" stroke-width="1.5"
      stroke-dasharray="5 3" opacity="0.7"/>

    <!-- Points -->
    <g class="cc-pts">
      ${points.map((p, i) => `
        <circle class="cc-pt" data-i="${i}"
          cx="${p.baseX.toFixed(2)}" cy="${p.baseY.toFixed(2)}"
          r="${p.r.toFixed(2)}"
          fill="${p.color}" opacity="${p.opacity.toFixed(2)}"/>
      `).join('')}
    </g>

    <!-- Cluster center markers -->
    ${CLUSTERS.map(cl => `
      <circle cx="${cl.cx}" cy="${cl.cy}" r="4"
        fill="none" stroke="${cl.color}" stroke-width="1.5" opacity="0.9"/>
      <circle cx="${cl.cx}" cy="${cl.cy}" r="1.5"
        fill="${cl.color}" opacity="0.9"/>
    `).join('')}

    <!-- R² annotation -->
    <text x="${W-8}" y="18" text-anchor="end"
      font-family="JetBrains Mono, monospace" font-size="9"
      fill="#00D9FF" opacity="0.6" letter-spacing="0.04em">R² = 0.94</text>

    <!-- Label -->
    <text x="${W/2}" y="${H-6}" text-anchor="middle"
      font-family="JetBrains Mono, monospace" font-size="9"
      fill="#00D9FF" opacity="0.45" letter-spacing="0.08em">DONNÉES NETTOYÉES — 3 CLUSTERS</text>

    <!-- Cluster labels -->
    ${CLUSTERS.map((cl, i) => `
      <text x="${cl.cx}" y="${cl.cy - cl.spread - 4}" text-anchor="middle"
        font-family="JetBrains Mono, monospace" font-size="8"
        fill="${cl.color}" opacity="0.7">C${i + 1}</text>
    `).join('')}
  `;

  const ptEls    = Array.from(svg.querySelectorAll('.cc-pt'));
  const haloEls  = Array.from(svg.querySelectorAll('.cl-halo'));
  const trendEl  = svg.querySelector('.cc-trend');
  let rafId = null;

  function tick(t) {
    // Points breathe gently
    points.forEach((p, i) => {
      const b  = p.breathAmp * Math.sin(p.breathFreq * t + p.breathPhase);
      ptEls[i]?.setAttribute('r', (p.r + b * 0.4).toFixed(2));
    });

    // Cluster halos pulse
    haloEls.forEach((el, i) => {
      const cl   = CLUSTERS[i];
      const pulse = 1 + 0.12 * Math.sin(t * 0.0008 + i * 1.2);
      el.setAttribute('rx', (cl.spread * 1.4 * pulse).toFixed(2));
      el.setAttribute('ry', (cl.spread * 1.4 * pulse).toFixed(2));
    });

    // Trend line dash-offset travels
    const offset = (t * 0.02) % 8;
    trendEl?.setAttribute('stroke-dashoffset', (-offset).toFixed(2));

    rafId = requestAnimationFrame(tick);
  }

  return {
    el: svg,
    start() { rafId = requestAnimationFrame(tick); },
    stop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } },
  };
}