# GnoLab — Synthèse complète du projet

> Portfolio Data Analyst — SPA vanilla HTML/CSS/JS  
> Construit en 5 sessions de développement

---

## 1. Ce qui est livré aujourd'hui

### Architecture générale

Site mono-page (SPA) sans framework, 100% vanilla JS ES modules.  
**44 fichiers · ~8 800 lignes de code · 0 dépendance externe.**

```
gnolab/
├── index.html                    ← Shell unique, router injecte les pages
├── css/                          ← 10 fichiers CSS, ~3 000 lignes
│   ├── variables.css             ← 84 tokens de design (couleurs, typo, spacing)
│   ├── base.css                  ← Reset + typographie + utilitaires globaux
│   ├── components.css            ← Header, project-card, gallery-grid
│   ├── animations.css            ← Keyframes uniquement (pageEnter/Exit, slideUp…)
│   ├── particles.css             ← SVG canvas des particules
│   ├── gallery.css               ← Filtres + cartes galerie avec badges
│   ├── pages.css                 ← Styles contact + sections partagées
│   ├── about.css                 ← Page à propos + glitch SVG photo
│   ├── mobile.css                ← Hamburger + drawer + breakpoints
│   └── polish.css                ← Composants visuels centraux + sections home
├── js/
│   ├── app.js                    ← Boot : thème, header, menu mobile, router
│   ├── router.js                 ← History API SPA, transitions page-enter/exit
│   ├── state.js                  ← Store réactif minimaliste (EventEmitter)
│   ├── pages/                    ← 6 pages (home, gallery, project, about, contact, 404)
│   ├── particles/                ← 7 fichiers (ParticleSystem + 5 mini-visualisations)
│   ├── charts/                   ← 4 fichiers (MiniChart + RawChart/CleanedChart/ResultsChart)
│   └── utils/                    ← 5 utilitaires (dom, math, flip, scroll-reveal, lightbox)
└── data/
    └── projects.json             ← 5 projets complets avec tous les champs
```

## 2. Fonctionnalités implémentées

### Navigation & Router
- SPA History API — navigation sans rechargement, bouton précédent/suivant natif
- Transitions de page : fade + translateY (enter 320ms / exit 180ms)
- État actif des liens nav mis à jour automatiquement à chaque route
- Menu hamburger mobile avec drawer latéral animé (cubic-bezier 380ms)
- Fermeture par Escape, clic backdrop, ou navigation
- `data-route` sur chaque lien → classe `.is-active` synchronisée desktop + mobile

### Page d'accueil (Home)
- **Hero plein écran** : 15 barres fantômes SVG animées en fond
- **Système de particules** : 45 desktop / 25 mobile, 5 types de mini-visualisations
- **Phases narratives** : chaos (0–3s) → analysis (3–11s) → clarity (11s+)
- **Section Stats** : 4 compteurs animés au scroll (ease-out-cubic, IntersectionObserver)
- **Aperçu projets** : 3 cartes extraites du JSON, cliquables, badges dynamiques
- **Section Compétences** : 4 domaines avec icônes
- **CTA final** : gradient + liens contact et à-propos

### Galerie « Le Mur de Preuves »
- Grille responsive 1/2/3 colonnes
- **Filtres combinables** : recherche texte + filtre par outil + filtre "Certifiés"
- Compteur de résultats en temps réel
- Cartes avec badge certifié (⭐ jaune), badge outil coloré, CTA au hover
- État vide animé si 0 résultat
- Skeleton loader pendant le fetch
- Transition FLIP sur clic (vignette → plein écran)

### Page Projet
- Layout split 2 colonnes (récit scrollable | visualisation sticky)
- 3 sections : Challenge · Solution · Preuves & Code
- 3 états de visualisation : Brut / Nettoyé / Résultats (crossfade 200ms)
- MiniChart interactif avec SVG animé par état
- **Lightbox certificat** : modal plein écran, image avec fallback, boutons télécharger/ouvrir
- Skeleton pendant le chargement, page 404 projet si slug introuvable

