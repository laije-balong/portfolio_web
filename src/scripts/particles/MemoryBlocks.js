/* ============================================================
   MemoryBlocks — Allocation/libération de blocs mémoire (métaphore systèmes)
   Clin d'œil au projet « memory-allocator » en C : une rangée de cellules
   mémoire contiguës qui s'allouent (se remplissent) puis se libèrent, au rythme
   d'un faux malloc/free. Couleur = token --c-systemes (cohérence Systèmes/BA).
   API identique aux autres formes : (group, pid) => ({ update(t), destroy() }).
   ============================================================ */

import { random, randomInt, TAU } from '../utils/math.js';

const NS = 'http://www.w3.org/2000/svg';
// Couleur « systèmes » (token tokens.css) avec repli si la var n'est pas lue.
const SYS = 'var(--c-systemes, #22e3b8)';

/**
 * @param {SVGGElement} group  le <g> de la particule
 * @param {string}      pid    id unique (pour les ids de gradient)
 * @returns {{ update(t: number): void, destroy(): void }}
 */
export function MemoryBlocks(group, pid) {
  const numCells = randomInt(5, 8);
  const cellW = 14;
  const cellH = 18;
  const gap = 3;
  const stride = cellW + gap;
  const totalW = numCells * stride - gap;

  // Chaque cellule a sa propre cadence d'allocation (sinus déphasé) : quand
  // sin > seuil, le bloc est « alloué » (rempli) ; sinon « libre » (contour).
  const cells = Array.from({ length: numCells }, (_, i) => ({
    x: i * stride,
    frequency: random(0.0004, 0.0011), // rad/ms
    phase: random(0, TAU),
    threshold: random(-0.2, 0.4),
  }));

  const gradId = `mbg-${pid}`;

  group.innerHTML = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="${SYS}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${SYS}" stop-opacity="0.55"/>
      </linearGradient>
    </defs>

    <!-- Étiquette mémoire (adresse fictive) -->
    <text x="0" y="-8" font-family="monospace" font-size="9"
          fill="${SYS}" opacity="0.55">0x${pid.replace(/\D/g, '').slice(-3).padStart(3, '0')}</text>

    <!-- Cadre de la zone mémoire -->
    <rect x="-4" y="-4" width="${totalW + 8}" height="${cellH + 8}" rx="3"
          fill="none" stroke="${SYS}" stroke-opacity="0.18" stroke-width="0.5"/>

    <!-- Cellules -->
    <g class="mb-cells">
      ${cells.map((c, i) => `
        <rect class="mb-cell" data-i="${i}"
              x="${c.x}" y="0" width="${cellW}" height="${cellH}" rx="2"
              fill="url(#${gradId})"
              stroke="${SYS}" stroke-opacity="0.45" stroke-width="0.75"/>
      `).join('')}
    </g>
  `;

  const cellEls = Array.from(group.querySelectorAll('.mb-cell'));

  function update(t) {
    for (let i = 0; i < numCells; i++) {
      const c = cells[i];
      const allocated = Math.sin(c.frequency * t + c.phase) > c.threshold;
      // Alloué : rempli et opaque. Libre : quasi transparent (juste le contour).
      cellEls[i].setAttribute('fill-opacity', allocated ? '1' : '0.06');
    }
  }

  function destroy() {
    group.innerHTML = '';
  }

  return { update, destroy };
}
