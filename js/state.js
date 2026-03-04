/* ============================================================
   GnoLab State — Minimal reactive store
   ============================================================ */

/**
 * Creates a minimal reactive store.
 * Usage:
 *   store.get('theme')
 *   store.set('theme', 'dark')
 *   const unsub = store.on('theme', val => console.log(val))
 */
function createStore(initial = {}) {
  const state = { ...initial };
  const listeners = {};    // key -> Set<Function>
  const wildcards = new Set(); // listeners for any change

  return {
    /**
     * Get current value of a key
     * @param {string} key
     */
    get(key) {
      return state[key];
    },

    /**
     * Get the full state snapshot
     * @returns {Object}
     */
    getAll() {
      return { ...state };
    },

    /**
     * Set a value and notify listeners
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
      const prev = state[key];
      if (prev === value) return; // no change
      state[key] = value;
      listeners[key]?.forEach(fn => fn(value, prev));
      wildcards.forEach(fn => fn(key, value, prev));
    },

    /**
     * Subscribe to a specific key
     * @param {string} key
     * @param {Function} fn  called with (newVal, prevVal)
     * @returns {Function} unsubscribe
     */
    on(key, fn) {
      if (!listeners[key]) listeners[key] = new Set();
      listeners[key].add(fn);
      return () => listeners[key].delete(fn);
    },

    /**
     * Subscribe to any change
     * @param {Function} fn  called with (key, newVal, prevVal)
     * @returns {Function} unsubscribe
     */
    onAny(fn) {
      wildcards.add(fn);
      return () => wildcards.delete(fn);
    },
  };
}

/* ── Singleton app store ── */
const store = createStore({
  theme:        'dark',     // 'dark' | 'light'
  currentRoute: '/',        // current path
  projects:     [],         // loaded project data
  isLoading:    false,      // global loading state
  flipSource:   null,       // DOMRect for FLIP transition
});

export default store;
