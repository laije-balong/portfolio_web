/* ============================================================================
   Configuration centrale du site — SOURCE UNIQUE pour l'identité, le contact
   et les liens sociaux. Édite UNIQUEMENT ce fichier pour mettre à jour ces infos
   partout (page /a-propos, footer, meta Open Graph…).
   ⚠️ Les valeurs marquées « À VÉRIFIER » sont des suppositions : confirme-les.
   ========================================================================== */

export const site = {
  /** Domaine de production (sert aux URLs absolues OG). */
  url: 'https://gnolab-portfolio.netlify.app/',
  /** Nom de marque court. */
  brand: 'GnoLab',
  /** Identité affichée. */
  author: 'BALONG Laije Belthassar',
  /** Titre/positionnement. */
  role: 'Ingénieur Systèmes & Business Analyst',
  /** Localisation. */
  location: 'Brazzaville, Congo',
  /** Phrase signature. */
  tagline: 'La machine et le besoin, dans la même tête.',
  /** Description par défaut (SEO + OG). */
  description:
    'Portfolio de BALONG Laije Belthassar : ingénierie systèmes et business analysis, projet par projet.',
  /** Image OG de repli. Les images OG sont générées par page
      (src/pages/og/[...slug].png.ts) ; ceci ne sert que de filet de sécurité. */
  ogImage: '/og/index.png',
};

/** Formulaire de contact (page /a-propos). Site statique → on passe par un
    service externe gratuit : Web3Forms (https://web3forms.com).
    1) Crée une « Access Key » gratuite (juste un email à confirmer).
    2) Colle-la ci-dessous. Tant que la clé n'est pas mise, le formulaire est
       masqué et seul le bouton email s'affiche. */
export const contactForm = {
  // ⚠️ À REMPLIR : ta clé Web3Forms (sinon le formulaire reste masqué)
  web3formsKey: '',
};

/** Vrai si une clé Web3Forms est configurée (→ on affiche le formulaire). */
export const contactFormEnabled = contactForm.web3formsKey.length > 0;

/** Moyens de contact affichés publiquement. Mets `show: false` pour masquer. */
export const contact = {
  email: {
    show: true,
    label: 'laijebalong@gmail.com', // À VÉRIFIER (email à exposer publiquement)
    href: 'mailto:laijebalong@gmail.com',
  },
  linkedin: {
    show: true,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/laije-belthassar-balong/', // À VÉRIFIER (URL réelle de ton profil)
  },
  github: {
    show: true,
    label: 'GitHub',
    href: 'https://github.com/laije-belthassar', // À VÉRIFIER
  },
  credly: {
    show: true,
    label: 'Credly',
    href: 'https://credly.com/users/laije-belthassar', // À VÉRIFIER
  },
};

/** Liste ordonnée des contacts actifs (helper pour les boucles). */
export const contactList = Object.entries(contact)
  .filter(([, c]) => c.show)
  .map(([key, c]) => ({ key, ...c }));
