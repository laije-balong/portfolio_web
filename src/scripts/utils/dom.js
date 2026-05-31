/* ============================================================
   GnoLab DOM Utils
   ============================================================ */

/**
 * Shorthand querySelector with optional scope
 * @param {string} selector
 * @param {Element|Document} [scope=document]
 * @returns {Element|null}
 */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/**
 * Shorthand querySelectorAll returning Array
 * @param {string} selector
 * @param {Element|Document} [scope=document]
 * @returns {Element[]}
 */
export const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/**
 * Create an element with optional attributes and children
 * @param {string} tag
 * @param {Object} [attrs]
 * @param {...(string|Element)} children
 * @returns {Element}
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class') {
      element.className = val;
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else if (key.startsWith('on') && typeof val === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'html') {
      element.innerHTML = val;
    } else {
      element.setAttribute(key, val);
    }
  }

  for (const child of children) {
    if (child == null) continue;
    element.append(typeof child === 'string' ? child : child);
  }

  return element;
}

/**
 * Animate an element using WAAPI (Web Animations API)
 * @param {Element} element
 * @param {Keyframe[]} keyframes
 * @param {KeyframeAnimationOptions} options
 * @returns {Animation}
 */
export function animate(element, keyframes, options) {
  return element.animate(keyframes, {
    fill: 'forwards',
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    ...options,
  });
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
