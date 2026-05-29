/* ============================================================
   ResultsChart — État "Résultats"
   Ligne de tendance claire, bande de confiance, KPI callouts
   avec compteurs animés, palette verte
   ============================================================ */

import { random, uid } from '../utils/math.js';

const W = 300, H = 220;

// KPI tiles shown in bottom row
const KPIS = [
  { label: 'Réduction', value: 23, suffix: '%', color: '#10b981' },
  { label: 'ROI',       value: 8,  suffix: 'mo', color: '#00D9FF' },
  { label: 'Précision', value: 94, suffix: '%',  color: '#8b5cf6' },
];

// Trend data points (normalized 0-1 for x, value for y)
const DATA = [
  [0.05, 0.72], [0.13, 0.68], [0.21, 0.61], [0.29, 0.55],
  [0.37, 0.48], [0.46, 0.41], [0.54, 0.36], [0.62, 0.30],
  [0.71, 0.25], [0.79, 0.21], [0.88, 0.18], [0.96, 0.15],
];

const CHART_TOP    = 18;
const CHART_BOTTOM = H - 70;  // leave room for KPIs
const CHART_LEFT   = 24;
const CHART_RIGHT  = W - 12;

function mapX(nx) { return CHART_LEFT + nx * (CHART_RIGHT - CHART_LEFT); }
function mapY(ny) { return CHART_BOTTOM - ny * (CHART_BOTTOM - CHART_TOP); }

/**
 * @param {string} pid
 * @param {Object} [projectData]  optional real metrics from project JSON
 * @returns {{ el: SVGElement, start(): void, stop(): void }}
 */
