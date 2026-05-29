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
  loader: glob({ pattern: '**/*.md', base: './src/content/projets' }),
  schema: z.object({
    titre: z.string(),
    resume: z.string(),
    domaine: z.enum([
      'Systèmes', 'Data-ML', 'Business-Analysis', 'Sécurité', 'Architecture', 'Maths',
    ]),
    type: z.enum(['repo', 'etude-de-cas', 'dashboard', 'document', 'analyse']),
    track: z.enum(['A', 'B', 'C', 'D', 'E', 'F']).optional(),
    niveau: z.string().optional(),
    statut: z.enum(['planifié', 'en-cours', 'terminé']),
    phase: z.number().optional(),
    dateDebut: z.coerce.date(),
    dateFin: z.coerce.date().optional(),
    technos: z.array(z.string()).default([]),
    methodes: z.array(z.string()).default([]),
    livrables: z.array(livrable).default([]),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    ordre: z.number().default(0),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
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

const certifications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/certifications' }),
  schema: z.object({
    nom: z.string(),
    organisme: z.string(),
    domaine: z.string(),
    credlyUrl: z.string().optional(),
    date: z.coerce.date().optional(),
    ordre: z.number().default(0),
  }),
});

export const collections = { projets, articles, certifications };
