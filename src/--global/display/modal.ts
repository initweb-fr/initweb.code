/**
 * Modal Manager — Site & Académie
 *
 * Attributs sur la modale :
 *   data-iw-component="modal"
 *   data-iw-modal-id="nom-unique"
 *   data-iw-modal-state="open | close"  ← géré automatiquement
 *
 * À l'intérieur de la modale :
 *   data-iw-modal-overlay   → clic ferme la modale
 *   data-iw-modal-close     → clic ferme la modale
 *
 * Boutons d'ouverture (n'importe où dans la page) :
 *   data-iw-modal-open="nom-unique"
 *
 * Verrou du scroll :
 *   body[data-iw-modal-open="true"]  ← classe ajoutée automatiquement
 */

// ===============================
// Configuration
// ===============================

const MODAL_STATE = {
  OPEN: 'open',
  CLOSE: 'close',
} as const;

// ===============================
// Sélecteurs
// ===============================

function getModal(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-iw-component="modal"][data-iw-modal-id="${id}"]`
  );
}

function getAllModals(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-iw-component="modal"]'));
}

// ===============================
// Gestion des états
// ===============================

function openModal(modal: HTMLElement): void {
  // Une seule modale ouverte à la fois
  getAllModals().forEach((m) => {
    if (m !== modal) closeModal(m);
  });

  modal.dataset.iwModalState = MODAL_STATE.OPEN;
  document.body.dataset.iwModalOpen = 'true';
}

function closeModal(modal: HTMLElement): void {
  modal.dataset.iwModalState = MODAL_STATE.CLOSE;

  // Retire le verrou uniquement si plus aucune modale n'est ouverte
  const anyOpen = getAllModals().some((m) => m.dataset.iwModalState === MODAL_STATE.OPEN);
  if (!anyOpen) {
    delete document.body.dataset.iwModalOpen;
  }
}

function closeAllModals(): void {
  getAllModals().forEach(closeModal);
}

// ===============================
// Gestion des événements
// ===============================

function bindEvents(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    // Ouverture
    const opener = (e.target as Element).closest<HTMLElement>('[data-iw-modal-open]');
    if (opener) {
      const id = opener.dataset.iwModalOpen;
      if (!id) return;
      const modal = getModal(id);
      if (modal) openModal(modal);
      return;
    }

    // Fermeture via bouton close ou overlay
    const closer = (e.target as Element).closest<HTMLElement>(
      '[data-iw-modal-close], [data-iw-modal-overlay]'
    );
    if (closer) {
      const modal = closer.closest<HTMLElement>('[data-iw-component="modal"]');
      if (modal) closeModal(modal);
    }
  });

  // Fermeture via touche Échap
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise le système de modales.
 * Compatible site et académie.
 */
export function manageModals(): void {
  closeAllModals();
  bindEvents();
}
