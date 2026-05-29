/* ============================================================
   MiniChart — Controller
   Manages which chart is active, handles transitions between
   raw / cleaned / results states with crossfade
   ============================================================ */

import { RawChart }     from './RawChart.js';
import { CleanedChart } from './CleanedChart.js';
import { ResultsChart } from './ResultsChart.js';
import { uid }          from '../utils/math.js';

const TRANSITION_MS = 200;

/**
 * @param {HTMLElement} container  the .visual-card__canvas element
 * @param {Object}      project    project data object
 * @returns {{ switchTo(state: string): void, destroy(): void }}
 */
export function MiniChart(container, project) {
  const pid          = uid('mc');
  let currentState   = null;
  let currentChart   = null;
  let isTransitioning = false;

  // ── Build a chart for a given state ──────────────────────────
  function buildChart(state) {
    switch (state) {
      case 'raw':     return RawChart(pid + '-r');
      case 'cleaned': return CleanedChart(pid + '-c');
      case 'results': return ResultsChart(pid + '-res', project);
      default:        return RawChart(pid + '-r');
    }
  }

  // ── Mount initial chart ───────────────────────────────────────
  function mountChart(state, animate = false) {
    const chart = buildChart(state);

    // Style the SVG wrapper
    chart.el.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transition: opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease;
      opacity: ${animate ? '0' : '1'};
      transform: ${animate ? 'scale(0.97)' : 'scale(1)'};
    `;

    container.style.position = 'relative';
    container.appendChild(chart.el);
    chart.start();

    if (animate) {
      // Trigger reflow then fade in
      chart.el.getBoundingClientRect();
      chart.el.style.opacity   = '1';
      chart.el.style.transform = 'scale(1)';
    }

    return chart;
  }

  // ── Switch to a new state ─────────────────────────────────────
  function switchTo(newState) {
    if (newState === currentState || isTransitioning) return;
    isTransitioning = true;

    const oldChart = currentChart;
    const oldEl    = oldChart?.el;

    // Fade out old
    if (oldEl) {
      oldEl.style.opacity   = '0';
      oldEl.style.transform = 'scale(1.03)';
    }

    setTimeout(() => {
      // Stop & remove old
      if (oldChart) {
        oldChart.stop();
        oldEl?.remove();
      }

      // Mount new
      currentState = newState;
      currentChart = mountChart(newState, true);
      isTransitioning = false;
    }, TRANSITION_MS);
  }

  // ── Init with 'raw' state ─────────────────────────────────────
  currentState = 'raw';
  currentChart = mountChart('raw', false);

  // ── Destroy ───────────────────────────────────────────────────
  function destroy() {
    currentChart?.stop();
    currentChart?.el?.remove();
    currentChart = null;
    currentState = null;
  }

  return { switchTo, destroy };
}