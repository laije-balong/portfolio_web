/* ============================================================================
   Configuration centrale du site SOURCE UNIQUE pour l'identité, le contact
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

/** CV téléchargeable. Dépose ton fichier dans `public/` (ex. public/cv.pdf)
    puis renseigne son chemin ci-dessous. Tant que `path` est vide, le bouton
    « Télécharger le CV » reste masqué (pas de lien 404). */
export const cv = {
  path: '', // ex. '/cv.pdf' (fichier placé dans public/cv.pdf)
  filename: 'CV-BALONG-Laije-Belthassar.pdf', // nom du fichier téléchargé
};

/** Vrai si un CV est configuré (→ on affiche le bouton de téléchargement). */
export const cvEnabled = cv.path.length > 0;

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
    label: 'laijebalong@gmail.com',
    href: 'mailto:laijebalong@gmail.com',
  },
  linkedin: {
    show: true,
    label: 'LinkedIn',
    href: 'www.linkedin.com/in/laije-belthassar-balong',
  },
  github: {
    show: true,
    label: 'GitHub',
    href: 'https://github.com/laije1', //
  },
  credly: {
    show: true,
    label: 'Credly',
    href: 'https://www.credly.com/users/laije-belthassar',
  },
};

/** Liste ordonnée des contacts actifs (helper pour les boucles). */
export const contactList = Object.entries(contact)
  .filter(([, c]) => c.show)
  .map(([key, c]) => ({ key, ...c }));
