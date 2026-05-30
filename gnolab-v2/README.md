# Portfolio GnoLab — v2

Portfolio personnel de **BALONG Laije Belthassar (GnoLab)**.
Site **statique**, en **français**, mettant en avant une double trajectoire :
**Ingénierie Systèmes** et **Business Analysis**.

> Refonte v2 (branche `v2-astro`). L'ancien site reste intact sur `main`.

## 🧱 Stack

- **[Astro 6](https://astro.build)** — sortie statique, zéro backend public.
- **React 19** — îlots interactifs (système de particules du Hero).
- **[Keystatic](https://keystatic.com)** — CMS Git : édition du contenu via une
  interface web (`/keystatic`), qui écrit des fichiers Markdoc dans le dépôt.
- **Markdoc** — format de contenu (`.mdoc`).
- **Aucune base de données.** Tout le contenu est versionné dans `src/content/`.

## 🚀 Démarrage

Prérequis : **Node ≥ 22.12**.

```sh
npm install
npm run dev      # site + éditeur sur http://localhost:4321
```

- Site : http://localhost:4321
- Éditeur de contenu (Keystatic) : http://localhost:4321/keystatic

## 🧞 Commandes

| Commande          | Action                                            |
| ----------------- | ------------------------------------------------- |
| `npm install`     | Installe les dépendances                          |
| `npm run dev`     | Serveur de dev + Keystatic (`localhost:4321`)     |
| `npm run build`   | Build statique vers `./dist/` (valide le contenu) |
| `npm run preview` | Prévisualise le build                             |

## ✍️ Modifier le contenu

Projets, articles, certifications et jalons du parcours se gèrent **sans toucher
au code**. Tout est expliqué dans **[GUIDE-CONTENU.md](./GUIDE-CONTENU.md)** :
ajout, modification, suppression, et la liste des champs de chaque type.

En résumé : `npm run dev` → http://localhost:4321/keystatic → on remplit des
formulaires → `git commit` + `git push`.

## 📂 Structure

```
src/
├── content/            # contenu (.mdoc) : projets / articles / certifications / jalons
├── content.config.ts   # schémas de validation (Zod)
├── pages/              # routes : /, /projets, /blog, /certifications, /parcours, /a-propos, /design
├── components/         # ui/, cards/, layout/
├── layouts/            # Base.astro
├── lib/taxonomy.ts     # libellés, couleurs, pistes, tracks
├── scripts/            # système de particules (mini data-viz SVG)
└── styles/             # tokens.css (design tokens), base.css, particles.css
keystatic.config.ts     # formulaires d'édition Keystatic
CLAUDE.md               # conventions de dev (pour l'IA et les contributeurs)
GUIDE-CONTENU.md        # guide d'édition du contenu
```

## 📄 Pages

Accueil · `/projets` (filtres + détail) · `/blog` (+ article) · `/certifications`
· `/parcours` (timeline de jalons) · `/a-propos`.

> `/design` est un **styleguide interne** : accessible uniquement en local
> (`npm run dev`), masqué en production (redirige vers 404, hors sitemap).

## 🚧 Feuille de route

- [ ] Migrer le contenu : ~60 projets, ~14 certifications, billets de blog.
- [ ] Enrichir `/parcours` : phases M1→M24, double piste (collection `jalons` prête).
- [ ] Images Open Graph (partage social).
- [ ] Déploiement statique + CI (Cloudflare Pages / Netlify).

## 📜 Licence

Projet personnel — © BALONG Laije Belthassar (GnoLab).