### Page À propos
- Photo SVG avec effet glitch animé (filtres SVG feTurbulence)
- Stats animées au scroll (IntersectionObserver)
- Barres de compétences avec animation de remplissage

### Page Contact
- Formulaire avec validation en direct (email, champs requis)
- Animation shake sur erreur
- État success après envoi (simulé)
- Liens sociaux (GitHub, LinkedIn, email)

### Système de particules (5 types)
| Type | Description |
|------|-------------|
| `DataBars` | Barres SVG pulsantes, fréquences indépendantes par barre |
| `TrendLine` | Courbe de tendance avec bezier cubique et flèche |
| `DonutChart` | Segments morphants avec rotation et cycle 4 000ms |
| `RadarChart` | 5 axes pulsant à des fréquences différentes |
| `NucleusCluster` | Noyau central + 4 satellites + connexions synaptiques |

### Utilitaires
- `scroll-reveal.js` — IntersectionObserver générique (fade-up/left/right/scale/blur + stagger)
- `lightbox.js` — modal image autonome, styles injectés dynamiquement
- `flip.js` — animation FLIP pour transition galerie→projet
- `dom.js` — helpers : `$`, `$$`, `setHTML`, `throttle`, `renderTags`
- `math.js` — `random`, `randomInt`, `clamp`, `lerp`, `uid`

---

## 3. Design Tokens (sélection)

| Token | Valeur |
|-------|--------|
| `--c-bg` | `#0f172a` (dark) / `#f8fafc` (light) |
| `--c-cyan` | `#00D9FF` |
| `--c-blue` | `#0074D9` |
| `--c-yellow` | `#f59e0b` |
| `--c-violet` | `#8b5cf6` |
| `--container-max` | `1280px` |
| `--header-h` | `64px` |
| `--ease-snap` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

---

## 4. Ce qui reste à faire — Feuille de route

### Priorité 1 — Contenu & Données
Ces éléments bloquent l'utilisation réelle du portfolio.

- **Images réelles** : couvrir chaque projet (`/assets/images/projects/*.jpg`)  
  Format recommandé : 800×480px, WebP + fallback JPG
- **Certificats** : images PNG/PDF dans `/assets/images/projects/certificates/`  
  Noms de fichiers actuellement attendus par le JSON :  
  `google_capstone.png` · `powerbi_cert.png` · `data_analyst.png`
- **Projets manquants** : `nlp-reviews` et `forecast-energy` n'ont pas encore  
  les champs `challenge`, `solution`, `proofs` dans le JSON — à compléter

### Priorité 2 — Fonctionnalités front restantes

**FLIP sur aperçu home → projet**  
Les `.apercu-card` cliquables de la home ne déclenchent pas encore l'animation FLIP  
(seules les cartes de la galerie le font). Ajouter l'appel `flip.capture()` avant navigation.

**Footer enrichi**  
Le footer actuel est minimal (3 liens). Ajouter :  
- Liens sociaux avec icônes SVG  
- Tagline courte  
- Mention "Construit sans framework"  
- Année mise à jour automatiquement

**Transition galerie → filtrage**  
Actuellement les cartes disparaissent/apparaissent sans animation lors d'un changement de filtre.  
Implémenter un crossfade ou un layout animation (FLIP sur la grille).

**État de chargement initial**  
Sur connexion lente, la galerie et la home affichent un flash blanc avant le JS.  
Ajouter `<noscript>` + skeleton HTML inline dans `index.html`.

### Priorité 3 — SEO & Performance

**Meta tags dynamiques**  
Le titre change par route mais pas la `<meta description>`.  
Dans chaque page, mettre à jour `document.querySelector('meta[name="description"]')`.

**Open Graph images**  
Créer une image OG statique (1200×630px) et l'ajouter dans `<head>`.

