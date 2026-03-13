/**
 * Navigation Tracker — Site & Académie
 *
 * Enregistre à chaque chargement de page les informations de navigation
 * de l'utilisateur dans un cookie JSON partagé entre initweb.fr et aca.initweb.fr.
 *
 * Cookie écrit :
 *   __iw_navigation  →  { current: { title, url }, previous: { title, url } }
 *
 * Le cookie est :
 *   - Partagé sur tout le domaine .initweb.fr (site + académie)
 *   - Persistant 365 jours (survit à la fermeture du navigateur)
 */

import { COOKIE_KEY_NAVIGATION, type NavigationCookie } from '$global/storageKeys';
import { COOKIE_DOMAIN, getJsonCookie, setJsonCookie } from '$global/utils/cookieUtilities';

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
  const nav = getJsonCookie<NavigationCookie>(COOKIE_KEY_NAVIGATION);
  const newTitle = document.title;
  const newUrl = window.location.href;

  const updated: NavigationCookie = {
    current: { title: newTitle, url: newUrl },
    previous: nav.previous,
  };

  // Décalage current → previous (uniquement si la page change)
  if (nav.current?.url && nav.current.url !== newUrl) {
    updated.previous = nav.current;
  }

  setJsonCookie<NavigationCookie>(COOKIE_KEY_NAVIGATION, updated, NAV_COOKIE_OPTIONS);
}
