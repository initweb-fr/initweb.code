/**
 * Dropdown Manager — Site & Académie
 *
 * Attributs de la liste :
 *   data-iw-component="dropdown-list"
 *   data-iw-dropdown-behavior="exclusive | multiple"
 *     exclusive : ferme les autres quand un s'ouvre   (défaut)
 *     multiple  : laisse les autres ouverts
 *   data-iw-dropdown-default="first | none"
 *     first : premier dropdown ouvert au chargement   (défaut)
 *     none  : tous fermés au chargement
 *
 * Attributs de chaque item :
 *   data-iw-component="dropdown"
 *   data-iw-dropdown-state="open | close"  ← géré automatiquement
 *
 * À l'intérieur de chaque item :
 *   data-iw-component="dropdown-toggle"
 *   data-iw-component="dropdown-content"
 */

// ===============================
// Configuration
// ===============================

const DROPDOWN_STATE = {
  OPEN: 'open',
  CLOSE: 'close',
} as const;

const DROPDOWN_BEHAVIOR = {
  EXCLUSIVE: 'exclusive',
  MULTIPLE: 'multiple',
} as const;

const DROPDOWN_DEFAULT = {
  FIRST: 'first',
  NONE: 'none',
} as const;

// ===============================
// Gestion des états
// ===============================

function openDropdown(dropdown: HTMLElement): void {
  dropdown.dataset.iwDropdownState = DROPDOWN_STATE.OPEN;
}

function closeDropdown(dropdown: HTMLElement): void {
  dropdown.dataset.iwDropdownState = DROPDOWN_STATE.CLOSE;
}

function isOpen(dropdown: HTMLElement): boolean {
  return dropdown.dataset.iwDropdownState === DROPDOWN_STATE.OPEN;
}

// ===============================
// Initialisation d'une liste
// ===============================

function initDropdownList(list: HTMLElement): void {
  const dropdowns = Array.from(
    list.querySelectorAll<HTMLElement>('[data-iw-component="dropdown"]')
  );

  if (dropdowns.length === 0) return;

  const behavior = list.dataset.iwDropdownBehavior ?? DROPDOWN_BEHAVIOR.EXCLUSIVE;
  const defaultState = list.dataset.iwDropdownDefault ?? DROPDOWN_DEFAULT.FIRST;

  // État initial
  if (defaultState === DROPDOWN_DEFAULT.FIRST) {
    openDropdown(dropdowns[0]);
    dropdowns.slice(1).forEach(closeDropdown);
  } else {
    dropdowns.forEach(closeDropdown);
  }

  // Écouteurs de clic sur les toggles
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector<HTMLElement>('[data-iw-component="dropdown-toggle"]');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const wasOpen = isOpen(dropdown);

      if (behavior === DROPDOWN_BEHAVIOR.EXCLUSIVE) {
        dropdowns.forEach(closeDropdown);
      }

      // Bascule l'état du dropdown cliqué
      if (wasOpen) {
        closeDropdown(dropdown);
      } else {
        openDropdown(dropdown);
      }
    });
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise tous les systèmes de dropdowns de la page.
 * Compatible site et académie.
 */
export function manageDropdowns(): void {
  document
    .querySelectorAll<HTMLElement>('[data-iw-component="dropdown-list"]')
    .forEach(initDropdownList);
}
