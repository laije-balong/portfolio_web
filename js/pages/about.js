/* ============================================================
   GnoLab — About Page
   Photo avec effet glitch/pixel + couleurs thème
   Stats animées au scroll, compétences, bio
   ============================================================ */

import router from '../router.js';
import { $, setHTML } from '../utils/dom.js';
import { uid } from '../utils/math.js';

// ── Stats animées ──────────────────────────────────────────────
const STATS = [
  { value: 5,   suffix: '+',  label: 'Années\nd\'expérience', color: '#00D9FF' },
  { value: 23,  suffix: '',   label: 'Projets\nlivrés',       color: '#8b5cf6' },
  { value: 340, suffix: 'k€', label: 'Économies\ngénérées',   color: '#10b981' },
  { value: 91,  suffix: '%',  label: 'Précision\nmoyenne',    color: '#f59e0b' },
];

// ── Stack technique
// cert : URL vers le certificat (Coursera, Google, etc.) — null si pas de certif
const STACK = [
  { label: 'Python',      color: '#3b82f6', cert: 'https://coursera.org/verify/ton-id-python' },
  { label: 'SQL',         color: '#0074D9', cert: null },
  { label: 'Pandas',      color: '#8b5cf6', cert: null },
  { label: 'Scikit-learn',color: '#10b981', cert: null },
  { label: 'Power BI',    color: '#f59e0b', cert: 'https://learn.microsoft.com/fr-fr/certifications/' },
  { label: 'D3.js',       color: '#00D9FF', cert: null },
  { label: 'XGBoost',     color: '#ef4444', cert: null },
  { label: 'FastAPI',     color: '#a78bfa', cert: null },
];

