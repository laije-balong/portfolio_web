// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// NB : l'intégration Keystatic (+ react + adapter node) sera ajoutée une fois
//      l'installation terminée et le design system validé.
export default defineConfig({
  site: 'https://gnolab.dev',
  integrations: [sitemap()],
});
