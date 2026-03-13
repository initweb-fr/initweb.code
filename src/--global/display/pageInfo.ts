/**
 * Page Info Manager — Site & Académie
 *
 * Renseigne automatiquement les éléments de la page avec des informations
 * contextuelles lues depuis le localStorage.
 *
 * Attribut sur l'élément à renseigner :
 *   data-iw-page-info="current-page-name"  — remplace le contenu texte de l'élément
 *                                             par le nom de la page actuelle
 *
 * Extensible : ajouter une entrée dans PAGE_INFO_SOURCES pour exposer
 * d'autres valeurs (ex. "current-user", "current-course"…)
 */

import { STORAGE_KEY_PAGE_NAME } from '$global/storageKeys';

// ===============================
// Sources disponibles
// ===============================

const PAGE_INFO_SOURCES: Record<string, () => string | null> = {
  'current-page-name': () => localStorage.getItem(STORAGE_KEY_PAGE_NAME),
};

// ===============================
// Remplissage d'un élément
// ===============================

function fillElement(el: HTMLElement): void {
  const key = el.dataset.iwPageInfo;
  if (!key) return;

  const source = PAGE_INFO_SOURCES[key];
  if (!source) return;

  const value = source();
  if (value) el.textContent = value;
}

// ===============================
// Fonction principale
// ===============================

/**
 * Parcourt tous les éléments [data-iw-page-info] et remplace
 * leur contenu texte par la valeur correspondante du localStorage.
 */
export function managePageInfo(): void {
  document.querySelectorAll<HTMLElement>('[data-iw-page-info]').forEach(fillElement);
}
