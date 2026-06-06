#!/usr/bin/env node
/* ============================================================================
   optimize-images.mjs — compresse les images de public/ devenues trop lourdes.

   Pourquoi : une image brute (badge, photo de profil, capture) fait souvent
   plusieurs centaines de Ko à plusieurs Mo, alors qu'elle est affichée petite.
   Ce script la redimensionne + la recompresse SUR PLACE (même nom de fichier,
   donc aucune référence cassée dans Keystatic ou les pages).

   Usage :
     npm run images           # compresse tout ce qui dépasse les seuils
     npm run images -- --force  # recompresse même les images déjà légères

   Idempotent : une image déjà optimisée est ignorée (sauf --force), donc tu
   peux le lancer autant de fois que tu veux. À lancer en LOCAL avant de
   committer — il ne tourne pas sur Netlify (pas de coût de build/crédits).
   ============================================================================ */

import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOT = 'public';
// Dimension max (px) du plus grand côté. 512 suffit largement pour des badges,
// avatars et vignettes affichés au plus à ~256px (même en écran retina 2×).
const MAX_DIM = 512;
// Seuil de poids (Ko) au-delà duquel une image est retraitée.
const MAX_KB = 60;
const FORCE = process.argv.includes('--force');
const EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/** Parcourt récursivement un dossier et renvoie tous les chemins de fichiers. */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const p = join(dir, e.name);
      return e.isDirectory() ? walk(p) : [p];
    })
  );
  return files.flat();
}

let totalBefore = 0;
let totalAfter = 0;
let optimized = 0;

const all = await walk(ROOT);
for (const file of all) {
  const ext = extname(file).toLowerCase();
  if (!EXT.has(ext)) continue;

  const { size } = await stat(file);
  const kb = size / 1024;

  // Vérifie aussi les dimensions : une image légère mais immense est retraitée.
  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  const tooBig = (meta.width ?? 0) > MAX_DIM || (meta.height ?? 0) > MAX_DIM;

  if (!FORCE && kb <= MAX_KB && !tooBig) continue;

  let pipeline = sharp(input).resize(MAX_DIM, MAX_DIM, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Recompresse dans le format d'origine, en gardant la transparence des PNG.
  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, quality: 80, palette: true });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 80 });
  } else {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  }

  const out = await pipeline.toBuffer();

  // Ne réécrit que si on gagne réellement de la place (évite de gonfler un
  // fichier déjà optimal).
  if (out.length < input.length || FORCE) {
    await writeFile(file, out);
    totalBefore += input.length;
    totalAfter += out.length;
    optimized++;
    console.log(
      `  ✓ ${file}  ${(input.length / 1024).toFixed(1)} Ko → ${(out.length / 1024).toFixed(1)} Ko`
    );
  }
}

if (optimized === 0) {
  console.log('Aucune image à optimiser. Tout est déjà léger. 👍');
} else {
  const saved = (totalBefore - totalAfter) / 1024;
  console.log(
    `\n${optimized} image(s) optimisée(s) — ${saved.toFixed(0)} Ko économisés ` +
      `(${(totalBefore / 1024).toFixed(0)} → ${(totalAfter / 1024).toFixed(0)} Ko).`
  );
}
