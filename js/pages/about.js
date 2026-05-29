/* ============================================================
   GnoLab — About Page
   Scan beam photo · Stats animées · Pills certifiables · Bio
   ============================================================ */

import router from '../router.js';
import { $, setHTML } from '../utils/dom.js';

/* ── Stats animées hors service pour l'instant ────────────────*/
const STATS = [
  { value: 3,   suffix: '+', label: 'Années\nd\'expérience',    color: '#00D9FF' },
  { value: 20,  suffix: '+', label: 'Projets\nconstruits',       color: '#8b5cf6' },
  { value: 150, suffix: '+', label: 'Apprenants\nformés',        color: '#10b981' },
  { value: 8,   suffix: '+', label: 'Technologies\nmaîtrisées',  color: '#f59e0b' },
];


/* ── Stack technique
   cert : URL certificat vérifiable — null si pas de certif    */
const STACK = [
  { label: 'Python',      color: '#3b82f6', cert: 'https://coursera.org/verify/ton-id-python' },
  { label: 'JavaScript',  color: '#f59e0b', cert: null },
  { label: 'HTML · CSS',  color: '#ef4444', cert: null },
  { label: 'SQL',         color: '#0074D9', cert: 'https://coursera.org/verify/ton-id-python' },
  { label: 'Linux · CLI', color: '#10b981', cert: null },
  { label: 'Git',         color: '#f97316', cert: null },
  { label: 'Node.js',     color: '#84cc16', cert: null },
  { label: 'Réseaux',     color: '#a78bfa', cert: null },
];

