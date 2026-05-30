// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://gnolab.dev',
  // Site statique par défaut ; les routes d'admin Keystatic sont rendues
  // à la demande (prerender:false) → l'adapter node permet au build de passer.
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    // Sitemap : exclut le styleguide interne /design et les images OG générées
    sitemap({ filter: (page) => !page.includes('/design') && !page.includes('/og/') }),
  ],
});
