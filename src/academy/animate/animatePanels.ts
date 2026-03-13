/**
 * Panel State Manager — Académie
 *
 * Attributs attendus :
 *   data-iw-component="panel"
 *   data-iw-panel-variant="menu | submenu | annexes"
 *   data-iw-panel-state="open | close"   ← géré automatiquement
 *
 * Bouton de fermeture à l'intérieur d'un panel :
 *   data-iw-panel-close
 */

// ===============================
// Configuration
// ===============================

const PANEL_STATE = {
  OPEN: 'open',
  CLOSE: 'close',
} as const;

const PANEL_VARIANT = {
  MENU: 'menu',
  SUBMENU: 'submenu',
  ANNEXES: 'annexes',
} as const;

// ===============================
// Sélecteurs
// ===============================

/** Retourne un panel par variant, ou null */
function getPanel(variant: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-iw-component="panel"][data-iw-panel-variant="${variant}"]`
  );
}

// ===============================
// Gestion des états
// ===============================

/** Ouvre un panel */
function openPanel(panel: HTMLElement | null): void {
  if (!panel) return;
  panel.dataset.iwPanelState = PANEL_STATE.OPEN;
}

/** Ferme un panel */
function closePanel(panel: HTMLElement | null): void {
  if (!panel) return;
  panel.dataset.iwPanelState = PANEL_STATE.CLOSE;
}

// ===============================
// Initialisation des états par défaut
// ===============================

/**
 * Définit l'état initial des panels selon la structure de la page :
 * - Page avec sous-menu → menu fermé, submenu + annexes ouverts
 * - Page simple        → menu ouvert
 */
function initPanelStates(): void {
  const menu = getPanel(PANEL_VARIANT.MENU);
  const submenu = getPanel(PANEL_VARIANT.SUBMENU);
  const annexes = getPanel(PANEL_VARIANT.ANNEXES);

  if (submenu) {
    closePanel(menu);
    openPanel(submenu);
    openPanel(annexes);
  } else {
    openPanel(menu);
  }
}

// ===============================
// Gestion des événements
// ===============================

/** Délègue les clics sur tous les boutons [data-iw-panel-close] */
function bindCloseButtons(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const btn = (e.target as Element).closest('[data-iw-panel-close]');
    if (!btn) return;

    const panel = btn.closest<HTMLElement>('[data-iw-component="panel"]');
    if (!panel) return;

    closePanel(panel);
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise le système de gestion des panels.
 *
 * - États initiaux calculés selon la structure de la page
 * - Fermeture via délégation d'événement sur [data-iw-panel-close]
 */
export function animateAcaPanels(): void {
  initPanelStates();
  bindCloseButtons();
}