**`robots.txt` + `sitemap.xml`**  
Fichiers statiques à créer dans le dossier racine pour l'indexation.

**Fonts : Critical CSS**  
Ajouter `<link rel="preload">` sur les 2 fonts les plus utilisées (Syne Bold, DM Sans Regular)  
pour supprimer le FOUT au premier chargement.

**Images lazy**  
Ajouter `loading="lazy"` sur toutes les `<img>` hors de la zone visible initiale.

### Priorité 4 — Déploiement

**Choisir un hébergeur**

| Option | Avantages | Idéal pour |
|--------|-----------|------------|
| **Vercel** | Deploy en 1 commande, HTTPS auto, CDN mondial | Recommandé |
| **Netlify** | Drag & drop possible, formulaires natifs | Si contact form backend |
| **GitHub Pages** | Gratuit, intégration GitHub | Si pas de formulaire |
| **Cloudflare Pages** | Très rapide, genereux en free tier | Performance maximale |

**Configuration minimale pour SPA**  
Le router History API nécessite que toutes les URLs renvoient `index.html`.  
Fichier `vercel.json` à créer :
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Ou `_redirects` pour Netlify :
```
/*  /index.html  200
```

**Nom de domaine**  
Format recommandé : `gnolab.dev` ou `gno.dev` ou `[prenom]-data.fr`

### Priorité 5 — Fonctionnalités avancées (phase suivante)

**Formulaire contact fonctionnel**  
Actuellement le `setTimeout` simule l'envoi. Intégrer l'un des services :  
- **Formspree** (gratuit, 50 submissions/mois, zéro backend)  
- **EmailJS** (envoi direct depuis le JS, 200/mois gratuit)  
- Backend Express minimal sur Vercel (serverless function)

**PWA (Progressive Web App)**  
Ajouter `manifest.json` + service worker pour :  
- Installation sur mobile (icône sur l'écran d'accueil)  
- Cache des assets pour fonctionnement hors ligne  
- Notification "mise à jour disponible"

**Mode présentation**  
Une route `/slides` ou un mode plein écran qui présente les projets  
un par un pour une présentation client ou entretien.

**Analytics**  
Intégrer Plausible ou Fathom (privacy-first, léger, sans cookie banner)  
pour mesurer les pages les plus visitées.

**Blog / Notes techniques**  
Une section `/blog` avec articles Markdown (parser côté client ou pre-build)  
pour montrer la profondeur technique et améliorer le SEO organique.

---

## 5. Sessions de développement — Historique

| Session | Livraisons principales |
|---------|----------------------|
| **1–3** | Architecture SPA, Router, State, tous les composants particules (5 types), MiniChart (3 états), pages Home/Gallery/Project/About/Contact/404, FLIP transitions, effet glitch About |
| **4** | Filtres galerie (recherche + outils + certification), moteur ScrollReveal, redesign cartes avec badges dynamiques, commentaires français |
| **5** | Menu hamburger + drawer mobile, état actif nav, `app.js` + `router.js` réécrits en français, `mobile.css`, `polish.css` (composants centralisés) |
| **6** (actuelle) | Consolidation CSS (6 doublons éliminés), `lightbox.js`, home enrichie (5 sections : stats + aperçu + compétences + CTA), `animations.css` réécrit (keyframes seuls) |

---

## 6. Comment déployer maintenant

```bash
# 1. Copier le dossier sur votre machine (depuis les outputs)
# 2. Installer Vercel CLI
npm install -g vercel

# 3. Dans le dossier gnolab/
vercel

# 4. Créer vercel.json pour le routing SPA
echo '{"rewrites":[{"source":"/(.*)", "destination":"/index.html"}]}' > vercel.json

# 5. Redéployer
vercel --prod
```

Le site sera live en moins de 2 minutes.

---

*Document généré automatiquement — GnoLab v0.6 · Mars 2026*
