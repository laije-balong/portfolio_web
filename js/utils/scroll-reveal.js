/* ============================================================
   GnoLab — Moteur d'animations au scroll
   Utilise IntersectionObserver pour déclencher les entrées
   au fur et à mesure que les éléments deviennent visibles
   ============================================================ */

/**
 * Options par défaut de l'observateur
 * threshold : fraction visible avant déclenchement
 * rootMargin : zone tampon autour du viewport
 */
const OPTIONS_DEFAUT = {
  threshold:  0.12,
  rootMargin: '0px 0px -48px 0px',
};

/**
 * Délais de stagger pour les enfants d'une liste
 * Chaque enfant reçoit un délai progressif en ms
 */
const DELAI_STAGGER = 80;

/**
 * Crée un moteur ScrollReveal et l'attache au container donné.
 * Retourne une fonction destroy() pour nettoyer l'observer.
 *
 * Attributs HTML reconnus sur les éléments :
 *   data-reveal              → animation d'entrée basique
 *   data-reveal="fade-up"    → fondu + montée (défaut)
 *   data-reveal="fade-left"  → fondu + glissement depuis la droite
 *   data-reveal="fade-right" → fondu + glissement depuis la gauche
 *   data-reveal="scale"      → zoom d'entrée
 *   data-reveal="blur"       → flou → net
 *   data-stagger             → applique un délai progressif aux enfants directs
 *   data-delay="200"         → délai supplémentaire en ms
 *
 * @param {HTMLElement|Document} racine  — scope de recherche des éléments
 * @returns {{ destroy(): void, observer: IntersectionObserver }}
 */
export function ScrollReveal(racine = document) {

  /* Injecter les styles de base si pas déjà présents */
  if (!document.getElementById('scroll-reveal-styles')) {
    const style = document.createElement('style');
    style.id = 'scroll-reveal-styles';
    style.textContent = `
      /* État initial — invisible avant l'animation */
      [data-reveal] {
        opacity: 0;
        transition:
          opacity   550ms cubic-bezier(0.2, 0.8, 0.2, 1),
          transform 550ms cubic-bezier(0.2, 0.8, 0.2, 1),
          filter    550ms cubic-bezier(0.2, 0.8, 0.2, 1);
        will-change: opacity, transform;
      }

      /* Positions de départ selon le type d'animation */
      [data-reveal="fade-up"],
      [data-reveal=""] ,
      [data-reveal]            { transform: translateY(28px); }
      [data-reveal="fade-left"]  { transform: translateX(36px); }
      [data-reveal="fade-right"] { transform: translateX(-36px); }
      [data-reveal="scale"]    { transform: scale(0.92); }
      [data-reveal="blur"]     { transform: translateY(16px); filter: blur(8px); }

      /* État visible — déclenché par l'ajout de la classe 'revealed' */
      [data-reveal].revealed {
        opacity:   1;
        transform: none;
        filter:    none;
      }

      /* Réduction de mouvement — respecter les préférences utilisateur */
      @media (prefers-reduced-motion: reduce) {
        [data-reveal] {
          transition: opacity 300ms ease !important;
          transform:  none    !important;
          filter:     none    !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* Collecter tous les éléments à observer dans la racine */
  const elements = Array.from(racine.querySelectorAll('[data-reveal]'));

  /**
   * Déclenche l'animation visible sur un élément
   * @param {HTMLElement} el
   * @param {number} [delaiExtra=0]  délai additionnel en ms
   */
  function reveler(el, delaiExtra = 0) {
    const delaiBase  = parseInt(el.dataset.delay || '0', 10);
    const delaiTotal = delaiBase + delaiExtra;

    if (delaiTotal > 0) {
      setTimeout(() => el.classList.add('revealed'), delaiTotal);
    } else {
      /* Micro-délai pour laisser le navigateur peindre le state initial */
      requestAnimationFrame(() => el.classList.add('revealed'));
    }
  }

  /**
   * Gestion du stagger : si un parent a data-stagger,
   * ses enfants directs reçoivent des délais progressifs
   * @param {HTMLElement} parent
   */
  function revelerStagger(parent) {
    const enfants = Array.from(parent.children);
    enfants.forEach((enfant, index) => {
      const delaiBase = parseInt(parent.dataset.delay || '0', 10);
      setTimeout(() => {
        enfant.style.opacity   = '';
        enfant.style.transform = '';
        enfant.style.transition = `
          opacity   480ms cubic-bezier(0.2,0.8,0.2,1) ${index * DELAI_STAGGER}ms,
          transform 480ms cubic-bezier(0.2,0.8,0.2,1) ${index * DELAI_STAGGER}ms
        `;
        enfant.classList.add('revealed');
      }, delaiBase);
    });
  }

  /* Préparer les enfants stagger en les rendant invisibles */
  const parentsStagger = Array.from(racine.querySelectorAll('[data-stagger]'));
  parentsStagger.forEach(parent => {
    Array.from(parent.children).forEach(enfant => {
      enfant.style.opacity   = '0';
      enfant.style.transform = 'translateY(20px)';
    });
  });

  /* Créer l'IntersectionObserver */
  const observer = new IntersectionObserver((entrees) => {
    entrees.forEach(entree => {
      if (!entree.isIntersecting) return;

      const el = entree.target;

      /* Révéler l'élément */
      reveler(el);

      /* Si c'est un parent stagger, déclencher les enfants aussi */
      if (el.dataset.stagger !== undefined) {
        revelerStagger(el);
      }

      /* Ne plus observer une fois révélé */
      observer.unobserve(el);
    });
  }, OPTIONS_DEFAUT);

  /* Lancer l'observation sur chaque élément */
  elements.forEach(el => observer.observe(el));
  parentsStagger.forEach(el => {
    if (!el.hasAttribute('data-reveal')) observer.observe(el);
  });

  return {
    /**
     * Ajouter de nouveaux éléments dynamiquement à l'observation
     * (utile après un rendu asynchrone comme la galerie)
     * @param {HTMLElement} nouvelleRacine
     */
    observer,
    ajouterElements(nouvelleRacine) {
      const nouveaux = Array.from(nouvelleRacine.querySelectorAll('[data-reveal]'));
      nouveaux.forEach(el => observer.observe(el));
    },
    destroy() {
      observer.disconnect();
    },
  };
}