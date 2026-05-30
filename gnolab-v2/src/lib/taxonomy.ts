/* ============================================================================
   Taxonomie GnoLab — source unique pour libellés, couleurs et icônes.
   Utilisée par les composants (badges, filtres, cartes) ET par Keystatic.
   ========================================================================== */

export type Domaine =
  | 'Systèmes'
  | 'Data-ML'
  | 'Business-Analysis'
  | 'Sécurité'
  | 'Architecture'
  | 'Maths';

export type Statut = 'planifié' | 'en-cours' | 'terminé';
export type Track = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type LivrableType =
  | 'github' | 'pdf' | 'bpmn' | 'powerbi' | 'slides' | 'demo' | 'document';

export const DOMAINES: Record<Domaine, { label: string; color: string; abbr: string }> = {
  'Systèmes':          { label: 'Ingénierie Systèmes', color: 'var(--c-systemes)',     abbr: 'SYS' },
  'Data-ML':           { label: 'Data & ML',           color: 'var(--c-data-ml)',      abbr: 'DATA' },
  'Business-Analysis': { label: 'Business Analysis',    color: 'var(--c-business)',     abbr: 'BA' },
  'Sécurité':          { label: 'Sécurité',             color: 'var(--c-securite)',     abbr: 'SEC' },
  'Architecture':      { label: 'Architecture',         color: 'var(--c-architecture)', abbr: 'ARCH' },
  'Maths':             { label: 'Mathématiques',        color: 'var(--c-maths)',        abbr: 'MATH' },
};

export const STATUTS: Record<Statut, { label: string; color: string }> = {
  'planifié': { label: 'Planifié', color: 'var(--c-status-planned)' },
  'en-cours': { label: 'En cours', color: 'var(--c-status-progress)' },
  'terminé':  { label: 'Terminé',  color: 'var(--c-status-done)' },
};

export const LIVRABLES: Record<LivrableType, { label: string }> = {
  github:   { label: 'Code source' },
  pdf:      { label: 'Document PDF' },
  bpmn:     { label: 'Diagramme BPMN' },
  powerbi:  { label: 'Dashboard Power BI' },
  slides:   { label: 'Présentation' },
  demo:     { label: 'Démo live' },
  document: { label: 'Document' },
};

/* Pistes du parcours (page /parcours) : la double trajectoire Systèmes / BA,
   plus une piste « transverse » pour les jalons communs (formations, certifs…). */
export type Piste = 'systemes' | 'business' | 'transverse';

export const PISTES: Record<Piste, { label: string; color: string }> = {
  systemes:   { label: 'Ingénierie Systèmes', color: 'var(--c-systemes)' },
  business:   { label: 'Business Analysis',    color: 'var(--c-business)' },
  transverse: { label: 'Transverse',           color: 'var(--c-accent)' },
};

export const pisteColor = (p: Piste) => PISTES[p]?.color ?? 'var(--c-accent)';

export const TRACKS: Record<Track, string> = {
  A: 'OS & Kernel',
  B: 'Data Engineering & MLOps',
  C: 'Architecture & Systèmes distribués',
  D: 'Mathématiques avancées',
  E: 'Leadership & Open Source',
  F: 'Sécurité & Infrastructure',
};

export const domaineColor = (d: Domaine) => DOMAINES[d]?.color ?? 'var(--c-accent)';
export const statutColor = (s: Statut) => STATUTS[s]?.color ?? 'var(--c-text-faint)';

/** Liste ordonnée des domaines pour les filtres. */
export const DOMAINE_LIST = Object.keys(DOMAINES) as Domaine[];
