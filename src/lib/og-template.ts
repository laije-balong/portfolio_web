/* ============================================================================
   Gabarit d'image Open Graph (1200×630). Génère un SVG paramétrable, converti
   en PNG par sharp dans l'endpoint /og/[...slug].png.ts.
   Design aligné sur public/og.svg (couleurs = tokens du design system).
   ========================================================================== */

export interface OgData {
  /** Petit label en haut (mono), ex. « PROJET », « ARTICLE », « PORTFOLIO ». */
  eyebrow?: string;
  /** Titre principal (sera coupé en lignes automatiquement). */
  title: string;
  /** Sous-titre / accroche (une ligne, tronquée si trop longue). */
  subtitle?: string;
}

/** Échappe les caractères spéciaux XML pour une insertion sûre dans le SVG. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Coupe un texte en lignes d'au plus `max` caractères (sans casser les mots). */
function wrap(text: string, max: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + ' ' + w : w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s+\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

/** Tronque une ligne à `max` caractères avec une ellipse. */
function clamp(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

export function ogSvg({ eyebrow = 'GNOLAB', title, subtitle = '' }: OgData): string {
  const lines = wrap(title, 22, 3);
  const titleSize = lines.length >= 3 ? 56 : lines.length === 2 ? 66 : 76;
  const lineHeight = titleSize + 8;
  const titleTop = 360 - ((lines.length - 1) * lineHeight) / 2;

  const titleTspans = lines
    .map((l, i) => `<tspan x="72" y="${titleTop + i * lineHeight}">${esc(l)}</tspan>`)
    .join('');

  const sub = subtitle
    ? `<text x="72" y="${titleTop + lines.length * lineHeight + 18}" font-size="28" fill="#9fb4c7">${esc(clamp(subtitle, 64))}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="'Segoe UI','DejaVu Sans',sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020a14"/>
      <stop offset="1" stop-color="#061320"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.18" r="0.6">
      <stop offset="0" stop-color="#22e3b8" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#22e3b8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="20" y="20" width="1160" height="590" rx="20" fill="none" stroke="#14304a" stroke-width="2"/>
  <g transform="translate(72,84)">
    <rect x="0" y="-30" width="46" height="46" rx="10" fill="none" stroke="#22e3b8" stroke-width="2"/>
    <text x="23" y="2" font-family="monospace" font-size="22" font-weight="700" fill="#22e3b8" text-anchor="middle">GN</text>
    <text x="62" y="3" font-size="26" font-weight="700" fill="#e6f0fa">GnoLab</text>
  </g>
  <text x="72" y="225" font-family="monospace" font-size="22" letter-spacing="3" fill="#5f7d97">${esc(eyebrow.toUpperCase())}</text>
  <text font-size="${titleSize}" font-weight="800" fill="#e6f0fa">${titleTspans}</text>
  ${sub}
  <rect x="72" y="540" width="120" height="4" rx="2" fill="#22e3b8"/>
</svg>`;
}
