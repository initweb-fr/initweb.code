/**
 * Gestion du thème — Suit uniquement la préférence du navigateur/OS
 *
 * Le thème est mis en cache dans localStorage pour éviter le flash
 * de mauvais thème lors des changements de page.
 */

import { STORAGE_KEY_THEME } from '$global/storageKeys';

// ===============================
// Configuration
// ===============================

// Classes CSS appliquées sur <body> pour activer le bon thème
const CSS_DARK = 'iw-theme-dark';
const CSS_LIGHT = 'iw-theme-light';

// ===============================
// Fonctions internes
// ===============================

/** Retourne la préférence de couleur de l'OS : 'dark' ou 'light' */
function getOSTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applique le thème sur le <body> et le mémorise dans localStorage */
function applyTheme(theme: 'dark' | 'light'): void {
  document.body.classList.remove(CSS_DARK, CSS_LIGHT);
  document.body.classList.add(theme === 'dark' ? CSS_DARK : CSS_LIGHT);
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise le thème en suivant uniquement la préférence OS/navigateur.
 *
 * Stratégie anti-flash entre les pages :
 *  1. On lit le thème en cache (localStorage) et on l'applique tout de suite
 *  2. On vérifie la vraie préférence OS et on corrige si elle a changé
 *  3. On écoute les changements de préférence OS en temps réel
 */
export function animateSchemes(): void {
  // Étape 1 — Appliquer le cache immédiatement pour éviter le flash
  const cached = localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light' | null;
  if (cached) {
    applyTheme(cached);
  }

  // Étape 2 — Synchroniser avec la vraie préférence OS (corrige le cache si besoin)
  applyTheme(getOSTheme());

  // Étape 3 — Réagir aux changements de préférence en temps réel (ex: l'utilisateur
  //           bascule son OS en dark mode pendant sa navigation)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    applyTheme(event.matches ? 'dark' : 'light');
  });
}
