/* ============================================================
   TrendLine — Animated travelling sine wave particle visual
   Specs: 12 points, width=150, cubic bezier segments, arrow at end
   ============================================================ */

import { random, TAU } from '../utils/math.js';

/**
 * @param {SVGGElement} group  the particle's <g> element
 * @param {string}      pid   unique particle id
 * @returns {{ update(t: number): void, destroy(): void }}
 */
export function TrendLine(group, pid) {
  const POINTS    = 12;
  const WIDTH     = 150;
  const amplitude = random(20, 40);       // px
  const frequency = random(0.02, 0.04);   // rad/px
  const speed     = random(0.0001, 0.0003); // rad/ms

  const gradId  = `tlg-${pid}`;
  const areaId  = `tla-${pid}`;
  const glowId  = `tlgl-${pid}`;

  // ── Build static structure ──────────────────────────────────
  group.innerHTML = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#00D9FF" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#0074D9" stop-opacity="0.7"/>
      </linearGradient>
      <linearGradient id="${areaId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#00D9FF" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#00D9FF" stop-opacity="0"/>
      </linearGradient>
      <filter id="${glowId}">
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Area fill under curve -->
    <path class="tl-area" fill="url(#${areaId})"/>

    <!-- Main curve stroke -->
    <path
      class="tl-line"
      fill="none"
      stroke="url(#${gradId})"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      filter="url(#${glowId})"
    />

    <!-- Arrow at end -->
    <path
      class="tl-arrow"
      fill="#00D9FF"
      opacity="0.75"
    />
  `;

  const linePath  = group.querySelector('.tl-line');
  const areaPath  = group.querySelector('.tl-area');
  const arrowPath = group.querySelector('.tl-arrow');

  // ── Point generation ────────────────────────────────────────
  function computePoints(t) {
    return Array.from({ length: POINTS }, (_, i) => {
      const xPos = (i / (POINTS - 1)) * WIDTH;
      return {
        x: xPos,
        y: amplitude * Math.sin(frequency * xPos - speed * t),
      };
    });
  }

  // ── Cubic bezier path builder ────────────────────────────────
  function buildCurvePath(pts) {
    if (pts.length < 2) return '';

    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const dx   = curr.x - prev.x;

      const cpx1 = prev.x + dx / 3;
      const cpy1 = prev.y;
      const cpx2 = prev.x + 2 * dx / 3;
      const cpy2 = curr.y;

      d += ` C ${cpx1.toFixed(2)} ${cpy1.toFixed(2)} ${cpx2.toFixed(2)} ${cpy2.toFixed(2)} ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    }

    return d;
  }

  // ── Area path (curve + close to baseline) ───────────────────
  function buildAreaPath(pts, curvePath) {
    const last  = pts.at(-1);
    const first = pts[0];
    return `${curvePath} L ${last.x.toFixed(2)} 0 L ${first.x.toFixed(2)} 0 Z`;
  }

  // ── Arrow head at last point ─────────────────────────────────
  function buildArrow(pts) {
    const last = pts.at(-1);
    const prev = pts.at(-2);
    const dx   = last.x - prev.x;
    const dy   = last.y - prev.y;
    const angle = Math.atan2(dy, dx);
    const len   = 10;
    const spread = 0.4; // radians half-angle

    const ax1 = last.x - len * Math.cos(angle - spread);
    const ay1 = last.y - len * Math.sin(angle - spread);
    const ax2 = last.x - len * Math.cos(angle + spread);
    const ay2 = last.y - len * Math.sin(angle + spread);

    return `M ${last.x.toFixed(2)} ${last.y.toFixed(2)} L ${ax1.toFixed(2)} ${ay1.toFixed(2)} L ${ax2.toFixed(2)} ${ay2.toFixed(2)} Z`;
  }

  // ── Update ───────────────────────────────────────────────────
  function update(t) {
    const pts       = computePoints(t);
    const curvePath = buildCurvePath(pts);

    linePath.setAttribute('d', curvePath);
    areaPath.setAttribute('d', buildAreaPath(pts, curvePath));
    arrowPath.setAttribute('d', buildArrow(pts));
  }

  function destroy() {
    group.innerHTML = '';
  }

  return { update, destroy };
}
