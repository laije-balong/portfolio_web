# 📝 Guide de contenu — Portfolio GnoLab

Ce guide explique comment **ajouter, modifier et supprimer** le contenu du site
(projets, articles, certifications, jalons du parcours) **sans toucher au code**.

> Tu écris du **Markdown**, le design s'applique tout seul. Aucune base de données :
> chaque contenu est un fichier texte versionné par Git.

---

## 🚦 Deux façons de modifier le contenu

### 1. Keystatic (recommandé — interface web, zéro syntaxe)

```sh
npm run dev
```

Puis ouvre **http://localhost:4321/keystatic** dans le navigateur.

Tu y trouves 4 sections : **Projets**, **Articles**, **Certifications**, **Parcours (jalons)**.
Tu remplis des formulaires, Keystatic écrit les fichiers `.mdoc` à ta place dans
`src/content/`. Pour publier : tu fais ensuite un `git add` + `git commit` + `git push`.

> ⚠️ Keystatic fonctionne **uniquement quand `npm run dev` tourne**. Il édite les
> fichiers locaux du dépôt. Il n'est **pas** déployé sur le site public.

### 2. À la main (éditer directement les fichiers `.mdoc`)

Chaque contenu = un fichier dans `src/content/<collection>/`. Tu peux le créer/éditer
dans VS Code. La structure est toujours la même :

```markdown
---
champ1: "valeur"
champ2: 2026-05-30
---
Le corps en Markdown (le contenu rédigé de la page).
```

La partie entre les `---` s'appelle le **frontmatter** (les métadonnées).
Le reste, en dessous, est le **corps** affiché en belle typographie (`.prose`).

---

## 📂 Où vit chaque contenu

| Contenu        | Dossier                       | Page publique         |
| -------------- | ----------------------------- | --------------------- |
| Projets        | `src/content/projets/`        | `/projets`            |
| Articles       | `src/content/articles/`       | `/blog`               |
| Certifications | `src/content/certifications/` | `/certifications`     |
| Jalons (parcours) | `src/content/jalons/`      | `/parcours`           |

**Le nom du fichier devient l'URL** (le « slug »). Ex. `mini-shell.mdoc` →
`/projets/mini-shell`. Utilise des minuscules, des tirets, pas d'accents ni d'espaces.

---

## ➕ Ajouter · ✏️ Modifier · ❌ Supprimer (règle générale)

- **Ajouter** : crée un nouveau fichier `.mdoc` dans le bon dossier (ou « + » dans Keystatic).
- **Modifier** : édite le fichier existant.
- **Supprimer** : supprime le fichier (`rm`) ou via le bouton dans Keystatic.

Puis **toujours** :

```sh
git add -A && git commit -m "contenu: ..." && git push
```

---

## 1) 🛠️ Projets — `src/content/projets/`

> Les ~60 projets sont remplis petit à petit. Voici le modèle.

### Champs (frontmatter)

| Champ       | Obligatoire | Description |
| ----------- | :---------: | ----------- |
| `titre`     | ✅ | Titre affiché. |
| `resume`    | ✅ | 1–2 phrases (cartes + détail). |
| `domaine`   | ✅ | Un parmi : `Systèmes`, `Data-ML`, `Business-Analysis`, `Sécurité`, `Architecture`, `Maths`. |
| `type`      | ✅ | Un parmi : `repo`, `etude-de-cas`, `dashboard`, `document`, `analyse`. |
| `statut`    | ✅ | `planifié`, `en-cours` ou `terminé`. |
| `dateDebut` | ✅ | Format `AAAA-MM-JJ`. |
| `dateFin`   | ❌ | Idem, si terminé. |
| `track`     | ❌ | `A`–`F` (voir taxonomie) ou vide. |
| `niveau`    | ❌ | Texte libre (ex. « Avancé »). |
| `phase`     | ❌ | Nombre 1–3. |
| `technos`   | ❌ | Liste (C, Python, SQL…). |
| `methodes`  | ❌ | Liste (côté Business Analysis : BPMN, BRD…). |
| `livrables` | ❌ | Liste de liens typés (voir ci-dessous). |
| `featured`  | ❌ | `true` = mis en avant sur l'accueil. |
| `ordre`     | ❌ | Tri (petit = avant). |

