/* ============================================================
   GnoLab — Contact Page (rewrite)
   ============================================================ */

import router from '../router.js';
import { $, setHTML } from '../utils/dom.js';

const ICONS = {
  mail:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  github:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/></svg>`,
  linkedin:`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  arrow:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  send:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>`,
  check:   `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  loader:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
};

const SOCIALS = [
  { label: 'GitHub',   icon: ICONS.github,   href: 'https://github.com/',     color: '#f1f5f9' },
  { label: 'LinkedIn', icon: ICONS.linkedin, href: 'https://linkedin.com/',   color: '#0ea5e9' },
  { label: 'Email',    icon: ICONS.mail,     href: 'mailto:hello@gnolab.dev', color: '#00D9FF' },
];

function buildHTML() {
  return `
    <div class="ct-page">

      <div class="ct-header">
        <div class="container">
          <div class="ct-page-label">Contact</div>
          <h2 class="ct-title">Travaillons ensemble</h2>
          <p class="ct-subtitle">Un projet, une question, ou juste envie d'echanger, je reponds sous 24h.</p>
        </div>
      </div>

      <div class="container ct-body">

        <div class="ct-form-col">
          <div class="ct-card">

            <div class="ct-card-bar">
              <span class="ct-dots">
                <span></span><span></span><span></span>
              </span>
              <span class="ct-filename">nouveau_message.txt</span>
              <span class="ct-live"><span class="ct-live-dot"></span>live</span>
            </div>

            <div class="ct-form" id="ct-form">
              <div class="ct-row-2">
                <div class="ct-field">
                  <label class="ct-label" for="cf-name">Nom</label>
                  <input class="ct-input" id="cf-name" type="text" placeholder="Ada Lovelace">
                </div>
                <div class="ct-field">
                  <label class="ct-label" for="cf-email">Email</label>
                  <input class="ct-input" id="cf-email" type="email" placeholder="ada@example.com">
                </div>
              </div>

              <div class="ct-field">
                <label class="ct-label" for="cf-subject">Sujet</label>
                <input class="ct-input" id="cf-subject" type="text" placeholder="Projet / Collaboration / Autre">
              </div>

              <div class="ct-field">
                <label class="ct-label" for="cf-message">Message</label>
                <textarea class="ct-input ct-textarea" id="cf-message" placeholder="Decrivez votre projet ou votre question…" rows="5"></textarea>
              </div>

              <div class="ct-form-footer">
                <span class="ct-hint"><span class="ct-hint-dot"></span>Reponse sous 24h</span>
                <button class="ct-submit" id="ct-submit">${ICONS.send} Envoyer</button>
              </div>
            </div>

            <div class="ct-success" id="ct-success">
              <div class="ct-success-icon">${ICONS.check}</div>
              <h4>Message envoye !</h4>
              <p>Je vous reponds dans les meilleurs delais.</p>
            </div>

          </div>
        </div>

        <aside class="ct-aside">

          <div class="ct-block">
            <h4 class="ct-block-title">Disponibilites</h4>
            <div class="ct-avail">
              <span class="ct-avail-dot"></span>
              Disponible pour missions freelance
            </div>
            <p class="ct-info-text">
              Specialite : analyse exploratoire, modeles predictifs, dashboards BI, pipelines ETL.
              Secteurs : industrie, e-commerce, RH, energie.
            </p>
          </div>

          <div class="ct-block">
            <p class="ct-label" style="margin-bottom:16px">Retrouvez-moi sur</p>
            ${SOCIALS.map(s => `
              <a class="ct-social" href="${s.href}" target="_blank" rel="noopener noreferrer" style="--sc:${s.color}">
                <span class="ct-social-icon">${s.icon}</span>
                <span class="ct-social-name">${s.label}</span>
                <span class="ct-social-arr">${ICONS.arrow}</span>
              </a>
            `).join('')}
          </div>

          <div class="ct-quote">
            <p class="ct-quote-tag">// mission.txt</p>
            <p class="ct-quote-text">« Transformer des donnees brutes en avantage competitif mesurable. »</p>
          </div>

        </aside>
      </div>
    </div>
  `;
}

function validate(container) {
  const name    = container.querySelector('#cf-name');
  const email   = container.querySelector('#cf-email');
  const message = container.querySelector('#cf-message');
  let ok = true;
  [name, email, message].forEach(el => el?.classList.remove('ct-input--error'));
  if (!name?.value.trim())         { name?.classList.add('ct-input--error');    ok = false; }
  if (!email?.value.includes('@')) { email?.classList.add('ct-input--error');   ok = false; }
  if (!message?.value.trim())      { message?.classList.add('ct-input--error'); ok = false; }
  return ok;
}

export async function mount(container) {
  setHTML(container, buildHTML());
  document.title = 'Contact · GnoLab';

  const form      = container.querySelector('#ct-form');
  const success   = container.querySelector('#ct-success');
  const submitBtn = container.querySelector('#ct-submit');

  const onSubmit = async () => {
    if (!validate(container)) return;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="ct-spin">${ICONS.loader}</span> Envoi…`;
    await new Promise(r => setTimeout(r, 1200));
    form.style.display    = 'none';
    success.style.display = 'flex';
  };

  submitBtn?.addEventListener('click', onSubmit);

  const onKey = (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') onSubmit();
  };
  container.addEventListener('keydown', onKey);

  return {
    destroy() {
      submitBtn?.removeEventListener('click', onSubmit);
      container.removeEventListener('keydown', onKey);
    },
  };
}