/**
 * Stacked Notification Manager — Académie (& Site)
 *
 * Attributs sur le conteneur :
 *   data-iw-component="stacked-notification-stack"
 *
 *   data-iw-stack-offset="10"    — (optionnel) décalage vertical en px entre les cards (défaut : 10)
 *   data-iw-stack-scale="0.04"   — (optionnel) réduction de scale par niveau de profondeur (défaut : 0.04)
 *
 * Attributs sur chaque card :
 *   data-iw-component="stacked-notification"
 *   data-iw-stacked-notification-id="nom-unique"          — identifiant unique (requis)
 *   data-iw-stacked-notification-href="/chemin"           — URL de destination au clic sur la card (requis)
 *   data-iw-stacked-notification-state="visible | hidden" — géré automatiquement par le script
 *
 * Bouton de fermeture (à l'intérieur de la card) :
 *   data-iw-stacked-notification-close
 */

import { storageKeyStackedNotificationDismissed } from '$global/storageKeys';

// ===============================
// Configuration
// ===============================

const STACKED_NOTIFICATION_STATE = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
} as const;

const DEFAULT_STACK_OFFSET = 10; // px entre chaque card
const DEFAULT_STACK_SCALE = 0.04; // réduction de scale par niveau
const TRANSITION = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

// ===============================
// Utilitaires localStorage
// ===============================

function isDismissed(notificationId: string): boolean {
  return localStorage.getItem(storageKeyStackedNotificationDismissed(notificationId)) === '1';
}

function saveDismissal(notificationId: string): void {
  localStorage.setItem(storageKeyStackedNotificationDismissed(notificationId), '1');
}

// ===============================
// Gestion des états
// ===============================

function showNotification(card: HTMLElement): void {
  card.dataset.iwStackedNotificationState = STACKED_NOTIFICATION_STATE.VISIBLE;
}

function hideNotification(card: HTMLElement): void {
  card.dataset.iwStackedNotificationState = STACKED_NOTIFICATION_STATE.HIDDEN;
}

// ===============================
// Positionnement de la pile
// ===============================

function getStackConfig(stack: HTMLElement): { offset: number; scale: number } {
  const offset = parseFloat(stack.dataset.iwStackOffset ?? '') || DEFAULT_STACK_OFFSET;
  const scale = parseFloat(stack.dataset.iwStackScale ?? '') || DEFAULT_STACK_SCALE;
  return { offset, scale };
}

/**
 * Recalcule les positions CSS de toutes les cards visibles.
 * La première card visible (index 0) est au premier plan.
 * Les cards suivantes remontent et rétrécissent progressivement.
 */
function repositionCards(stack: HTMLElement): void {
  const { offset, scale } = getStackConfig(stack);

  const visibleCards = Array.from(
    stack.querySelectorAll<HTMLElement>('[data-iw-component="stacked-notification"]')
  ).filter((card) => card.dataset.iwStackedNotificationState === STACKED_NOTIFICATION_STATE.VISIBLE);

  visibleCards.forEach((card, i) => {
    card.style.transition = TRANSITION;
    card.style.transform = `translateY(${-i * offset}px) scale(${1 - i * scale})`;
    card.style.zIndex = String(visibleCards.length - i);
  });
}

// ===============================
// Initialisation d'une card
// ===============================

function initStackedNotification(card: HTMLElement): void {
  const notificationId = card.dataset.iwStackedNotificationId;
  if (!notificationId) return;

  if (isDismissed(notificationId)) {
    hideNotification(card);
  } else {
    showNotification(card);
  }
}

// ===============================
// Gestion des événements
// ===============================

function bindEvents(stack: HTMLElement): void {
  // Fermeture via le bouton croix
  stack.addEventListener('click', (e: MouseEvent) => {
    const closeBtn = (e.target as Element).closest<HTMLElement>(
      '[data-iw-stacked-notification-close]'
    );
    if (!closeBtn) return;

    e.stopPropagation();

    const card = closeBtn.closest<HTMLElement>('[data-iw-component="stacked-notification"]');
    if (!card) return;

    const notificationId = card.dataset.iwStackedNotificationId;
    if (!notificationId) return;

    hideNotification(card);
    saveDismissal(notificationId);
    repositionCards(stack);
  });

  // Navigation via clic sur la card (hors bouton de fermeture)
  stack.addEventListener('click', (e: MouseEvent) => {
    const closeBtn = (e.target as Element).closest('[data-iw-stacked-notification-close]');
    if (closeBtn) return;

    const card = (e.target as Element).closest<HTMLElement>(
      '[data-iw-component="stacked-notification"]'
    );
    if (!card) return;

    if (card.dataset.iwStackedNotificationState !== STACKED_NOTIFICATION_STATE.VISIBLE) return;

    const href = card.dataset.iwStackedNotificationHref;
    if (!href) return;

    window.location.href = href;
  });
}

// ===============================
// Initialisation d'un stack
// ===============================

function initStack(stack: HTMLElement): void {
  stack
    .querySelectorAll<HTMLElement>('[data-iw-component="stacked-notification"]')
    .forEach(initStackedNotification);

  repositionCards(stack);
  bindEvents(stack);
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise tous les stacks de notifications de la page.
 * Compatible site et académie.
 */
export function manageStackedNotifications(): void {
  document
    .querySelectorAll<HTMLElement>('[data-iw-component="stacked-notification-stack"]')
    .forEach(initStack);
}
