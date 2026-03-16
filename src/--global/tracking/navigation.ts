/**
 * Navigation Tracker — Site & Académie
 *
 * Enregistre à chaque chargement de page les informations de navigation
 * de l'utilisateur sous forme de cookies partagés entre initweb.fr et aca.initweb.fr.
 *
 * Cookies écrits :
 *   __iw_navigation_current_title   — meta title de la page actuelle
 *   __iw_navigation_current_url     — URL complète de la page actuelle
 *   __iw_navigation_previous_title  — meta title de la page précédente
 *   __iw_navigation_previous_url    — URL complète de la page précédente
 *
 * Les cookies sont :
 *   - Partagés sur tout le domaine .initweb.fr (site + académie)
 *   - Persistants 365 jours (survivent à la fermeture du navigateur)
 */

import {
  STORAGE_KEY_NAVIGATION_CURRENT_TITLE,
  STORAGE_KEY_NAVIGATION_CURRENT_URL,
  STORAGE_KEY_NAVIGATION_PREVIOUS_TITLE,
  STORAGE_KEY_NAVIGATION_PREVIOUS_URL,
} from '$global/storageKeys';
import { COOKIE_DOMAIN, getCookie, setCookie } from '$global/utils/cookieUtilities';

// ===============================
// Configuration
// ===============================

const NAV_COOKIE_OPTIONS = {
  domain: COOKIE_DOMAIN,
  path: '/',
  maxAgeDays: 365,
  sameSite: 'Lax',
} as const;

// ===============================
// Logique principale
// ===============================

/**
 * Enregistre les infos de navigation de la page actuelle.
 * Décale current → previous avant de sauvegarder les nouvelles valeurs.
 * À appeler une fois par chargement de page.
 */
export function saveNavigationInfos(): void {
  const currentTitle = getCookie(STORAGE_KEY_NAVIGATION_CURRENT_TITLE);
  const currentUrl = getCookie(STORAGE_KEY_NAVIGATION_CURRENT_URL);
  const newTitle = document.title;
  const newUrl = window.location.href;

  // Décalage current → previous (uniquement si la page change)
  if (currentUrl && currentUrl !== newUrl) {
    if (currentTitle)
      setCookie(STORAGE_KEY_NAVIGATION_PREVIOUS_TITLE, currentTitle, NAV_COOKIE_OPTIONS);
    setCookie(STORAGE_KEY_NAVIGATION_PREVIOUS_URL, currentUrl, NAV_COOKIE_OPTIONS);
  }

  // Sauvegarde de la page actuelle
  setCookie(STORAGE_KEY_NAVIGATION_CURRENT_TITLE, newTitle, NAV_COOKIE_OPTIONS);
  setCookie(STORAGE_KEY_NAVIGATION_CURRENT_URL, newUrl, NAV_COOKIE_OPTIONS);
}
