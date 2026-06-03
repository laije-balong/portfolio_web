import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* Livrable polymorphe : un projet peut pointer vers du code, un PDF (BRD),
   un diagramme BPMN, un dashboard Power BI, une présentation, une démo… */
const livrable = z.object({
  type: z.enum(['github', 'pdf', 'bpmn', 'powerbi', 'slides', 'demo', 'document']),
  url: z.string(),
  label: z.string(),
});

const projets = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/projets' }),
  schema: z.object({
    titre: z.string(),
    resume: z.string(),
    domaine: z.enum([
      'Systèmes', 'Data-ML', 'Business-Analysis', 'Sécurité', 'Architecture', 'Maths',
    ]),
    type: z.enum(['repo', 'etude-de-cas', 'dashboard', 'document', 'analyse']),
    // tolère la chaîne vide écrite par Keystatic → undefined
    track: z.enum(['A', 'B', 'C', 'D', 'E', 'F']).or(z.literal('')).nullish()
      .transform((v) => (v ? v : undefined)),
    niveau: z.string().nullish().transform((v) => v || undefined),
    statut: z.enum(['planifié', 'en-cours', 'terminé']),
    phase: z.number().nullish().transform((v) => v ?? undefined),
    dateDebut: z.coerce.date(),
    dateFin: z.coerce.date().nullish().transform((v) => v ?? undefined),
    technos: z.array(z.string()).default([]),
    methodes: z.array(z.string()).default([]),
    livrables: z.array(livrable).default([]),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    ordre: z.number().default(0),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/articles' }),
  schema: z.object({
    titre: z.string(),
    resume: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    tempsLecture: z.number().default(5),
    projetLie: z.string().optional(),
    cover: z.string().optional(),
    publie: z.boolean().default(true),
  }),
});

/* Preuve de vérification d'une certification : Credly, Coursera, Drive… */
const preuve = z.object({
  source: z
    .enum(['credly', 'coursera', 'drive', 'linkedin', 'organisme', 'autre'])
    .default('autre'),
  url: z.string(),
  label: z.string().nullish().transform((v) => v || undefined),
});

const certifications = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/certifications' }),
  schema: z.object({
    nom: z.string(),
    organisme: z.string(),
    domaine: z.string(),
    niveau: z.string().nullish().transform((v) => v || undefined),
    // Plusieurs preuves possibles (source au choix). Voir aussi credlyUrl (legacy).
    preuves: z.array(preuve).default([]),
    // ⚠️ Ancien champ gardé pour compatibilité. Préférer `preuves`.
    credlyUrl: z.string().nullish().transform((v) => v || undefined),
    badge: z.string().nullish().transform((v) => v || undefined),
    // Fichier du certificat (PDF/image) téléversé dans le dépôt (public/).
    fichier: z.string().nullish().transform((v) => v || undefined),
    date: z.coerce.date().optional(),
    ordre: z.number().default(0),
    // Projets liés (0..N) : slugs de la collection « projets ». Un projet peut
    // être adossé à plusieurs certifs et inversement (relation N..N). Slug
    // orphelin ignoré à l'affichage (tolérance, comme le reste du schéma).
    projets: z.array(z.string()).default([]),
  }),
});

/* Jalons du parcours : timeline éditable à la main (formations, phases,
   étapes clés…), indépendante des projets. Double piste Systèmes / BA. */
const jalons = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/jalons' }),
  schema: z.object({
    titre: z.string(),
    resume: z.string(),
    date: z.coerce.date(),
    piste: z.enum(['systemes', 'business', 'transverse']).default('transverse'),
    phase: z.string().nullish().transform((v) => v || undefined),
    encours: z.boolean().default(false),
    ordre: z.number().default(0),
    // Projets liés (0..N) : slugs de la collection « projets ». Un slug
    // orphelin est ignoré à l'affichage (tolérance, comme le reste du schéma).
    projets: z.array(z.string()).default([]),
  }),
});

export const collections = { projets, articles, certifications, jalons };