### Livrables (polymorphes — c'est ce qui rend le profil BA possible)

Chaque livrable a un `type`, une `url`, un `label`. Types valides :
`github`, `pdf`, `bpmn`, `powerbi`, `slides`, `demo`, `document`.

### Exemple complet

```markdown
---
titre: "Mini-shell en C"
resume: "Un shell Unix minimaliste : parsing, pipes, redirections, gestion des processus."
domaine: "Systèmes"
type: "repo"
track: "A"
niveau: "Intermédiaire"
statut: "terminé"
phase: 1
dateDebut: 2026-02-01
dateFin: 2026-02-20
technos:
  - C
  - Make
methodes: []
livrables:
  - type: "github"
    url: "https://github.com/laije1/mini-shell"
    label: "Code source"
featured: true
ordre: 1
---
## Contexte
Reproduire le cœur d'un shell pour comprendre `fork`, `exec`, `wait` et les pipes.

## Ce que j'ai appris
- La gestion fine des descripteurs de fichiers…
```

---

## 2) ✍️ Articles (blog) — `src/content/articles/`

| Champ          | Obligatoire | Description |
| -------------- | :---------: | ----------- |
| `titre`        | ✅ | Titre de l'article. |
| `resume`       | ✅ | Accroche (listing + SEO). |
| `date`         | ✅ | `AAAA-MM-JJ`. |
| `tags`         | ❌ | Liste de mots-clés. |
| `tempsLecture` | ❌ | Minutes (défaut 5). |
| `projetLie`    | ❌ | Slug d'un projet (ex. `mini-shell`). |
| `publie`       | ❌ | `false` = brouillon caché (défaut `true`). |

### Exemple

```markdown
---
titre: "Comprendre malloc"
resume: "Comment un allocateur mémoire gère le tas, et pourquoi ça compte."
date: 2026-04-10
tags:
  - C
  - mémoire
tempsLecture: 8
projetLie: "memory-allocator-c"
publie: true
---
Le contenu de l'article en Markdown…
```

> 💡 Pour un **brouillon**, mets `publie: false` : il n'apparaît pas sur le site.

---

## 3) 🏅 Certifications — `src/content/certifications/`

| Champ       | Obligatoire | Description |
| ----------- | :---------: | ----------- |
| `nom`       | ✅ | Nom de la certification. |
| `organisme` | ✅ | Émetteur (Google, AWS…). |
| `domaine`   | ✅ | **Sert de regroupement** sur la page (les certifs du même `domaine` sont ensemble). Garde des libellés cohérents, ex. « Data & Analyse ». |
| `niveau`    | ❌ | Ex. « Associate », « Professional ». |
| `credlyUrl` | ❌ | Lien de vérification Credly. |
| `badge`     | ❌ | Image du badge. Via Keystatic : upload direct. À la main : place l'image dans `public/certifications/` et mets `badge: "/certifications/mon-badge.png"`. |
| `date`      | ❌ | Date d'obtention (`AAAA-MM-JJ`), l'année s'affiche. |
| `ordre`     | ❌ | Tri dans son domaine (croissant). |

### Exemple

```markdown
---
nom: "AWS Certified Cloud Practitioner"
organisme: "Amazon Web Services"
domaine: "Cloud & Infrastructure"
niveau: "Foundational"
credlyUrl: "https://credly.com/badges/xxxx"
badge: "/certifications/aws-ccp.png"
date: 2026-05-01
ordre: 1
---
Certification valant preuve des fondamentaux du cloud AWS : services, sécurité,
facturation, architecture de base.
```

> Le **regroupement par domaine** est automatique : crée un nouveau `domaine` et
> une nouvelle section apparaît sur `/certifications`.

---

