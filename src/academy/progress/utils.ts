/**
 * Interface utilisateur — Utilitaires
 *
 * Gère l'apparence des éléments de progression sur la page.
 * Marque les leçons complétées, calcule les statistiques et gère les interactions.
 *
 * Attributs Webflow utilisés :
 * - [data-iw-context]        : élément wrapper de la page (porte course/chapter/module IWIDs)
 * - [data-iw-content-type]   : "lesson" ou "project-step"
 * - [data-iw-course-iwid]    : IWID du cours parent
 * - [data-iw-chapter-iwid]   : IWID du chapitre parent
 * - [data-iw-module-iwid]    : IWID du module parent
 * - [data-iw-item-iwid]      : IWID de la leçon
 * - [data-iw-item-atid]      : Airtable ID de la leçon
 * - [data-iw-item-title]     : Titre de la leçon
 * - [data-iw-watched]        : "true" / "false"
 * - [data-iw-trigger]        : "button" ou "checkbox"
 * - [data-iw-loader]         : "true" / "false"
 */

import {
  STORAGE_KEY_CURRENT_LESSON_IWID,
  storageKeyLastLessonIWID,
  storageKeyLastLessonURL,
} from '$global/storageKeys';

// ===============================
// TYPES
// ===============================

// Informations de contexte de la page (cours, chapitre, module)
export type ProgressContext = {
  contentType: string;
  courseIWID: string;
  chapterIWID: string;
  moduleIWID: string;
};

// Représente une leçon terminée (stockée dans Memberstack)
export type CompletedLesson = {
  itemIWID: string;
  itemATID: string;
  title: string;
  completedAt: string;
  recordId: string;
};

// Liste de leçons terminées avec le total
export type CompletedLessonsList = {
  lessons: CompletedLesson[];
  count: number;
};

// ===============================
// LECTURE DU CONTEXTE DE PAGE
// ===============================

/**
 * Lit les identifiants du cours/chapitre/module depuis l'attribut [data-iw-context].
 * Cet élément doit être présent sur toute page de leçon dans Webflow.
 * Retourne null si l'élément est absent ou incomplet.
 */
export function getPageContext(): ProgressContext | null {
  // Chercher l'élément HTML qui porte les infos du cours
  const ctx = document.querySelector('[data-iw-context]') as HTMLElement | null;
  if (!ctx) {
    console.error('❌ Élément [data-iw-context] introuvable sur la page');
    return null;
  }

  // Lire chaque attribut (on met '' par défaut si l'attribut est absent)
  const contentType = ctx.dataset.iwContentType || '';
  const courseIWID = ctx.dataset.iwCourseIwid || '';
  const chapterIWID = ctx.dataset.iwChapterIwid || '';
  const moduleIWID = ctx.dataset.iwModuleIwid || '';

  // Vérifier que tous les attributs sont bien renseignés
  if (!contentType || !courseIWID || !chapterIWID || !moduleIWID) {
    console.error('❌ Attributs manquants sur [data-iw-context]:', {
      contentType,
      courseIWID,
      chapterIWID,
      moduleIWID,
    });
    return null;
  }

  return { contentType, courseIWID, chapterIWID, moduleIWID };
}

// ===============================
// MARQUAGE DES ÉLÉMENTS
// ===============================

/**
 * Passe data-iw-watched="true" sur tous les éléments HTML
 * dont l'identifiant Airtable correspond à une leçon terminée.
 * C'est ce qui déclenche les styles CSS "complété" dans Webflow.
 */
export function markCompletedLessons(itemATIDs: string[]) {
  for (const itemATID of itemATIDs) {
    const elements = Array.from(document.querySelectorAll(`[data-iw-item-atid="${itemATID}"]`));
    for (const el of elements) {
      (el as HTMLElement).dataset.iwWatched = 'true';
    }
  }
}

// ===============================
// CALCUL DES STATISTIQUES
// ===============================

/**
 * Calcule le nombre total de leçons sur la page et le pourcentage de progression.
 * Le total est compté via le nombre d'éléments [data-iw-trigger] dans le DOM.
 */
export function getProgressStats(completedCount: number) {
  const total = document.querySelectorAll('[data-iw-trigger]').length;

  // Éviter la division par zéro si la page ne contient aucun déclencheur
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return { total, completed: completedCount, percentage };
}

export function logProgress(stats: { completed: number; total: number; percentage: number }) {
  console.log(`📊 Progression: ${stats.completed}/${stats.total} (${stats.percentage}%)`);
}

// ===============================
// GESTION DES LOADERS
// ===============================

/**
 * Affiche le loader sur l'élément cliqué.
 * Si c'est un bouton, on affiche aussi le loader sur la case à cocher liée.
 */
