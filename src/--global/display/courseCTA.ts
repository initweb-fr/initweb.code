/**
 * Course CTA Manager — Tablet & Mobile
 *
 * Gère l'ouverture et la fermeture du panneau CTA de cours sur tablette et mobile.
 *
 * Attributs sur le conteneur principal :
 *   data-iw-component="course-cta-tm"
 *   data-iw-course-cta-tm-state="open | close"  ← mis à jour automatiquement par ce script
 *
 * Attributs internes :
 *   data-iw-component="course-cta-tm-content"   — panneau de contenu
 *   data-iw-component="course-cta-tm-overlay"   — fond sombre qui ferme au clic
 *
 * Attribut d'action (sur n'importe quel élément de la page, interne ou externe) :
 *   data-iw-course-cta-tm-action="toggle"  — bascule open/close selon l'état actuel
 *   data-iw-course-cta-tm-action="close"   — ferme toujours (ex: bouton ✕ dans le panneau)
 */

// ===============================
// Configuration
// ===============================

const CTA_STATE = {
  OPEN: 'open',
  CLOSE: 'close',
} as const;

const CTA_ACTION = {
  TOGGLE: 'toggle',
  CLOSE: 'close',
} as const;

// ===============================
// Gestion des états
// ===============================

function openCTA(cta: HTMLElement): void {
  cta.setAttribute('data-iw-course-cta-tm-state', CTA_STATE.OPEN);
}

function closeCTA(cta: HTMLElement): void {
  cta.setAttribute('data-iw-course-cta-tm-state', CTA_STATE.CLOSE);
}

function isOpen(cta: HTMLElement): boolean {
  return cta.getAttribute('data-iw-course-cta-tm-state') === CTA_STATE.OPEN;
}

function toggleCTA(cta: HTMLElement): void {
  if (isOpen(cta)) {
    closeCTA(cta);
  } else {
    openCTA(cta);
  }
}

// ===============================
// Initialisation d'un CTA
// ===============================

function initCourseCTA(cta: HTMLElement): void {
  const overlay = cta.querySelector<HTMLElement>('[data-iw-component="course-cta-tm-overlay"]');
  const actions = document.querySelectorAll<HTMLElement>('[data-iw-course-cta-tm-action]');

  closeCTA(cta);

  overlay?.addEventListener('click', () => closeCTA(cta));

  actions.forEach((action) => {
    action.addEventListener('click', (e) => {
      e.stopPropagation();
      if (action.dataset.iwCourseCtaTmAction === CTA_ACTION.TOGGLE) {
        toggleCTA(cta);
      } else if (action.dataset.iwCourseCtaTmAction === CTA_ACTION.CLOSE) {
        closeCTA(cta);
      }
    });
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise tous les CTAs de cours présents sur la page.
 * Compatible site et académie.
 */
export function manageCourseCTAs(): void {
  document
    .querySelectorAll<HTMLElement>('[data-iw-component="course-cta-tm"]')
    .forEach(initCourseCTA);
}
