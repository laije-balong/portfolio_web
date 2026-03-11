# Modifications frontend — Brancher sur l'API

3 fichiers à modifier. Chaque modification est localisée sur quelques lignes.

---

## 1. js/pages/gallery.js — ligne 235

**AVANT**
```javascript
const reponse = await fetch('/data/projects.json');
if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`);
const donnees = await reponse.json();
store.set('projects', donnees);
return donnees;
```

**APRÈS**
```javascript
const reponse = await fetch('http://localhost:3001/api/projects');
if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`);
const donnees = await reponse.json();
store.set('projects', donnees);
return donnees;
```

---

## 2. js/pages/home.js — ligne 421

**AVANT**
```javascript
const rep  = await fetch('/data/projects.json');
projets    = await rep.json();
```

**APRÈS**
```javascript
const rep  = await fetch('http://localhost:3001/api/projects');
projets    = await rep.json();
```

---

## 3. js/pages/project.js — ligne 87

La logique de cette fonction s'améliore avec l'API :
on peut directement demander le projet par son slug
au lieu de charger toute la liste.

**AVANT** (remplacer toute la fonction chargerProjet)
```javascript
async function chargerProjet(slug) {
  /* Chercher dans le cache du store en priorité */
  const cache = store.get('projects') || [];
  const trouve = cache.find(p => p.slug === slug);
  if (trouve) return trouve;

  /* Sinon charger depuis le JSON */
  const reponse = await fetch('/data/projects.json');
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
  const liste = await reponse.json();
  store.set('projects', liste);
  return liste.find(p => p.slug === slug) || null;
}
```

**APRÈS**
```javascript
async function chargerProjet(slug) {
  /* Chercher dans le cache du store en priorité */
  const cache = store.get('projects') || [];
  const trouve = cache.find(p => p.slug === slug);
  if (trouve) return trouve;

  /* Sinon appeler directement l'endpoint par slug */
  const reponse = await fetch(`http://localhost:3001/api/projects/${slug}`);
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
  return await reponse.json();
}
```

---

## Note sur l'URL de l'API

En développement local :  `http://localhost:3001`
En production (Railway) : `https://api.gnolab.dev` (à définir plus tard)

Pour éviter de changer les URLs à chaque déploiement,
tu pourras plus tard centraliser ça dans un fichier config :

```javascript
// js/config.js
export const API_URL = 'http://localhost:3001';
```

Et dans chaque page : `import { API_URL } from '../config.js';`
