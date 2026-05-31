import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../lib/site';

/* Flux RSS du blog — /rss.xml. Reprend les articles publiés, triés du plus
   récent au plus ancien. Le titre/description du site viennent de lib/site.ts. */
export async function GET(context: APIContext) {
  const articles = (await getCollection('articles'))
    .filter((a) => a.data.publie)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: `${site.brand} — Blog`,
    description: 'Notes techniques : ingénierie systèmes, data et business analysis.',
    // URL absolue du site (fournie par Astro via `site:` dans astro.config.mjs).
    site: context.site ?? site.url,
    items: articles.map((a) => ({
      title: a.data.titre,
      description: a.data.resume,
      pubDate: a.data.date,
      link: `/blog/${a.id}/`,
      categories: a.data.tags,
    })),
    customData: '<language>fr-fr</language>',
  });
}
