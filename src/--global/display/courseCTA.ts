/**
 * Course CTA Manager — Tablet & Mobile
 *
 * Gère l'ouverture et la fermeture du panneau CTA de cours sur tablette et mobile.
 * Fermeture possible via le toggle, l'overlay ou tout bouton d'action.
 *
 * Attributs sur le conteneur principal :
 *   data-iw-component="course-cta-tm"
 *   data-iw-course-cta-tm-state="open | close"  ← géré automatiquement
 *
 * Attributs internes :
 *   data-iw-component="course-cta-tm-content"   — panneau de contenu
 *   data-iw-component="course-cta-tm-toggle"    — bouton qui ouvre/ferme
 *   data-iw-component="course-cta-tm-overlay"   — fond qui ferme au clic
 *
 * Attribut d'action sur n'importe quel élément interne :
 *   data-iw-course-cta-tm-action="open | close" — force l'état au clic
 */

// ===============================
// Configuration
// ===============================

const CTA_STATE = {
  OPEN: 'open',
  CLOSE: 'close',
} as const;

const CTA_ACTION = {
  OPEN: 'open',
  CLOSE: 'close',
} as const;

// ===============================
// Gestion des états
// ===============================

function openCTA(cta: HTMLElement): void {
  cta.dataset.iwCourseCTATmState = CTA_STATE.OPEN;
}

function closeCTA(cta: HTMLElement): void {
  cta.dataset.iwCourseCTATmState = CTA_STATE.CLOSE;
}

function isOpen(cta: HTMLElement): boolean {
  return cta.dataset.iwCourseCTATmState === CTA_STATE.OPEN;
}

// ===============================
// Initialisation d'un CTA
// ===============================

function initCourseCTA(cta: HTMLElement): void {
  const toggle = cta.querySelector<HTMLElement>('[data-iw-component="course-cta-tm-toggle"]');
  const overlay = cta.querySelector<HTMLElement>('[data-iw-component="course-cta-tm-overlay"]');
  const actions = cta.querySelectorAll<HTMLElement>('[data-iw-course-cta-tm-action]');

  // État initial : fermé
  closeCTA(cta);

  // Toggle : bascule l'état
  toggle?.addEventListener('click', () => {
    if (isOpen(cta)) {
      closeCTA(cta);
    } else {
      openCTA(cta);
    }
  });

  // Overlay : ferme toujours
  overlay?.addEventListener('click', () => closeCTA(cta));

  // Boutons d'action : force l'état selon l'attribut
  actions.forEach((action) => {
    action.addEventListener('click', () => {
      if (action.dataset.iwCourseCTATmAction === CTA_ACTION.OPEN) {
        openCTA(cta);
        console.log('open');
      } else if (action.dataset.iwCourseCTATmAction === CTA_ACTION.CLOSE) {
        closeCTA(cta);
        console.log('close');
      }
    });
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise tous les CTAs de cours de la page.
 * Compatible site et académie.
 */
export function manageCourseCTAs(): void {
  document
    .querySelectorAll<HTMLElement>('[data-iw-component="course-cta-tm"]')
    .forEach(initCourseCTA);
}