const ICONS = {
  arrow:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  cert:     `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
};

/* ── Pills de compétences ──────────────────────────────────── */
function rendreStack() {
  return STACK.map(s => {
    if (s.cert) {
      return `<a href="${s.cert}" target="_blank" rel="noopener noreferrer"
        class="ab-pill ab-pill--cert"
        style="--pill-color:${s.color}"
        title="Voir le certificat ${s.label}"
        aria-label="${s.label} — certifié, voir le certificat">
        <span class="ab-pill-dot" style="background:${s.color}"></span>
        ${s.label}
        <span class="ab-pill-cert-ico" aria-hidden="true">${ICONS.cert}</span>
      </a>`;
    }
    return `<span class="ab-pill" style="--pill-color:${s.color}">
      <span class="ab-pill-dot" style="background:${s.color}"></span>
      ${s.label}
    </span>`;
  }).join('');
}

/* ── Fallback avatar SVG ───────────────────────────────────── */
function buildAvatarSVG() {
  return `
    <svg viewBox="0 0 280 340" xmlns="http://www.w3.org/2000/svg" class="ab-photo-img">
      <rect width="280" height="340" fill="#0b1220"/>
      <circle cx="140" cy="130" r="70" fill="#071022" stroke="#00D9FF" stroke-width="1.5" opacity="0.6"/>
      <path d="M50 340 Q50 240 140 220 Q230 240 230 340Z" fill="#071022" stroke="#00D9FF" stroke-width="1" opacity="0.6"/>
      <circle cx="140" cy="120" r="38" fill="#0074D9" opacity="0.2"/>
      <text x="140" y="138" text-anchor="middle"
        font-size="38" fill="#00D9FF" opacity="0.4" font-family="Syne,sans-serif">BLB</text>
      ${Array.from({length:7}, (_, r) => Array.from({length:5}, (_, c) =>
        `<rect x="${c*56}" y="${r*48}" width="54" height="46" fill="none"
          stroke="rgba(0,217,255,0.03)" stroke-width="0.5"/>`
      ).join('')).join('')}
    </svg>
  `;
}

/* ── Construction du HTML ──────────────────────────────────── */
function buildHTML() {
  return `
    <div class="ab-page">

      <!-- ── Hero split ── -->
      <div class="ab-hero">
        <div class="container ab-hero-inner">

          <!-- Photo colonne gauche -->
          <div class="ab-photo-col">
            <div class="ab-photo-wrap">

              <div class="ab-frame ab-frame--tl"></div>
              <div class="ab-frame ab-frame--br"></div>
              <div class="ab-scan-line"></div>

              <div class="ab-photo" id="ab-photo">
                <img
                  src="/assets/images/profile.jpeg"
                  alt="Photo de profil — BALONG Laije Belthassar"
                  class="ab-photo-img"
                />
              </div>

              <!-- Scan beam CSS pur au hover — pas de filtre SVG -->
              <div class="ab-scan-beam" aria-hidden="true"></div>

              <div class="ab-status-badge">
                <span class="ab-status-dot"></span>
                Disponible
              </div>

              <div class="ab-pixel-grid" aria-hidden="true"></div>
            </div>
          </div>

          <!-- Bio colonne droite -->
          <div class="ab-bio-col">
            <div class="ab-tag">// profil.json</div>
            <h1 class="ab-name">
              <span class="ab-name-first">BALONG</span><br>
              <span class="ab-name-last gradient-text">Laije Belthassar</span>
            </h1>
            <p class="ab-role">Développeur · Formateur en Informatique</p>

            <p class="ab-bio">
              Je construis des systèmes qui fonctionnent et j'apprends aux autres
              à en faire de même. Du script au pipeline, du tutoriel au projet complet —
              ce qui m'anime, c'est de transformer une idée abstraite
              en quelque chose de <em>tangible et utile.</em>
            </p>

            <p class="ab-bio" style="margin-top:12px;">
              Basé à Brazzaville. Formateur en informatique parce que comprendre
              vraiment quelque chose, c'est savoir l'expliquer simplement.
              Curieux des systèmes, du code et de ce qu'ils révèlent sur la façon de penser.
            </p>

            <div class="ab-ctas">
              <button class="ab-btn ab-btn--primary" id="ab-btn-projects">
                Voir les projets ${ICONS.arrow}
              </button>
              <a class="ab-btn ab-btn--secondary" href="/assets/cv.pdf"
                 download aria-label="Télécharger le CV">
                ${ICONS.download} CV
              </a>
            </div>

            <!-- Terminal snippet -->
            <div class="ab-terminal">
              <div class="ab-term-bar">
                <span></span><span></span><span></span>
                <span class="ab-term-title">profil.py</span>
              </div>
              <div class="ab-term-body">
                <p><span class="ab-t-comm"># profile.init()</span></p>
                <p><span class="ab-t-var">role</span>    = <span class="ab-t-str">"dev &amp; formateur"</span></p>
                <p><span class="ab-t-var">mindset</span> = <span class="ab-t-str">"construire → comprendre → transmettre"</span></p>
                <p>&nbsp;</p>
                <p><span class="ab-t-kw">def</span> <span class="ab-t-fn">résoudre</span>(problème):</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ab-t-kw">return</span> <span class="ab-t-fn">code</span> + <span class="ab-t-fn">pédagogie</span></p>
                <p><span class="ab-t-var">disponible</span> = <span class="ab-t-kw">True</span> <span class="ab-t-comm"># ← maintenant</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Stats animées ── 
      <div class="ab-stats-section">
        <div class="container">
          <div class="ab-stats-grid">
            ${STATS.map((s, i) => `
              <div class="ab-stat" data-target="${s.value}" data-suffix="${s.suffix}"
                   style="--sc:${s.color}">
                <div class="ab-stat-val">
                  <span class="ab-stat-num" data-i="${i}">0</span><span class="ab-stat-suf">${s.suffix}</span>
                </div>
                <div class="ab-stat-label">${s.label.replace('\n', '<br>')}</div>
                <div class="ab-stat-bar">
                  <div class="ab-stat-fill" style="width:0%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      -->

      <!-- ── Stack & Technologies ── -->
      <div class="ab-stack-section">
        <div class="container">
          <div class="ab-section-label">Stack technique</div>
          <h3 class="ab-section-title">Stack &amp; Technologies</h3>
          <div class="ab-stack-pills">
            ${rendreStack()}
          </div>
        </div>
      </div>

    </div>
  `;
}

/* ── Compteur animé ──────────────────────────────────────────── 
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const raf = (ts) => {
    const p     = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(raf);
    else el.textContent = target;
  };
  requestAnimationFrame(raf);
}
*/

/* ── Module principal ────────────────────────────────────────── */
export async function mount(container) {
  setHTML(container, buildHTML());
  document.title = 'À propos · GnoLab — Développeur & Formateur';

  /* Fallback avatar si l'image ne charge pas */
  const photoEl = container.querySelector('#ab-photo');
  const imgEl   = photoEl?.querySelector('img');
  if (imgEl) {
    imgEl.addEventListener('error', () => {
      photoEl.innerHTML = buildAvatarSVG();
    }, { once: true });
  }

  /* Navigation */
  const btnProjects = container.querySelector('#ab-btn-projects');
  const onProjects  = () => router.push('/projects');
  btnProjects?.addEventListener('click', onProjects);

  /* IntersectionObserver — anime les stats au scroll */
  const statsSection = container.querySelector('.ab-stats-section');
  let statsAnimated  = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target !== statsSection || statsAnimated) return;
      statsAnimated = true;
      container.querySelectorAll('.ab-stat').forEach((el, i) => {
        const target = parseInt(el.dataset.target);
        const numEl  = el.querySelector('.ab-stat-num');
        const fillEl = el.querySelector('.ab-stat-fill');
        setTimeout(() => {
          animateCounter(numEl, target, 1000);
          if (fillEl) {
            fillEl.style.transition = 'width 1000ms cubic-bezier(0.2,0.8,0.2,1)';
            fillEl.style.width      = '100%';
          }
        }, i * 120);
      });
    });
  }, { threshold: 0.25 });

  if (statsSection) observer.observe(statsSection);

  return {
    destroy() {
      btnProjects?.removeEventListener('click', onProjects);
      observer.disconnect();
    },
  };
}