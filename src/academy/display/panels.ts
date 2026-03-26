/**
 * Panel State Manager — Académie
 *
 * Attributs attendus :
 *   data-iw-component="panel"
 *   data-iw-panel-type="menu | submenu | annexes"
 *   data-iw-panel-state="open | close"   ← géré automatiquement
 *   data-iw-component="panel-resizer"
 *   data-iw-panel-target="menu | submenu | annexes"  ← sur le resizer, cible le panel par type
 *
 * (Persistance localStorage supprimée)
 */

// ===============================
// Configuration
// ===============================

const PANEL_STATE = {
  OPEN: 'open',
  CLOSE: 'close',
} as const;

const PANEL_TYPE = {
  MENU: 'menu',
  SUBMENU: 'submenu',
  ANNEXES: 'annexes',
} as const;

// Liste des URLs où le menu doit être fermé (à compléter selon les besoins)
const PANEL_CLOSED_URLS = [
  '/edu/cours/',
  // Ajoutez d'autres URLs ici où le menu doit être fermé par défaut
];

const DESKTOP_BREAKPOINT = 991;

// ===============================
// Sélecteurs
// ===============================

/** Retourne un panel par type, ou null */
function getPanel(type: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-iw-component="panel"][data-iw-panel-type="${type}"]`
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

/** Retourne vrai si le panel est ouvert */
function isPanelOpen(panel: HTMLElement): boolean {
  return panel.dataset.iwPanelState === PANEL_STATE.OPEN;
}

/** Bascule l'état d'un panel */
function togglePanel(panel: HTMLElement): void {
  if (isPanelOpen(panel)) {
    closePanel(panel);
  } else {
    openPanel(panel);
  }
}

// ===============================
// Initialisation des états par défaut
// ===============================

function isDesktop(): boolean {
  return window.innerWidth > DESKTOP_BREAKPOINT;
}

/**
 * Définit l'état initial des panels :
 * - Desktop (>991px) : menu, submenu et annexes ouverts par défaut.
 * - Mobile           : tous les panels fermés.
 */
function initPanelStates(): void {
  const menu = getPanel(PANEL_TYPE.MENU);
  const submenu = getPanel(PANEL_TYPE.SUBMENU);
  const annexes = getPanel(PANEL_TYPE.ANNEXES);

  const currentPath = window.location.pathname;

  // Si l'URL contient "/edu/cours/", on ferme le panneau menu
  // (donc tout /edu/cours/xxxxx ou /edu/cours/ sera fermé)
  if (isDesktop()) {
    if (PANEL_CLOSED_URLS.some((url) => currentPath.includes(url))) {
      closePanel(menu);
    } else {
      openPanel(menu);
    }
    openPanel(submenu);
    openPanel(annexes);
  } else {
    closePanel(menu);
    closePanel(submenu);
    closePanel(annexes);
  }
}

// ===============================
// Gestion des événements
// ===============================

/** Délègue les clics sur tous les resizers [data-iw-component="panel-resizer"]
 *  et permet de rouvrir un panel fermé en cliquant directement dessus */
function bindResizersAndPanelClicks(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const targetElement = e.target as Element;

    // 1. Gestion resizer (boutons explicites)
    const resizer = targetElement.closest<HTMLElement>('[data-iw-component="panel-resizer"]');
    if (resizer) {
      const target = resizer.dataset.iwPanelTarget;
      const panel = target
        ? getPanel(target)
        : resizer.closest<HTMLElement>('[data-iw-component="panel"]');
      if (!panel) return;
      togglePanel(panel);
      return;
    }

    // 2. Gestion panel lui-même — n'ouvre que si fermé (évite toggle pendant contenu clic)
    const panel = targetElement.closest<HTMLElement>('[data-iw-component="panel"]');
    if (panel && !isPanelOpen(panel)) {
      openPanel(panel);
      return;
    }
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise le système de gestion des panels.
 *
 * - États initiaux calculés selon le breakpoint
 * - Toggle via délégation d'événement sur [data-iw-component="panel-resizer"]
 * - Autorise ouverture panel par clic direct si fermé
 */
function logPanelStates(): void {
  const panels = document.querySelectorAll<HTMLElement>('[data-iw-component="panel"]');
  console.group('[panels]');
  panels.forEach((panel) => {
    const type = panel.dataset.iwPanelType ?? '—';
    const state = panel.dataset.iwPanelState ?? '—';
    console.log(`${type} → ${state}`);
  });
  console.groupEnd();
}

export function animateAcaPanels(): void {
  initPanelStates();
  bindResizersAndPanelClicks();
  logPanelStates();
}
