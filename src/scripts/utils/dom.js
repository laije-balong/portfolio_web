/* ============================================================
   GnoLab — DOM Utils (minimal)
   ============================================================ */

/**
 * Debounce a function call
 * @param {Function} fn
 * @param {number} wait  milliseconds
 * @returns {Function}
 */
export function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}
