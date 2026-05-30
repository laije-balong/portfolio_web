# CLAUDE.md — Portfolio GnoLab v2

Instructions pour Claude Code (et tout agent IA) travaillant dans ce dépôt.
Lis-le en entier avant de modifier quoi que ce soit.

## Le projet en une phrase

Portfolio de **BALONG Laije Belthassar (GnoLab)** : un site **statique Astro 6**,
en **français**, ciblant un public 100 % technique international, mettant en avant
une **double trajectoire à parts égales — Ingénierie Systèmes ET Business Analysis**.

## Contexte repo / branches (IMPORTANT)

- Ce dossier `gnolab-v2/` est la **refonte v2**, elle vit sur la branche **`v2-astro`**.
- L'ancien site (SPA vanilla + `gnolab-api/` Express/SQLite) est **intact sur `main`** — ne pas y toucher.
- `gnolab-v2/` n'existe **que** sur `v2-astro`. Travaille toujours sur cette branche.

## Stack

- **Astro 6** (`output: 'static'`), adapter Node (standalone) uniquement pour que
  les routes admin Keystatic passent au build. Le site public reste statique.
- **React 19** pour les îlots interactifs (ex. système de particules du Hero).
- **Keystatic** (`/keystatic`, mode local) = CMS Git. Édite les `.mdoc` du dépôt.
- **Markdoc** (`@astrojs/markdoc`) pour le contenu.
- **Pas de base de données, pas de backend public.** Surface d'attaque nulle = voulu.

## Architecture

```
src/
├── content/            # Le contenu = fichiers .mdoc (Git as CMS)
│   ├── projets/        # ~60 projets, remplis par l'utilisateur petit à petit
│   ├── articles/       # billets de blog
│   ├── certifications/ # certifications (regroupées par domaine)
│   └── jalons/         # jalons de la page /parcours (timeline éditable)
├── content.config.ts   # schémas Zod (validation au build) — SOURCE DE VÉRITÉ des données
├── pages/              # routes Astro
├── components/         # ui/, cards/, layout/
├── layouts/            # Base.astro
├── lib/taxonomy.ts     # libellés/couleurs des domaines, statuts, pistes, tracks
├── scripts/            # particles/ + utils/ (système de particules SVG = mini data-viz)
└── styles/             # tokens.css (design tokens), base.css, particles.css
keystatic.config.ts     # formulaires d'édition — DOIT rester aligné avec content.config.ts
```

## Règles d'or

1. **Deux schémas à garder synchronisés.** Toute donnée de contenu est définie à
   DEUX endroits qui doivent concorder :
   - `src/content.config.ts` (Zod) = validation + types pour Astro.
   - `keystatic.config.ts` = formulaire d'édition.
   Si tu ajoutes/changes un champ, **modifie les deux** (sinon Keystatic écrit un
   champ que Zod rejette, ou inversement). Les `select` Keystatic doivent matcher
   les `z.enum` Zod.

2. **Tolérance Keystatic.** Keystatic écrit souvent `""` ou des champs vides plutôt
   qu'absents. Côté Zod, suis le motif déjà en place :
   `z.enum([...]).or(z.literal('')).nullish().transform(v => v || undefined)`.
   Ne casse pas cette tolérance.

3. **La taxonomie est centralisée** dans `src/lib/taxonomy.ts` (domaines, statuts,
   pistes, tracks, livrables). Réutilise-la dans les pages/composants au lieu de
   redéfinir des libellés/couleurs en dur.

4. **Design tokens uniquement.** Pas de couleurs/espacements en dur dans les `.astro` :
   utilise les variables CSS de `src/styles/tokens.css` (`var(--c-...)`, `var(--sp-...)`,
   `var(--fs-...)`, `var(--radius-...)`). Thème « labo systèmes » dark, accent cyan
   `#22e3b8`, une couleur par domaine.

5. **Français** pour tout le contenu et l'UI visible.

6. **Accessibilité & perf** : respecter `prefers-reduced-motion` (déjà fait pour les
   particules), images en `loading="lazy"`, cleanup des îlots client sur navigation.

7. **Pages dev-only.** `src/pages/design.astro` (styleguide) est masqué en prod via
   `if (import.meta.env.PROD) return Astro.redirect('/404')` + exclu du sitemap
   (filtre dans `astro.config.mjs`) + non lié dans la nav. Même motif pour toute
   page interne à ne pas exposer publiquement.

## Contenu : voir GUIDE-CONTENU.md

Le détail des champs de chaque collection (projets, articles, certifications, jalons)
et la façon d'ajouter/modifier/supprimer est dans **`GUIDE-CONTENU.md`**. Si tu
modifies un schéma, **mets ce guide à jour** en même temps.

## Commandes

```sh
npm install      # une fois (node >= 22.12)
npm run dev      # dev + /keystatic sur http://localhost:4321
npm run build    # build statique → dist/ (échoue si un contenu viole un schéma)
npm run preview  # prévisualiser le build
```

## Quand tu modifies le code, pense à mettre à jour

- **`GUIDE-CONTENU.md`** si tu changes un schéma de contenu.
- **`README.md`** si tu changes la structure, les commandes ou le déploiement.
- La **mémoire** `portfolio-v2-astro.md` (hors repo, côté Claude) pour l'état d'avancement.
- Vérifie toujours avec `npm run build` avant de conclure.

## Reste à faire (feuille de route)

- Migrer le vrai contenu : ~60 projets, ~14 certifications, billets (par l'utilisateur).
- Enrichir `/parcours` : phases M1→M24, double piste — la collection `jalons` est prête.
- OG images.
- Déploiement statique + CI (Cloudflare/Netlify).
- Porter au besoin les MiniChart/charts d'état des projets depuis `main`.
