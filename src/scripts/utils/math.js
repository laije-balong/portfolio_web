/* ============================================================
   GnoLab Math Utils
   ============================================================ */

/**
 * Random float in [min, max)
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Random integer in [min, max] inclusive
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp value between min and max
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Linear interpolation
 * @param {number} a  start
 * @param {number} b  end
 * @param {number} t  0..1
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Sinusoidal easing (used for donut morph)
 * @param {number} t  normalized time 0..1
 * @returns {number}  eased 0..1
 */
export function easeSine(t) {
  return (Math.sin((t - 0.25) * Math.PI * 2) + 1) / 2;
}

/**
 * Check if point (px, py) is within viewport + margin
 * @param {number} px
 * @param {number} py
 * @param {number} vw  viewport width
 * @param {number} vh  viewport height
 * @param {number} [margin=100]
 * @returns {boolean}
 */
export function isInViewport(px, py, vw, vh, margin = 100) {
  return (
    px >= -margin &&
    px <= vw + margin &&
    py >= -margin &&
    py <= vh + margin
  );
}

/**
 * Convert polar to cartesian (for donut/radar arcs)
 * @param {number} cx  center x
 * @param {number} cy  center y
 * @param {number} r   radius
 * @param {number} angleDeg  angle in degrees
 * @returns {{ x: number, y: number }}
 */
export function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/**
 * Build an SVG arc path for donut segments
 * @param {number} cx  center x
 * @param {number} cy  center y
 * @param {number} outerR  outer radius
 * @param {number} innerR  inner radius
 * @param {number} startAngle degrees
 * @param {number} endAngle   degrees
 * @returns {string}  SVG path d attribute
 */
export function donutSegmentPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const start1 = polarToCartesian(cx, cy, outerR, startAngle);
  const end1   = polarToCartesian(cx, cy, outerR, endAngle);
  const start2 = polarToCartesian(cx, cy, innerR, endAngle);
  const end2   = polarToCartesian(cx, cy, innerR, startAngle);
  const large  = (endAngle - startAngle) > 180 ? 1 : 0;

  return [
    `M ${start1.x} ${start1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${end1.x} ${end1.y}`,
    `L ${start2.x} ${start2.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${end2.x} ${end2.y}`,
    'Z',
  ].join(' ');
}

/**
 * Generate a unique ID string
 * @param {string} [prefix='id']
 * @returns {string}
 */
export function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/**
 * Two PI constant
 */
export const TAU = Math.PI * 2;

/**
 * Degree → radian
 * @param {number} deg
 * @returns {number}
 */
export function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Radian → degree
 * @param {number} rad
 * @returns {number}
 */
export function toDeg(rad) {
  return rad * (180 / Math.PI);
}