## 4) 🧭 Parcours (jalons) — `src/content/jalons/`

C'est la **timeline** de la page `/parcours`. Chaque fichier = une étape.
Elle est **indépendante des projets** : tu y mets ce que tu veux (formations,
phases, étapes BA…), triée automatiquement par date.

| Champ     | Obligatoire | Description |
| --------- | :---------: | ----------- |
| `titre`   | ✅ | Titre du jalon. |
| `resume`  | ✅ | 1–2 phrases décrivant l'étape. |
| `date`    | ✅ | `AAAA-MM-JJ` — sert au tri chronologique. |
| `piste`   | ❌ | `systemes`, `business` ou `transverse` (défaut). Donne la couleur. |
| `phase`   | ❌ | Texte libre, ex. « M1–M6 », « M7–M12 ». |
| `encours` | ❌ | `true` affiche la mention « en cours ». |
| `ordre`   | ❌ | Départage deux jalons de même date. |

### Exemple

```markdown
---
titre: "Spécialisation MLOps"
resume: "Pipelines de données, suivi d'expériences et déploiement de modèles."
date: 2026-09-01
piste: systemes
phase: "M13–M18"
encours: false
ordre: 0
---
Détails optionnels du jalon, en Markdown.
```

---

## ✅ Vérifier avant de publier

```sh
npm run dev      # aperçu live sur http://localhost:4321
npm run build    # vérifie qu'il n'y a pas d'erreur de contenu
```

Si un champ obligatoire manque ou a une valeur invalide (ex. un `domaine` de projet
hors liste), **`npm run build` échoue avec un message clair** indiquant le fichier
fautif. C'est voulu : ça empêche de publier un contenu cassé.

---

## 👤 Tes infos perso, contact et identité — `src/lib/site.ts`

Ton **nom, rôle, localisation, tagline** et tes **liens de contact** (email,
LinkedIn, GitHub, Credly) ne sont **pas** du contenu Keystatic : ils sont centralisés
dans un seul fichier de config, **`src/lib/site.ts`**. Édite-le dans VS Code.

- Pour **changer une valeur** (ex. ton email) : modifie le champ correspondant.
- Pour **masquer un contact** : passe son `show: true` à `show: false`.
- ⚠️ Certaines valeurs sont marquées `// À VÉRIFIER` (email, URL LinkedIn…) :
  **vérifie-les**, ce sont des suppositions de départ.

La **page « À propos »** ([src/pages/a-propos.astro](src/pages/a-propos.astro))
contient ta **bio** : les paragraphes marqués `✏️` sont à personnaliser. Tu peux
aussi y mettre ta photo (ajoute `public/avatar.jpg` puis adapte le bloc avatar).

Les **images de partage** (aperçu sur LinkedIn/WhatsApp/X…) sont **générées
automatiquement par page** au build : chaque projet, article et page reçoit sa
propre image avec son titre. Rien à faire — c'est automatique. (Pour changer le
style commun, c'est `src/lib/og-template.ts`.)

### 💬 Activer le formulaire de contact

Le formulaire de la page « À propos » utilise **Web3Forms** (gratuit). Pour
l'activer :
1. Va sur https://web3forms.com → « Create Access Key » (saisis ton email, confirme).
2. Copie la clé reçue dans `src/lib/site.ts` → `contactForm.web3formsKey: 'TA_CLE'`.
3. Les messages arriveront sur l'email associé à la clé.

Tant que la clé est vide, le formulaire est **masqué** et seuls les liens de
contact (email, LinkedIn…) s'affichent — le site reste fonctionnel.

---

## 🆘 Rappels rapides

- Dates : toujours `AAAA-MM-JJ` (ex. `2026-05-30`).
- Nom de fichier = URL : minuscules, tirets, sans accents.
- Listes (`technos`, `tags`…) : un `- élément` par ligne.
- Texte avec `:` ou guillemets → mets toute la valeur entre `"guillemets"`.
- Après chaque changement : `git add -A && git commit -m "..." && git push`.
