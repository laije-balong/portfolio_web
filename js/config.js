/**
 * config.js — Configuration centralisée de GnoLab.
 *
 * En développement, l'API tourne sur localhost:3001.
 * En production, on change juste cette ligne et tout le frontend suit.
 *
 * Usage dans n'importe quelle page :
 *   import { API_URL } from '../config.js';
 *   const data = await fetch(`${API_URL}/projects`);
 */

const DEV  = 'http://localhost:3001';
const PROD = 'https://api.gnolab.dev';   // à activer lors du déploiement Railway
const FRONTEND_URL = 'http://localhost:55781'; // à activer lors du déploiement Railway

export const API_URL = DEV;
export const FRONTEND_API_URL = FRONTEND_URL;