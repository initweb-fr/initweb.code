/**
 * Tab Manager — Site & Académie
 *
 * Attributs sur le conteneur :
 *   data-iw-component="tab-wrapper"
 *
 *   data-iw-tab-auto="true"       — (optionnel) passage automatique entre les tabs
 *   data-iw-tab-duration="5"      — (optionnel, auto uniquement) secondes avant chaque switch (défaut : 5)
 *
 * Attributs sur chaque toggle :
 *   data-iw-component="tab-toggle"
 *   data-iw-tab-default="true"     — (optionnel) marque ce toggle comme actif au chargement
 *                                    si absent ou "false" sur tous : le premier toggle est actif par défaut
 *   data-iw-tab-state="active | inactive"  — géré automatiquement
 *
 * Attributs sur chaque contenu :
 *   data-iw-component="tab-content"
 *   data-iw-tab-state="active | inactive"  — géré automatiquement
 *
 * Timeline de progression (à placer dans le tab-toggle OU le tab-content, uniquement utile si auto="true") :
 *   data-iw-tab-timeline           — track de la timeline (élément conteneur/fond)
 *   data-iw-tab-timeline-fill      — élément interne qui s'agrandit (width : 0% → 100%)
 */

// ===============================
// Configuration
// ===============================

const TAB_STATE = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

const DEFAULT_TAB_DURATION = 5; // secondes

// ===============================
// Lecture de la config
// ===============================

interface TabConfig {
  auto: boolean;
  duration: number;
}

function getTabConfig(wrapper: HTMLElement): TabConfig {
  const auto = wrapper.dataset.iwTabAuto === 'true';
  const duration = parseFloat(wrapper.dataset.iwTabDuration ?? '') || DEFAULT_TAB_DURATION;
  return { auto, duration };
}

function getDefaultIndex(toggles: HTMLElement[]): number {
  const marked = toggles.findIndex((t) => t.dataset.iwTabDefault === 'true');
  return marked !== -1 ? marked : 0;
}

// ===============================
// Gestion des états
// ===============================

function setActive(toggle: HTMLElement, content: HTMLElement): void {
  toggle.dataset.iwTabState = TAB_STATE.ACTIVE;
  content.dataset.iwTabState = TAB_STATE.ACTIVE;
}

function setInactive(toggle: HTMLElement, content: HTMLElement): void {
  toggle.dataset.iwTabState = TAB_STATE.INACTIVE;
  content.dataset.iwTabState = TAB_STATE.INACTIVE;
}

// ===============================
// Timeline de progression
// ===============================

function findFill(toggle: HTMLElement, content: HTMLElement): HTMLElement | null {
  return (
    toggle.querySelector<HTMLElement>('[data-iw-tab-timeline-fill]') ??
    content.querySelector<HTMLElement>('[data-iw-tab-timeline-fill]')
  );
}

function resetFill(toggle: HTMLElement, content: HTMLElement): void {
  const fill = findFill(toggle, content);
  if (!fill) {
    return;
  }
  fill.style.transition = 'none';
  fill.style.width = '0%';
}

function animateFill(toggle: HTMLElement, content: HTMLElement, duration: number): void {
  const fill = findFill(toggle, content);
  if (!fill) {
    return;
  }

  fill.style.transition = 'none';
  fill.style.width = '0%';
  // Force reflow pour que le reset soit pris en compte avant l'animation
  fill.getBoundingClientRect();
  fill.style.transition = `width ${duration}s linear`;
  fill.style.width = '100%';
}

// ===============================
// Initialisation d'un wrapper
// ===============================

function initTabWrapper(wrapper: HTMLElement): void {
  const toggles = Array.from(
    wrapper.querySelectorAll<HTMLElement>('[data-iw-component="tab-toggle"]')
  );
  const contents = Array.from(
    wrapper.querySelectorAll<HTMLElement>('[data-iw-component="tab-content"]')
  );

  if (toggles.length === 0 || contents.length === 0) {
    return;
  }

  const config = getTabConfig(wrapper);
  let currentIndex = 0;
  let autoTimer: ReturnType<typeof setTimeout> | null = null;

  function activateTab(index: number): void {
    const clampedIndex = Math.max(0, Math.min(index, toggles.length - 1));

    toggles.forEach((toggle, i) => {
      const content = contents[i];
      if (!content) {
        return;
      }
      setInactive(toggle, content);
      resetFill(toggle, content);
    });

    const activeToggle = toggles[clampedIndex];
    const activeContent = contents[clampedIndex];
    if (!activeToggle || !activeContent) {
      return;
    }

    setActive(activeToggle, activeContent);
    currentIndex = clampedIndex;

    if (config.auto) {
      animateFill(activeToggle, activeContent, config.duration);
      scheduleNext();
    }
  }

  function scheduleNext(): void {
    if (autoTimer) {
      clearTimeout(autoTimer);
    }
    autoTimer = setTimeout(() => {
      activateTab((currentIndex + 1) % toggles.length);
    }, config.duration * 1000);
  }

  const initialIndex = getDefaultIndex(toggles);
  activateTab(initialIndex);

  toggles.forEach((toggle, i) => {
    toggle.addEventListener('click', () => {
      if (autoTimer) {
        clearTimeout(autoTimer);
      }
      activateTab(i);
    });
  });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise tous les systèmes de tabs de la page.
 * Compatible site et académie.
 */
export function manageTabs(): void {
  const wrappers = document.querySelectorAll<HTMLElement>('[data-iw-component="tab-wrapper"]');
  wrappers.forEach(initTabWrapper);
}