export function showLoader(element: HTMLElement, itemATID: string) {
  element.dataset.iwLoader = 'true';

  if (element.dataset.iwTrigger === 'button') {
    const checkboxes = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-iw-trigger="checkbox"][data-iw-item-atid="${itemATID}"]`
      )
    );
    for (const checkbox of checkboxes) {
      checkbox.dataset.iwLoader = 'true';
    }
  }
}

/**
 * Masque le loader sur l'élément cliqué.
 * Si c'est un bouton, on masque aussi le loader sur la case à cocher liée.
 */
export function hideLoader(element: HTMLElement, itemATID: string) {
  element.dataset.iwLoader = 'false';

  if (element.dataset.iwTrigger === 'button') {
    const checkboxes = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-iw-trigger="checkbox"][data-iw-item-atid="${itemATID}"]`
      )
    );
    for (const checkbox of checkboxes) {
      checkbox.dataset.iwLoader = 'false';
    }
  }
}

// ===============================
// MISE À JOUR DE L'APPARENCE
// ===============================

/**
 * Met à jour data-iw-watched sur tous les éléments d'une leçon.
 * "true" → la leçon est cochée / "false" → la leçon est décochée.
 */
export function updateLessonState(itemATID: string, isCompleted: boolean) {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-iw-item-atid="${itemATID}"]`)
  );
  for (const el of elements) {
    el.dataset.iwWatched = isCompleted ? 'true' : 'false';
  }
}

// ===============================
// ÉCOUTE DES CLICS
// ===============================

/**
 * Attache un écouteur de clic sur chaque élément [data-iw-trigger] de la page.
 * À chaque clic, la fonction onProgressClick est appelée avec l'élément cliqué.
 */
export function setupClickListeners(
  memberId: string,
  onProgressClick: (element: HTMLElement, memberId: string) => Promise<void>
) {
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-iw-trigger]'));
  for (const element of triggers) {
    element.addEventListener('click', async function (this: HTMLElement) {
      await onProgressClick(this, memberId);
    });
  }
}

// ===============================
// FONCTIONS UTILITAIRES
// ===============================

/**
 * Sauvegarde l'URL et l'IWID de la dernière leçon visitée dans le localStorage.
 * Permet de proposer à l'utilisateur de reprendre où il s'est arrêté.
 */
export function trackLastLesson(courseIWID: string) {
  localStorage.setItem(storageKeyLastLessonURL(courseIWID), window.location.pathname || '');
  localStorage.setItem(
    storageKeyLastLessonIWID(courseIWID),
    localStorage.getItem(STORAGE_KEY_CURRENT_LESSON_IWID) || ''
  );
}

// ===============================
// LECTURE DEPUIS LA DATA TABLE
// ===============================

/**
 * Récupère toutes les leçons terminées pour un cours donné depuis Memberstack.
 * Gère la pagination : si le cours dépasse 100 leçons, plusieurs requêtes sont faites.
 */
export async function getCompletedLessonsList(courseIWID: string): Promise<CompletedLessonsList> {
  const ms = window.$memberstackDom;
  const allLessons: CompletedLesson[] = [];

  let hasMore = true;
  let cursor: string | undefined = undefined;

  // Tant qu'il reste des pages à charger, on continue de boucler
  while (hasMore) {
    // Construire la requête de base
    const query: Record<string, unknown> = {
      where: { course_iwid: { equals: courseIWID } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    };

    // Si on a un curseur (pagination), on l'ajoute à la requête
    if (cursor) {
      query.after = cursor;
    }

    const { data } = await ms.queryDataRecords({ table: 'progress', query });

    // Convertir chaque enregistrement brut en CompletedLesson
    for (const record of data.records) {
      allLessons.push({
        itemIWID: record.data.item_iwid,
        itemATID: record.data.item_atid,
        title: record.data.title || '',
        completedAt: record.data.completed_at,
        recordId: record.id,
      });
    }

    // Vérifier s'il reste encore une page à charger
    hasMore = data.pagination?.hasMore === true;
    cursor = data.pagination?.endCursor ? String(data.pagination.endCursor) : undefined;
  }

  return { lessons: allLessons, count: allLessons.length };
}

// ===============================
// TYPES MEMBERSTACK INTERNES
// ===============================

// Structure d'un enregistrement renvoyé par la Data Table Memberstack
type DataRecord = {
  id: string;
  createdAt: string;
  data: {
    content_type: string;
    course_iwid: string;
    chapter_iwid: string;
    module_iwid: string;
    item_iwid: string;
    item_atid: string;
    title?: string;
    completed_at: string;
  };
};

// Toutes les méthodes Memberstack utilisées dans ce projet
type MemberstackDom = {
  getCurrentMember: () => Promise<{
    data: {
      id: string;
      memberDATAS?: { customFields?: Record<string, string> };
    } | null;
  }>;
  queryDataRecords: (args: { table: string; query: Record<string, unknown> }) => Promise<{
    data: {
      records: DataRecord[];
      pagination?: { hasMore: boolean; endCursor?: string | number };
      _count?: number;
    };
  }>;
  createDataRecord: (args: {
    table: string;
    data: Record<string, unknown>;
  }) => Promise<{ data: { id: string } }>;
  deleteDataRecord: (args: { recordId: string }) => Promise<void>;
  updateMemberJSON: (args: { json: Record<string, unknown> }) => Promise<void>;
};

// Déclare $memberstackDom comme propriété globale de window
declare global {
  interface Window {
    $memberstackDom: MemberstackDom;
  }
}
