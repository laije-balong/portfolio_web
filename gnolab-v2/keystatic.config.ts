import { config, fields, collection } from '@keystatic/core';

/* ============================================================================
   Keystatic — interface web d'édition (route /keystatic).
   Écrit du Markdoc (.mdoc) directement dans src/content/, versionné par Git.
   Mode local : édite les fichiers du dépôt pendant `astro dev`.
   ========================================================================== */

const livrable = fields.object({
  type: fields.select({
    label: 'Type',
    options: [
      { label: 'Code source (GitHub)', value: 'github' },
      { label: 'Document PDF', value: 'pdf' },
      { label: 'Diagramme BPMN', value: 'bpmn' },
      { label: 'Dashboard Power BI', value: 'powerbi' },
      { label: 'Présentation', value: 'slides' },
      { label: 'Démo live', value: 'demo' },
      { label: 'Document', value: 'document' },
    ],
    defaultValue: 'github',
  }),
  url: fields.url({ label: 'URL' }),
  label: fields.text({ label: 'Libellé' }),
});

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'GnoLab' },
  },
  collections: {
    projets: collection({
      label: 'Projets',
      slugField: 'titre',
      path: 'src/content/projets/*',
      format: { contentField: 'content' },
      schema: {
        titre: fields.slug({ name: { label: 'Titre' } }),
        resume: fields.text({ label: 'Résumé', multiline: true }),
        domaine: fields.select({
          label: 'Domaine',
          options: [
            { label: 'Ingénierie Systèmes', value: 'Systèmes' },
            { label: 'Data & ML', value: 'Data-ML' },
            { label: 'Business Analysis', value: 'Business-Analysis' },
            { label: 'Sécurité', value: 'Sécurité' },
            { label: 'Architecture', value: 'Architecture' },
            { label: 'Mathématiques', value: 'Maths' },
          ],
          defaultValue: 'Systèmes',
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Projet / repo', value: 'repo' },
            { label: 'Étude de cas', value: 'etude-de-cas' },
            { label: 'Dashboard', value: 'dashboard' },
            { label: 'Document', value: 'document' },
            { label: 'Analyse', value: 'analyse' },
          ],
          defaultValue: 'repo',
        }),
        track: fields.select({
          label: 'Track (optionnel)',
          options: [
            { label: '—', value: '' },
            { label: 'A — OS & Kernel', value: 'A' },
            { label: 'B — Data & MLOps', value: 'B' },
            { label: 'C — Architecture', value: 'C' },
            { label: 'D — Maths', value: 'D' },
            { label: 'E — Leadership', value: 'E' },
            { label: 'F — Sécurité', value: 'F' },
          ],
          defaultValue: '',
        }),
        niveau: fields.text({ label: 'Niveau' }),
        statut: fields.select({
          label: 'Statut',
          options: [
            { label: 'Planifié', value: 'planifié' },
            { label: 'En cours', value: 'en-cours' },
            { label: 'Terminé', value: 'terminé' },
          ],
          defaultValue: 'planifié',
        }),
        phase: fields.integer({ label: 'Phase (1-3)' }),
        dateDebut: fields.date({ label: 'Date de début' }),
        dateFin: fields.date({ label: 'Date de fin (optionnel)' }),
        technos: fields.array(fields.text({ label: 'Techno' }), {
          label: 'Technos', itemLabel: (p) => p.value,
        }),
        methodes: fields.array(fields.text({ label: 'Méthode' }), {
          label: 'Méthodes (BA)', itemLabel: (p) => p.value,
        }),
        livrables: fields.array(livrable, {
          label: 'Livrables', itemLabel: (p) => p.fields.label.value || p.fields.type.value,
        }),
        featured: fields.checkbox({ label: 'Mis en avant (accueil)' }),
        ordre: fields.integer({ label: 'Ordre', defaultValue: 0 }),
        content: fields.markdoc({ label: 'Contenu' }),
      },
    }),

    articles: collection({
      label: 'Articles',
      slugField: 'titre',
      path: 'src/content/articles/*',
      format: { contentField: 'content' },
      schema: {
        titre: fields.slug({ name: { label: 'Titre' } }),
        resume: fields.text({ label: 'Résumé', multiline: true }),
        date: fields.date({ label: 'Date' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags', itemLabel: (p) => p.value,
        }),
        tempsLecture: fields.integer({ label: 'Temps de lecture (min)', defaultValue: 5 }),
        projetLie: fields.text({ label: 'Slug du projet lié (optionnel)' }),
        publie: fields.checkbox({ label: 'Publié', defaultValue: true }),
        content: fields.markdoc({ label: 'Contenu' }),
      },
    }),

    certifications: collection({
      label: 'Certifications',
      slugField: 'nom',
      path: 'src/content/certifications/*',
      format: { contentField: 'content' },
      schema: {
        nom: fields.slug({ name: { label: 'Nom' } }),
        organisme: fields.text({ label: 'Organisme' }),
        domaine: fields.text({ label: 'Domaine (sert de regroupement, ex. « Data & Analyse »)' }),
        niveau: fields.text({ label: 'Niveau (optionnel, ex. « Associate »)' }),
        // Preuves de vérification — autant que voulu, source au choix
        preuves: fields.array(
          fields.object({
            source: fields.select({
              label: 'Source de vérification',
              options: [
                { label: 'Credly', value: 'credly' },
                { label: 'Coursera', value: 'coursera' },
                { label: 'Google Drive', value: 'drive' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: "Site de l'organisme", value: 'organisme' },
                { label: 'Autre', value: 'autre' },
              ],
              defaultValue: 'credly',
            }),
            url: fields.url({ label: 'Lien de vérification' }),
            label: fields.text({ label: 'Libellé personnalisé (optionnel)' }),
          }),
          {
            label: 'Preuves de vérification',
            itemLabel: (p) => p.fields.label.value || p.fields.source.value,
          }
        ),
        badge: fields.image({
          label: 'Badge / image (optionnel)',
          directory: 'public/certifications',
          publicPath: '/certifications/',
        }),
        fichier: fields.file({
          label: 'Fichier du certificat — PDF/image (optionnel)',
          directory: 'public/certifications/fichiers',
          publicPath: '/certifications/fichiers/',
        }),
        date: fields.date({ label: "Date d'obtention" }),
        ordre: fields.integer({ label: 'Ordre (dans son domaine, croissant)', defaultValue: 0 }),
        content: fields.markdoc({ label: 'Description' }),
      },
    }),

    jalons: collection({
      label: 'Parcours (jalons)',
      slugField: 'titre',
      path: 'src/content/jalons/*',
      format: { contentField: 'content' },
      schema: {
        titre: fields.slug({ name: { label: 'Titre du jalon' } }),
        resume: fields.text({ label: 'Résumé', multiline: true }),
        date: fields.date({ label: 'Date' }),
        piste: fields.select({
          label: 'Piste',
          options: [
            { label: 'Ingénierie Systèmes', value: 'systemes' },
            { label: 'Business Analysis', value: 'business' },
            { label: 'Transverse (formation, certif…)', value: 'transverse' },
          ],
          defaultValue: 'transverse',
        }),
        phase: fields.text({ label: 'Phase (optionnel, ex. « M1–M6 »)' }),
        encours: fields.checkbox({ label: 'Jalon en cours', defaultValue: false }),
        ordre: fields.integer({ label: 'Ordre (si même date)', defaultValue: 0 }),
        content: fields.markdoc({ label: 'Détails (optionnel)' }),
      },
    }),
  },
});
