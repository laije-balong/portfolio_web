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
 * Create an SVG element (namespace-aware)
 * @param {string} tag
 * @param {Object} [attrs]
 * @returns {SVGElement}
 */
export function svgEl(tag, attrs = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, val] of Object.entries(attrs)) {
    element.setAttribute(key, val);
  }
  return element;
}

/**
 * Safely set innerHTML with a string (no sanitization—use trusted HTML only)
 * @param {Element} element
 * @param {string} html
 */
export function setHTML(element, html) {
  element.innerHTML = html;
}

/**
 * Toggle a class based on a condition
 * @param {Element} element
 * @param {string} className
 * @param {boolean} condition
 */
export function toggleClass(element, className, condition) {
  element.classList.toggle(className, condition);
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
 * FLIP transition: animate element from bounding rect `from` to its current position
 * @param {Element} element
 * @param {DOMRect} from
 * @param {number} [duration=450]
 * @returns {Animation}
 */
export function flipFrom(element, from, duration = 450) {
  const to = element.getBoundingClientRect();

  const dx = from.left - to.left;
  const dy = from.top  - to.top;
  const sx = from.width  / to.width;
  const sy = from.height / to.height;

  return element.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: '12px' },
    { transform: 'translate(0, 0) scale(1)', borderRadius: '0px' },
  ], {
    duration,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    fill: 'forwards',
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

/**
 * Throttle a function
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      return fn(...args);
    }
  };
}

/**
 * Wait for a number of milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Render a list of tag strings into tag pill HTML
 * @param {string[]} tags
 * @returns {string} HTML string
 */
export function renderTags(tags = []) {
  return tags.map(t => `<span class="tag">${t}</span>`).join('');
}
