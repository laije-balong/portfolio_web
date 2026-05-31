import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { ogSvg, type OgData } from '../../lib/og-template';
import { site } from '../../lib/site';

/* Génère une image Open Graph (1200×630) par page, au build.
   URL résultante : /og/<slug>.png — ex. /og/index.png, /og/projets/mini-shell.png.
   Base.astro dérive automatiquement le bon slug depuis le chemin de la page. */

export const getStaticPaths: GetStaticPaths = async () => {
  const projets = await getCollection('projets');
  const articles = (await getCollection('articles')).filter((a) => a.data.publie);

  const pages: { slug: string; data: OgData }[] = [
    { slug: 'index',          data: { eyebrow: 'Portfolio',      title: site.author,     subtitle: site.role } },
    { slug: 'projets',        data: { eyebrow: 'Projets',        title: 'Projets',       subtitle: 'Ingénierie systèmes & business analysis' } },
    { slug: 'blog',           data: { eyebrow: 'Blog',           title: 'Publications',  subtitle: 'Notes techniques' } },
    { slug: 'certifications', data: { eyebrow: 'Certifications',  title: 'Certifications', subtitle: 'Preuves vérifiables sur Credly' } },
    { slug: 'parcours',       data: { eyebrow: 'Parcours',       title: 'Mon parcours',  subtitle: 'Trajectoire systèmes & business analysis' } },
    { slug: 'a-propos',       data: { eyebrow: 'À propos',       title: site.author,     subtitle: site.role } },
    { slug: 'uses',           data: { eyebrow: 'Uses',           title: 'Mon atelier',   subtitle: 'Matériel, environnement et outils du quotidien' } },
    ...projets.map((p) => ({
      slug: `projets/${p.id}`,
      data: { eyebrow: 'Projet', title: p.data.titre, subtitle: p.data.resume } as OgData,
    })),
    ...articles.map((a) => ({
      slug: `blog/${a.id}`,
      data: { eyebrow: 'Article', title: a.data.titre, subtitle: a.data.resume } as OgData,
    })),
  ];

  return pages.map((p) => ({ params: { slug: p.slug }, props: { data: p.data } }));
};

export const GET: APIRoute = async ({ props }) => {
  const { data } = props as { data: OgData };
  const png = await sharp(Buffer.from(ogSvg(data)), { density: 144 })
    .resize(1200, 630)
    .png()
    .toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
