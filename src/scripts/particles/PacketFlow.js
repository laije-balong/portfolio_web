/* ============================================================
   PacketFlow — Paquets circulant sur un lien réseau (métaphore systèmes)
   Deux nœuds reliés par un lien ; des paquets glissent du nœud source au
   nœud destination, en boucle, à des vitesses différentes — image du trafic
   réseau / d'un pipeline de données bas-niveau. Couleur = token --c-systemes.
   API identique aux autres formes : (group, pid) => ({ update(t), destroy() }).
   ============================================================ */

import { random, randomInt } from '../utils/math.js';

const NS = 'http://www.w3.org/2000/svg';
const SYS = 'var(--c-systemes, #22e3b8)';

/**
 * @param {SVGGElement} group  le <g> de la particule
 * @param {string}      pid    id unique
 * @returns {{ update(t: number): void, destroy(): void }}
 */
export function PacketFlow(group, pid) {
  const linkLen = random(90, 140);
  const nodeR = 6;
  const numPackets = randomInt(2, 4);

  // Chaque paquet a sa propre vitesse et position de départ (offset).
  const packets = Array.from({ length: numPackets }, () => ({
    speed: random(0.00018, 0.00045), // fraction du lien par ms
    offset: random(0, 1),
    size: random(2.5, 4),
  }));

  group.innerHTML = `
    <!-- Lien -->
    <line x1="0" y1="0" x2="${linkLen}" y2="0"
          stroke="${SYS}" stroke-opacity="0.3" stroke-width="1"
          stroke-dasharray="2 3"/>

    <!-- Nœud source -->
    <circle cx="0" cy="0" r="${nodeR}"
            fill="none" stroke="${SYS}" stroke-opacity="0.7" stroke-width="1.2"/>
    <circle cx="0" cy="0" r="2" fill="${SYS}" fill-opacity="0.8"/>

    <!-- Nœud destination -->
    <circle cx="${linkLen}" cy="0" r="${nodeR}"
            fill="none" stroke="${SYS}" stroke-opacity="0.7" stroke-width="1.2"/>
    <circle cx="${linkLen}" cy="0" r="2" fill="${SYS}" fill-opacity="0.8"/>

    <!-- Paquets -->
    <g class="pf-packets">
      ${packets.map((p, i) => `
        <rect class="pf-packet" data-i="${i}"
              x="0" y="${-p.size}" width="${p.size * 2}" height="${p.size * 2}" rx="1"
              fill="${SYS}" fill-opacity="0.9"/>
      `).join('')}
    </g>
  `;

  const packetEls = Array.from(group.querySelectorAll('.pf-packet'));

  function update(t) {
    for (let i = 0; i < numPackets; i++) {
      const p = packets[i];
      // Position normalisée [0,1) le long du lien, en boucle.
      const frac = (p.offset + p.speed * t) % 1;
      const x = frac * linkLen;
      packetEls[i].setAttribute('x', (x - p.size).toFixed(2));
      // Fondu aux extrémités (le paquet « entre » et « sort » du nœud).
      const edgeFade = Math.min(frac, 1 - frac) * 4;
      packetEls[i].setAttribute('fill-opacity', Math.min(0.9, 0.2 + edgeFade).toFixed(2));
    }
  }

  function destroy() {
    group.innerHTML = '';
  }

  return { update, destroy };
}
