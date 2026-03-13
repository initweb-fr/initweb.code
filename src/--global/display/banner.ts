/**
 * Banner Manager — Site & Académie
 *
 * Attributs sur la bannière :
 *   data-iw-component="banner"
 *   data-iw-banner-id="nom-unique"             — identifiant unique (requis)
 *   data-iw-banner-state="visible | hidden"    — géré automatiquement
 *
 *   data-iw-banner-dismiss="persistent | always"
 *     persistent : la fermeture est mémorisée en localStorage
 *     always     : la bannière réapparaît à chaque chargement de page (défaut)
 *
 *   data-iw-banner-dismiss-ttl="7"             — (optionnel, persistent uniquement)
 *                                                durée en jours du mémorisation de fermeture
 *                                                si absent : fermeture définitive
 *
 *   data-iw-banner-expires="2026-12-31"        — (optionnel)
 *                                                date ISO après laquelle la bannière
 *                                                n'est plus jamais affichée
 *
 * Bouton de fermeture (à l'intérieur de la bannière) :
 *   data-iw-banner-close
 */

import { storageKeyBannerDismissed } from '$global/storageKeys';

// ===============================
// Configuration
// ===============================

const BANNER_STATE = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
} as const;

const BANNER_DISMISS = {
  PERSISTENT: 'persistent',
  ALWAYS: 'always',
} as const;

// ===============================
// Utilitaires
// ===============================

function parseDate(dateStr: string): number | null {
  const ts = Date.parse(dateStr);
  return isNaN(ts) ? null : ts;
}

// ===============================
// Gestion des états
// ===============================

function showBanner(banner: HTMLElement): void {
  banner.dataset.iwBannerState = BANNER_STATE.VISIBLE;
}

function hideBanner(banner: HTMLElement): void {
  banner.dataset.iwBannerState = BANNER_STATE.HIDDEN;
}

// ===============================
// Logique de visibilité
// ===============================

/** Vérifie si la date de péremption de la bannière est dépassée */
function isExpired(banner: HTMLElement): boolean {
  const expiresStr = banner.dataset.iwBannerExpires;
  if (!expiresStr) return false;
  const expiresTs = parseDate(expiresStr);
  return expiresTs !== null && Date.now() > expiresTs;
}

/** Vérifie si la bannière a été fermée et si la fermeture est encore valide */
function isDismissed(bannerId: string, ttlDays: number | null): boolean {
  const stored = localStorage.getItem(storageKeyBannerDismissed(bannerId));
  if (!stored) return false;

  const dismissedAt = parseInt(stored, 10);
  if (isNaN(dismissedAt)) return false;

  // Sans TTL : fermeture définitive
  if (ttlDays === null) return true;

  return Date.now() < dismissedAt + ttlDays * 24 * 60 * 60 * 1000;
}

function saveDismissal(bannerId: string): void {
  localStorage.setItem(storageKeyBannerDismissed(bannerId), Date.now().toString());
}

function clearDismissal(bannerId: string): void {
  localStorage.removeItem(storageKeyBannerDismissed(bannerId));
}

// ===============================
// Initialisation d'une bannière
// ===============================

function initBanner(banner: HTMLElement): void {
  const bannerId = banner.dataset.iwBannerId;
  if (!bannerId) return;

  const dismiss = banner.dataset.iwBannerDismiss ?? BANNER_DISMISS.ALWAYS;
  const ttlStr = banner.dataset.iwBannerDismissTtl;
  const ttlDays = ttlStr !== undefined ? parseFloat(ttlStr) : null;

  // Bannière périmée → cachée, on nettoie le localStorage
  if (isExpired(banner)) {
    hideBanner(banner);
    clearDismissal(bannerId);
    return;
  }

  // Fermeture persistante encore valide → cachée
  if (dismiss === BANNER_DISMISS.PERSISTENT && isDismissed(bannerId, ttlDays)) {
    hideBanner(banner);
    return;
  }

  showBanner(banner);
}

// ===============================
// Gestion des événements
// ===============================

function bindEvents(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const closeBtn = (e.target as Element).closest<HTMLElement>('[data-iw-banner-close]');
    if (!closeBtn) return;

    const banner = closeBtn.closest<HTMLElement>('[data-iw-component="banner"]');
    if (!banner) return;

    const bannerId = banner.dataset.iwBannerId;
    const dismiss = banner.dataset.iwBannerDismiss ?? BANNER_DISMISS.ALWAYS;

    hideBanner(banner);

    if (dismiss === BANNER_DISMISS.PERSISTENT && bannerId) {
      saveDismissal(bannerId);
    }
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise toutes les bannières de la page.
 * Compatible site et académie.
 */
export function manageBanners(): void {
  document.querySelectorAll<HTMLElement>('[data-iw-component="banner"]').forEach(initBanner);
  bindEvents();
}
