/* ============================================================
   DonutChart — Morphing segmented donut with independent rotation
   Specs: 3–5 segments, 4000ms morph cycle, sinusoidal easing
   ============================================================ */

import { random, randomInt, clamp, easeSine, donutSegmentPath, TAU } from '../utils/math.js';

const SEGMENT_COLORS = [
  ['#00D9FF', '#0074D9'],
  ['#8b5cf6', '#6d28d9'],
  ['#10b981', '#059669'],
  ['#f59e0b', '#d97706'],
  ['#ef4444', '#dc2626'],
];

/**
 * @param {SVGGElement} group
 * @param {string}      pid
 * @returns {{ update(t: number): void, destroy(): void }}
 */
export function DonutChart(group, pid) {
  const outerRadius = random(30, 50);
  const innerRadius = outerRadius * 0.6;
  const numSegments = randomInt(3, 5);
  const CYCLE       = 4000; // ms
  const globalRotSpeed = random(0.0003, 0.0008); // deg/ms

  // ── Segment configs ──────────────────────────────────────────
  // Two "states" to morph between
  function makeState() {
    const vals = Array.from({ length: numSegments }, () => random(0.05, 1));
    const sum  = vals.reduce((a, b) => a + b, 0);
    return vals.map(v => v / sum); // normalize to 100%
  }

  const segments = Array.from({ length: numSegments }, (_, i) => ({
    colorFrom: SEGMENT_COLORS[i % SEGMENT_COLORS.length][0],
    colorTo:   SEGMENT_COLORS[i % SEGMENT_COLORS.length][1],
    rotSpeed:  random(0.00005, 0.0002) * (Math.random() < 0.5 ? 1 : -1),
    fromState: makeState()[i] ?? 1 / numSegments,
    toState:   makeState()[i] ?? 1 / numSegments,
    currentVal: 1 / numSegments,
    cycleStart: 0,
    // For independent states — build full arrays per segment pair
  }));

  // Full percentage arrays for morphing
  let stateA = makeState();
  let stateB = makeState();
  let cycleStart = 0;

  const gradIds  = segments.map((_, i) => `dcg-${pid}-${i}`);
  const centerId = `dcc-${pid}`;

  // ── Build static structure ──────────────────────────────────
  const defsHTML = segments.map((s, i) => `
    <radialGradient id="${gradIds[i]}" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${s.colorFrom}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${s.colorTo}"   stop-opacity="0.6"/>
    </radialGradient>
  `).join('');

  const segmentsHTML = segments.map((_, i) => `
    <path
      class="dc-seg"
      data-i="${i}"
      fill="url(#${gradIds[i]})"
      stroke="rgba(255,255,255,0.15)"
      stroke-width="0.8"
    />
  `).join('');

  group.innerHTML = `
    <defs>${defsHTML}</defs>
    <g class="dc-rotor">
      ${segmentsHTML}
    </g>
    <!-- Central pulsing dot -->
    <circle class="dc-center" cx="0" cy="0" r="3" fill="#f59e0b" opacity="0.9"/>
    <circle class="dc-halo"   cx="0" cy="0" r="12"
      fill="rgba(245,158,11,0.08)"
      stroke="rgba(245,158,11,0.2)"
      stroke-width="0.5"
    />
  `;

  const rotor   = group.querySelector('.dc-rotor');
  const segEls  = Array.from(group.querySelectorAll('.dc-seg'));
  const haloEl  = group.querySelector('.dc-halo');

  // ── Draw segments from percentage array ─────────────────────
  function drawSegments(percentages, globalRot) {
    let angle = globalRot; // start angle in degrees

    for (let i = 0; i < numSegments; i++) {
      const sweep = percentages[i] * 360;
      const end   = angle + sweep;

      segEls[i].setAttribute('d', donutSegmentPath(0, 0, outerRadius, innerRadius, angle, end));

      angle = end;
    }
  }

  // ── Update ───────────────────────────────────────────────────
  function update(t) {
    // Global rotation
    const globalRot = (globalRotSpeed * t) % 360;

    // Morph cycle
    const elapsed   = (t - cycleStart) % CYCLE;
    const tNorm     = elapsed / CYCLE;
    const easedT    = easeSine(tNorm);

    // If cycle wrapped → swap states
    if (elapsed < (t - cycleStart - CYCLE * Math.floor((t - cycleStart) / CYCLE)) + 16) {
      // check if we crossed a cycle boundary
    }

    // Interpolate percentages
    const currentPcts = stateA.map((a, i) => a + (stateB[i] - a) * easedT);

    // When eased ≈ 1 (near end of cycle), prepare next cycle
    if (easedT > 0.98 && t - cycleStart > CYCLE * 0.98) {
      stateA = stateB.slice();
      stateB = makeState();
      cycleStart = t;
    }

    drawSegments(currentPcts, globalRot);

    // Halo pulse (0.3 → 0.7 over 2s)
    const haloOpa = 0.08 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.0031));
    haloEl.setAttribute('fill', `rgba(245,158,11,${haloOpa.toFixed(3)})`);

    // Scale halo
    const haloR = 12 + 4 * (0.5 + 0.5 * Math.sin(t * 0.0031));
    haloEl.setAttribute('r', haloR.toFixed(2));
  }

  function destroy() {
    group.innerHTML = '';
  }

  return { update, destroy };
}