export function ResultsChart(pid, projectData) {
  const gid = `res-${pid}`;

  // Map data to SVG coords
  const pts = DATA.map(([nx, ny]) => ({ x: mapX(nx), y: mapY(ny) }));

  // Bezier path
  function buildPath(pts) {
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1], curr = pts[i];
      const dx   = curr.x - prev.x;
      const cpx1 = prev.x + dx / 3, cpy1 = prev.y;
      const cpx2 = prev.x + 2 * dx / 3, cpy2 = curr.y;
      d += ` C ${cpx1.toFixed(2)} ${cpy1.toFixed(2)} ${cpx2.toFixed(2)} ${cpy2.toFixed(2)} ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    }
    return d;
  }

  const curvePath = buildPath(pts);
  const areaPath  = curvePath +
    ` L ${pts.at(-1).x.toFixed(2)} ${CHART_BOTTOM} L ${pts[0].x.toFixed(2)} ${CHART_BOTTOM} Z`;

  // Confidence band (±5% of each point)
  const upperPts = DATA.map(([nx, ny]) => ({ x: mapX(nx), y: mapY(Math.min(ny + 0.06, 1)) }));
  const lowerPts = DATA.map(([nx, ny]) => ({ x: mapX(nx), y: mapY(Math.max(ny - 0.06, 0)) }));
  const bandPath = buildPath(upperPts) +
    ` L ${lowerPts.at(-1).x.toFixed(2)} ${lowerPts.at(-1).y.toFixed(2)} ` +
    [...lowerPts].reverse().map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') +
    ' Z';

  // Total path length for draw animation (approximate)
  const pathLen = 350;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg   = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'mc-svg mc-results');

  svg.innerHTML = `
    <defs>
      <linearGradient id="${gid}-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#00D9FF" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="${gid}-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#10b981" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${gid}-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#10b981" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
      </linearGradient>
      <filter id="${gid}-glow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Background glow -->
    <radialGradient id="${gid}-bg-g" cx="80%" cy="20%" r="60%">
      <stop offset="0%"   stop-color="#10b981" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <rect width="${W}" height="${H}" fill="url(#${gid}-bg-g)" opacity="0"/>

    <!-- Grid -->
    <g opacity="0.07" stroke="#10b981" stroke-width="0.5" fill="none">
      ${[0.25, 0.5, 0.75].map(f =>
        `<line x1="${CHART_LEFT}" y1="${mapY(f).toFixed(1)}"
               x2="${CHART_RIGHT}" y2="${mapY(f).toFixed(1)}" stroke-dasharray="3 4"/>
         <line x1="${mapX(f)}" y1="${CHART_TOP}"
               x2="${mapX(f)}" y2="${CHART_BOTTOM}" stroke-dasharray="3 4"/>`
      ).join('')}
    </g>

    <!-- Axes -->
    <line x1="${CHART_LEFT}" y1="${CHART_BOTTOM}" x2="${CHART_RIGHT}" y2="${CHART_BOTTOM}"
      stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <line x1="${CHART_LEFT}" y1="${CHART_TOP}" x2="${CHART_LEFT}" y2="${CHART_BOTTOM}"
      stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

    <!-- Confidence band -->
    <path d="${bandPath}" fill="url(#${gid}-band)"/>

    <!-- Area fill -->
    <path d="${areaPath}" fill="url(#${gid}-area)"/>

    <!-- Trend line (drawn via stroke-dashoffset animation) -->
    <path class="res-line"
      d="${curvePath}" fill="none"
      stroke="url(#${gid}-line)" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="${pathLen}" stroke-dashoffset="${pathLen}"
      filter="url(#${gid}-glow)"
    />

    <!-- Data points (appear after line draws) -->
    <g class="res-dots" opacity="0">
      ${pts.map((p, i) => `
        <circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3"
          fill="#10b981" opacity="0.85"
          class="res-dot" data-i="${i}"/>
      `).join('')}
    </g>

    <!-- Arrow at end of line -->
    <path class="res-arrow" fill="#10b981" opacity="0"/>

    <!-- KPI tiles row -->
    <g class="res-kpis">
      ${KPIS.map((kpi, i) => {
        const tileW = (W - 16) / 3;
        const tileX = 8 + i * tileW;
        const tileY = H - 62;
        return `
          <rect x="${tileX.toFixed(1)}" y="${tileY}"
            width="${(tileW - 6).toFixed(1)}" height="52"
            rx="6" fill="${kpi.color}" fill-opacity="0.07"
            stroke="${kpi.color}" stroke-opacity="0.2" stroke-width="0.8"/>
          <text x="${(tileX + (tileW-6)/2).toFixed(1)}" y="${tileY + 22}"
            text-anchor="middle"
            font-family="Syne, sans-serif" font-size="16" font-weight="700"
            fill="${kpi.color}" class="res-kval" data-target="${kpi.value}" data-suffix="${kpi.suffix}">0${kpi.suffix}</text>
          <text x="${(tileX + (tileW-6)/2).toFixed(1)}" y="${tileY + 39}"
            text-anchor="middle"
            font-family="JetBrains Mono, monospace" font-size="8"
            fill="${kpi.color}" opacity="0.6" letter-spacing="0.04em">${kpi.label.toUpperCase()}</text>
        `;
      }).join('')}
    </g>

    <!-- Top label -->
    <text x="${W-8}" y="16" text-anchor="end"
      font-family="JetBrains Mono, monospace" font-size="9"
      fill="#10b981" opacity="0.55" letter-spacing="0.04em">TENDANCE CONFIRMÉE</text>
  `;

  const lineEl    = svg.querySelector('.res-line');
  const dotsGroup = svg.querySelector('.res-dots');
  const arrowEl   = svg.querySelector('.res-arrow');
  const dotEls    = Array.from(svg.querySelectorAll('.res-dot'));
  const kvalEls   = Array.from(svg.querySelectorAll('.res-kval'));

  let rafId  = null;
  let startT = null;
  const DRAW_DUR   = 1400;   // ms for line draw
  const DOTS_DELAY = 1200;
  const KPI_DELAY  = 1000;

  function buildArrow(t) {
    const last = pts.at(-1);
    const prev = pts.at(-2);
    const ang  = Math.atan2(last.y - prev.y, last.x - prev.x);
    const len  = 9;
    const sp   = 0.42;
    const ax1  = last.x - len * Math.cos(ang - sp);
    const ay1  = last.y - len * Math.sin(ang - sp);
    const ax2  = last.x - len * Math.cos(ang + sp);
    const ay2  = last.y - len * Math.sin(ang + sp);
    return `M ${last.x.toFixed(2)} ${last.y.toFixed(2)} L ${ax1.toFixed(2)} ${ay1.toFixed(2)} L ${ax2.toFixed(2)} ${ay2.toFixed(2)} Z`;
  }

  function tick(ts) {
    if (!startT) startT = ts;
    const elapsed = ts - startT;

    // 1. Draw line
    const lineProgress = Math.min(elapsed / DRAW_DUR, 1);
    const eased        = 1 - Math.pow(1 - lineProgress, 3); // ease-out cubic
    lineEl.setAttribute('stroke-dashoffset', (pathLen * (1 - eased)).toFixed(2));

    // 2. Dots fade in
    if (elapsed > DOTS_DELAY) {
      const dProgress = Math.min((elapsed - DOTS_DELAY) / 400, 1);
      dotsGroup.setAttribute('opacity', dProgress.toFixed(3));
      arrowEl.setAttribute('opacity', dProgress.toFixed(3));
      arrowEl.setAttribute('d', buildArrow());
    }

    // 3. KPI counter
    if (elapsed > KPI_DELAY) {
      const kProgress = Math.min((elapsed - KPI_DELAY) / 800, 1);
      KPIS.forEach((kpi, i) => {
        const val = Math.round(kpi.value * kProgress);
        if (kvalEls[i]) kvalEls[i].textContent = `${val}${kpi.suffix}`;
      });
    }

    // 4. Dot pulse (after appearing)
    if (elapsed > DOTS_DELAY + 400) {
      dotEls.forEach((el, i) => {
        const p = pts[i];
        const pulse = 3 + 0.8 * Math.sin(ts * 0.002 + i * 0.6);
        el.setAttribute('r', pulse.toFixed(2));
      });
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    el: svg,
    start() {
      startT = null;
      // Reset line
      lineEl.setAttribute('stroke-dashoffset', pathLen);
      dotsGroup.setAttribute('opacity', '0');
      arrowEl.setAttribute('opacity', '0');
      kvalEls.forEach((el, i) => { el.textContent = `0${KPIS[i].suffix}`; });
      rafId = requestAnimationFrame(tick);
    },
    stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } },
  };
}