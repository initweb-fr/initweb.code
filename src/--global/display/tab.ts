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
  console.log('[Tab] getTabConfig:', { auto, duration, wrapper });
  return { auto, duration };
}

function getDefaultIndex(toggles: HTMLElement[]): number {
  const marked = toggles.findIndex((t) => t.dataset.iwTabDefault === 'true');
  console.log('[Tab] getDefaultIndex:', { toggles, marked });
  return marked !== -1 ? marked : 0;
}

// ===============================
// Gestion des états
// ===============================

function setActive(toggle: HTMLElement, content: HTMLElement): void {
  console.log('[Tab] setActive:', { toggle, content });
  toggle.dataset.iwTabState = TAB_STATE.ACTIVE;
  content.dataset.iwTabState = TAB_STATE.ACTIVE;
}

function setInactive(toggle: HTMLElement, content: HTMLElement): void {
  console.log('[Tab] setInactive:', { toggle, content });
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
    console.log('[Tab] resetFill: Pas de fill trouvé pour', { toggle, content });
    return;
  }
  fill.style.transition = 'none';
  fill.style.width = '0%';
  console.log('[Tab] resetFill effectué pour', { toggle });
}

function animateFill(toggle: HTMLElement, content: HTMLElement, duration: number): void {
  const fill = findFill(toggle, content);
  if (!fill) {
    console.log('[Tab] animateFill: Pas de fill trouvé pour', { toggle, content });
    return;
  }

  fill.style.transition = 'none';
  fill.style.width = '0%';
  // Force reflow pour que le reset soit pris en compte avant l'animation
  fill.getBoundingClientRect();
  fill.style.transition = `width ${duration}s linear`;
  fill.style.width = '100%';
  console.log('[Tab] animateFill lancé pour', { toggle, duration });
}

// ===============================
// Initialisation d'un wrapper
// ===============================

function initTabWrapper(wrapper: HTMLElement): void {
  console.log('[Tab] initTabWrapper appelé pour', wrapper);

  const toggles = Array.from(
    wrapper.querySelectorAll<HTMLElement>('[data-iw-component="tab-toggle"]')
  );
  const contents = Array.from(
    wrapper.querySelectorAll<HTMLElement>('[data-iw-component="tab-content"]')
  );

  console.log(
    '[Tab] tab-toggles trouvés :',
    toggles.length,
    toggles,
    '| tab-contents trouvés :',
    contents.length,
    contents
  );

  if (toggles.length === 0 || contents.length === 0) {
    console.log('[Tab] Aucun toggle ou content trouvé, arrêt de initTabWrapper');
    return;
  }

  const config = getTabConfig(wrapper);
  let currentIndex = 0;
  let autoTimer: ReturnType<typeof setTimeout> | null = null;

  function activateTab(index: number): void {
    const clampedIndex = Math.max(0, Math.min(index, toggles.length - 1));
    console.log('[Tab] activateTab appelé pour', { index, clampedIndex, toggles, contents });

    toggles.forEach((toggle, i) => {
      const content = contents[i];
      if (!content) {
        console.log('[Tab] Pas de content pour toggle', i);
        return;
      }
      setInactive(toggle, content);
      resetFill(toggle, content);
    });

    const activeToggle = toggles[clampedIndex];
    const activeContent = contents[clampedIndex];
    if (!activeToggle || !activeContent) {
      console.log('[Tab] Toggle ou content actif manquant', { clampedIndex });
      return;
    }

    setActive(activeToggle, activeContent);
    currentIndex = clampedIndex;
    console.log('[Tab] Tab activée', { activeToggle, activeContent, currentIndex });

    if (config.auto) {
      animateFill(activeToggle, activeContent, config.duration);
      scheduleNext();
    }
  }

  function scheduleNext(): void {
    if (autoTimer) {
      clearTimeout(autoTimer);
      console.log('[Tab] scheduleNext: Timer précédent clear');
    }
    autoTimer = setTimeout(() => {
      console.log("[Tab] scheduleNext: Passage à l'onglet suivant");
      activateTab((currentIndex + 1) % toggles.length);
    }, config.duration * 1000);
    console.log('[Tab] scheduleNext: Timer programmé pour', config.duration, 'secondes');
  }

  const initialIndex = getDefaultIndex(toggles);
  console.log('[Tab] Activation du tab par défaut index', initialIndex);
  activateTab(initialIndex);

  toggles.forEach((toggle, i) => {
    toggle.addEventListener('click', () => {
      console.log('[Tab] Click sur toggle', i);
      if (autoTimer) {
        clearTimeout(autoTimer);
        console.log('[Tab] Timer clear suite à un click');
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
  console.log('[Tab] manageTabs appelé');
  const wrappers = document.querySelectorAll<HTMLElement>('[data-iw-component="tab-wrapper"]');
  console.log('[Tab] tab-wrappers trouvés :', wrappers.length, wrappers);
  wrappers.forEach(initTabWrapper);
}