const ICONS = {
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

// ── Defs SVG pour la teinte cyan subtile (pas de flou) ───────
// Le glitch visuel est géré entièrement en CSS (slices + clip-path)
// pour ne pas altérer la lisibilité du visage
function buildGlitchFilter(fid) {
  return `
    <svg width="0" height="0" style="position:absolute;pointer-events:none;" aria-hidden="true">
      <defs>
        <filter id="${fid}" x="0" y="0" width="100%" height="100%">
          <!-- Légère teinte cyan qui s'active au hover via CSS class -->
          <!-- Appliqué uniquement pendant is-glitching -->
        </filter>
      </defs>
    </svg>
  `;
}

function buildHTML(pid) {
  const fid = `glitch-${pid}`;

  return `
    <div class="ab-page">
      ${buildGlitchFilter(fid)}

      <!-- ── Hero split ── -->
      <div class="ab-hero">
        <div class="container ab-hero-inner">

          <!-- Photo colonne gauche -->
          <div class="ab-photo-col">
            <div class="ab-photo-wrap">

              <!-- Glitch frame décoratif -->
              <div class="ab-frame ab-frame--tl"></div>
              <div class="ab-frame ab-frame--br"></div>
              <div class="ab-scan-line"></div>

              <!-- Photo (placeholder SVG si pas d'image) -->
              <div class="ab-photo" id="ab-photo">
                <img
                  src="/assets/images/profile.jpg"
                  alt="Photo de profil"
                  class="ab-photo-img"
                  style="filter:none"
                  onerror="this.parentElement.innerHTML=buildAvatarSVG('${fid}')"
                />
              </div>

              <!-- Glitch slices (CSS animation) -->
              <div class="ab-glitch-slice ab-glitch-slice--1"></div>
              <div class="ab-glitch-slice ab-glitch-slice--2"></div>
              <div class="ab-glitch-slice ab-glitch-slice--3"></div>

              <!-- Status badge -->
              <div class="ab-status-badge">
                <span class="ab-status-dot"></span>
                Disponible
              </div>

              <!-- Pixel grid overlay -->
              <div class="ab-pixel-grid" aria-hidden="true"></div>
            </div>
          </div>

          <!-- Bio colonne droite -->
          <div class="ab-bio-col">
            <div class="ab-tag">// profil.json</div>
            <h1 class="ab-name">
              <span class="ab-name-first">Votre</span><br>
              <span class="ab-name-last gradient-text">Prénom Nom</span>
            </h1>
            <p class="ab-role">Data Analyst · Explorateur de données</p>

            <p class="ab-bio">
              Je transforme le chaos des données brutes en décisions actionnables.
              Cinq ans à construire des pipelines, des modèles, des dashboards —
              et toujours cette même question : <em>qu'est-ce que les données
              essaient vraiment de dire ?</em>
            </p>

            <p class="ab-bio" style="margin-top:12px;">
              Basé à Paris. Curieux de tout. Passionné par les intersections entre
              statistiques, design et impact business réel.
            </p>

            <!-- CTA buttons -->
            <div class="ab-ctas">
              <button class="ab-btn ab-btn--primary" id="ab-btn-projects">
                Voir les projets
                ${ICONS.arrow}
              </button>
              <a class="ab-btn ab-btn--secondary" href="/assets/cv.pdf"
                 download aria-label="Télécharger le CV">
                ${ICONS.download}
                CV
              </a>
            </div>

            <!-- Terminal snippet -->
            <div class="ab-terminal">
              <div class="ab-term-bar">
                <span></span><span></span><span></span>
                <span class="ab-term-title">skills.py</span>
              </div>
              <div class="ab-term-body">
                <p><span class="ab-t-kw">import</span> <span class="ab-t-mod">pandas</span> <span class="ab-t-kw">as</span> <span class="ab-t-mod">pd</span></p>
                <p><span class="ab-t-kw">from</span> <span class="ab-t-mod">sklearn</span> <span class="ab-t-kw">import</span> <span class="ab-t-fn">everything</span></p>
                <p>&nbsp;</p>
                <p><span class="ab-t-comm"># Ce qui me motive</span></p>
                <p><span class="ab-t-var">mission</span> = <span class="ab-t-str">"données → impact"</span></p>
                <p><span class="ab-t-var">disponible</span> = <span class="ab-t-kw">True</span> <span class="ab-t-comm"># ← maintenant</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Stats ── -->
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

      <!-- ── Stack technique ── -->
      <div class="ab-stack-section">
        <div class="container">
          <div class="ab-section-label">Stack technique</div>
          <h3 class="ab-section-title">Outils & Maîtrise</h3>

          <div class="ab-stack-pills">
            ${STACK.map(s => {
              const icoCert = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>`;
              if (s.cert) {
                return `<a href="${s.cert}" target="_blank" rel="noopener noreferrer"
                  class="ab-pill ab-pill--cert"
                  style="--pill-color:${s.color}"
                  title="Voir le certificat ${s.label}"
                  aria-label="${s.label} — certifié, voir le certificat">
                  <span class="ab-pill-dot" style="background:${s.color}"></span>
                  ${s.label}
                  <span class="ab-pill-cert-ico" aria-hidden="true">${icoCert}</span>
                </a>`;
              }
              return `<span class="ab-pill" style="--pill-color:${s.color}">
                <span class="ab-pill-dot" style="background:${s.color}"></span>
                ${s.label}
              </span>`;
            }).join('')}
          </div>
        </div>
      </div>

    </div>
  `;
}

// Fallback SVG avatar si pas de photo
function buildAvatarSVGString(fid) {
  return `
    <svg viewBox="0 0 280 380" xmlns="http://www.w3.org/2000/svg"
      class="ab-photo-img" style="filter:none">
      <rect width="280" height="380" fill="#0b1220"/>
      <circle cx="140" cy="140" r="70" fill="#071022" stroke="#00D9FF" stroke-width="1.5" opacity="0.6"/>
      <path d="M60 380 Q60 260 140 240 Q220 260 220 380Z" fill="#071022" stroke="#00D9FF" stroke-width="1" opacity="0.6"/>
      <circle cx="140" cy="130" r="38" fill="#0074D9" opacity="0.25"/>
      <text x="140" y="148" text-anchor="middle"
        font-size="42" fill="#00D9FF" opacity="0.5" font-family="Syne,sans-serif">?</text>
      <!-- Grid pattern -->
      ${Array.from({length:8}, (_, r) => Array.from({length:6}, (_, c) =>
        `<rect x="${c*48}" y="${r*48}" width="46" height="46" fill="none"
          stroke="rgba(0,217,255,0.04)" stroke-width="0.5"/>`
      ).join('')).join('')}
    </svg>
  `;
}

// ── Counter animation ──────────────────────────────────────────
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const raf = (ts) => {
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(raf);
    else el.textContent = target;
  };
  requestAnimationFrame(raf);
}

// animateSkill supprimée — plus de barres de pourcentage

export async function mount(container) {
  const pid = uid('ab');
  setHTML(container, buildHTML(pid));
  document.title = 'À propos · GnoLab';

  // Fix avatar on image error
  const photoEl = container.querySelector('#ab-photo');
  const imgEl   = photoEl?.querySelector('img');
  if (imgEl) {
    imgEl.onerror = () => {
      photoEl.innerHTML = buildAvatarSVGString(`glitch-${pid}`);
    };
  }

  // ── Navigation ──
  const btnProjects = container.querySelector('#ab-btn-projects');
  const onProjects  = () => router.push('/projects');
  btnProjects?.addEventListener('click', onProjects);

  // ── Intersection Observer for stats + skills ──
  const statsSection = container.querySelector('.ab-stats-section');
  const stackSection = container.querySelector('.ab-stack-section');
  let statsAnimated  = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Stats
      if (entry.target === statsSection && !statsAnimated) {
        statsAnimated = true;
        const statEls = container.querySelectorAll('.ab-stat');
        statEls.forEach((el, i) => {
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
      }

      // Stack → pills statiques, pas d'animation de barre
    });
  }, { threshold: 0.25 });

  if (statsSection) observer.observe(statsSection);
  if (stackSection) observer.observe(stackSection);

  // ── Glitch trigger on hover ──
  const photoWrap = container.querySelector('.ab-photo-wrap');
  let glitchTimer;
  const triggerGlitch = () => {
    photoWrap?.classList.add('is-glitching');
    clearTimeout(glitchTimer);
    glitchTimer = setTimeout(() => {
      photoWrap?.classList.remove('is-glitching');
    }, 600);
  };
  photoWrap?.addEventListener('mouseenter', triggerGlitch);
  // Auto-glitch every ~7s
  const autoGlitch = setInterval(triggerGlitch, 7000);

  return {
    destroy() {
      btnProjects?.removeEventListener('click', onProjects);
      photoWrap?.removeEventListener('mouseenter', triggerGlitch);
      observer.disconnect();
      clearInterval(autoGlitch);
      clearTimeout(glitchTimer);
    },
  };
}