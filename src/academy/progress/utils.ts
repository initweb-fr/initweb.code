/**
 * utils.ts — Boîte à outils de la progression
 * ─────────────────────────────────────────────
 * Ce fichier contient toutes les fonctions de support utilisées
 * par lessonProgress.ts pour gérer la progression d'un membre.
 *
 * RÔLES DE CE FICHIER :
 *  1. Lire le contexte de la page (quel cours, quel chapitre…)
 *  2. Mettre à jour l'apparence de la page (coches, loaders…)
 *  3. Lire et écrire la progression dans le localStorage
 *  4. Lire les leçons vues depuis la Data Table Memberstack
 *  5. Synchroniser le localStorage avec le Member JSON Memberstack
 *
 * STRUCTURE DU LOCALSTORAGE :
 *  Clé unique : "__iw_courses_progress"
 *  Valeur : un objet JSON avec une entrée par formation
 *  {
 *    "courseIWID": {
 *      lessonsCompleted : { lessonIWID: { title, lessonATID, completedAt } }
 *      progress         : { total, completed, percentage }
 *      lastLessonIWID   : "identifiant de la dernière leçon visitée"
 *      lastLessonURL    : "/edu/cours/xxx"
 *    }
 *  }
 *
 * ATTRIBUTS WEBFLOW ATTENDUS SUR LA PAGE :
 *  [data-iw-context]       → élément qui porte les IDs du cours/chapitre/module
 *  [data-iw-item-atid]     → ID Airtable d'une leçon
 *  [data-iw-item-iwid]     → ID interne d'une leçon
 *  [data-iw-item-title]    → Titre d'une leçon
 *  [data-iw-watched]       → "true" ou "false" (état visuel)
 *  [data-iw-trigger]       → "button" ou "checkbox" (éléments cliquables)
 *  [data-iw-loader]        → "true" ou "false" (état du loader)
 */

import {
  STORAGE_KEY_COURSES_PROGRESS,
  STORAGE_KEY_CURRENT_LESSON_IWID,
} from '$global/storageKeys';

// ─────────────────────────────────────────────
// TYPES — Structures de données
// ─────────────────────────────────────────────

// Données d'une leçon visionnée (stockées dans le localStorage)
export type LessonProgressEntry = {
  title: string;
  lessonATID: string; // ID Airtable, utilisé pour mettre à jour l'affichage Webflow
  completedAt: string; // Date ISO 8601 : "2026-03-26T10:00:00.000Z"
};

// Progression complète d'une formation (stockée dans le localStorage)
export type CourseProgressData = {
  lessonsCompleted: Record<string, LessonProgressEntry>; // clé = lessonIWID
  progress: {
    total: number | null; // null tant qu'on n'a pas chargé une page avec la liste complète
    completed: number;
    percentage: number; // 0 si total est inconnu
  };
  lastLessonIWID: string; // dernière leçon visitée par le membre
  lastLessonURL: string;  // URL de cette leçon (pour le bouton "reprendre")
};

// Contexte de la page courante (lu depuis [data-iw-context])
export type ProgressContext = {
  contentType: string;
  courseIWID: string;
  chapterIWID: string;
  moduleIWID: string;
};

// Une leçon récupérée depuis la Data Table Memberstack
export type CompletedLesson = {
  itemIWID: string;
  itemATID: string;
  title: string;
  completedAt: string;
  recordId: string; // ID du record dans la Data Table (nécessaire pour le supprimer)
};

// Réponse de getCompletedLessonsList()
export type CompletedLessonsList = {
  lessons: CompletedLesson[];
  count: number;
};

// ─────────────────────────────────────────────
// CONTEXTE DE PAGE
// ─────────────────────────────────────────────

/**
 * Lit les IDs du cours/chapitre/module depuis l'élément [data-iw-context] de la page.
 * Retourne null si l'élément est absent ou si un attribut est manquant.
 */
export function getPageContext(): ProgressContext | null {
  const ctx = document.querySelector('[data-iw-context]') as HTMLElement | null;

  if (!ctx) {
    console.error('❌ Élément [data-iw-context] introuvable sur la page');
    return null;
  }

  const contentType = ctx.dataset.iwContentType || '';
  const courseIWID = ctx.dataset.iwCourseIwid || '';
  const chapterIWID = ctx.dataset.iwChapterIwid || '';
  const moduleIWID = ctx.dataset.iwModuleIwid || '';

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

// ─────────────────────────────────────────────
// AFFICHAGE — Coches et loaders
// ─────────────────────────────────────────────

/**
 * Coche visuellement les leçons déjà vues en passant data-iw-watched="true".
 * C'est cet attribut que Webflow surveille pour appliquer les styles "complété".
 */
export function markCompletedLessons(itemATIDs: string[]) {
  for (const itemATID of itemATIDs) {
    const elements = Array.from(document.querySelectorAll(`[data-iw-item-atid="${itemATID}"]`));
    for (const el of elements) {
      (el as HTMLElement).dataset.iwWatched = 'true';
    }
  }
}

/**
 * Met à jour l'état visuel d'une leçon (cochée ou décochée).
 * Utilisé pour un retour visuel immédiat avant même la réponse du serveur.
 */
export function updateLessonState(itemATID: string, isCompleted: boolean) {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-iw-item-atid="${itemATID}"]`)
  );
  for (const el of elements) {
    el.dataset.iwWatched = isCompleted ? 'true' : 'false';
  }
}

/** Affiche le loader sur l'élément cliqué (et sur la checkbox liée si c'est un bouton). */
export function showLoader(element: HTMLElement, itemATID: string) {
  element.dataset.iwLoader = 'true';

  if (element.dataset.iwTrigger === 'button') {
    const checkboxes = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-iw-trigger="checkbox"][data-iw-item-atid="${itemATID}"]`
      )
    );
    for (const checkbox of checkboxes) checkbox.dataset.iwLoader = 'true';
  }
}

/** Masque le loader sur l'élément cliqué (et sur la checkbox liée si c'est un bouton). */
export function hideLoader(element: HTMLElement, itemATID: string) {
  element.dataset.iwLoader = 'false';

  if (element.dataset.iwTrigger === 'button') {
    const checkboxes = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-iw-trigger="checkbox"][data-iw-item-atid="${itemATID}"]`
      )
    );
    for (const checkbox of checkboxes) checkbox.dataset.iwLoader = 'false';
  }
}

// ─────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────

/**
 * Calcule les stats de progression à partir du nombre de leçons vues.
 * Le total est compté via les checkboxes [data-iw-trigger="checkbox"] présentes dans le DOM.
 * (On exclut les boutons pour ne pas fausser le compte.)
 */
export function getProgressStats(completedCount: number) {
  const total = document.querySelectorAll('[data-iw-trigger="checkbox"]').length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  return { total, completed: completedCount, percentage };
}

/** Affiche les stats de progression dans la console. */
export function logProgress(stats: { completed: number; total: number; percentage: number }) {
  console.log(`📊 Progression: ${stats.completed}/${stats.total} (${stats.percentage}%)`);
}

// ─────────────────────────────────────────────
// ÉCOUTE DES CLICS
// ─────────────────────────────────────────────

/**
 * Attache un écouteur de clic sur chaque élément [data-iw-trigger] de la page.
 * Quand l'utilisateur clique, la fonction onProgressClick est appelée.
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

// ─────────────────────────────────────────────
// DERNIÈRE LEÇON VISITÉE
// ─────────────────────────────────────────────

/**
 * Enregistre l'URL et l'ID de la leçon en cours dans le localStorage.
 * Appelé à chaque chargement d'une page leçon.
 * Permet d'afficher un bouton "reprendre là où vous en étiez".
 */
export function trackLastLesson(courseIWID: string) {
  const all = readAllCoursesProgress();
  const existing = all[courseIWID];

  all[courseIWID] = {
    lessonsCompleted: existing?.lessonsCompleted ?? {},
    progress: existing?.progress ?? { total: null, completed: 0, percentage: 0 },
    lastLessonURL: window.location.pathname || '',
    lastLessonIWID: localStorage.getItem(STORAGE_KEY_CURRENT_LESSON_IWID) ?? '',
  };

  localStorage.setItem(STORAGE_KEY_COURSES_PROGRESS, JSON.stringify(all));
}

// ─────────────────────────────────────────────
// LECTURE DEPUIS LA DATA TABLE MEMBERSTACK
// ─────────────────────────────────────────────

/**
 * Récupère depuis Memberstack toutes les leçons vues pour un cours donné.
 * Gère automatiquement la pagination (si > 100 leçons, plusieurs requêtes sont faites).
 */
export async function getCompletedLessonsList(courseIWID: string): Promise<CompletedLessonsList> {
  const ms = window.$memberstackDom;
  const allLessons: CompletedLesson[] = [];

  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore) {
    const query: Record<string, unknown> = {
      where: { course_iwid: { equals: courseIWID } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    };
    if (cursor) query.after = cursor;

    const { data } = await ms.queryDataRecords({ table: 'progress', query });

    for (const record of data.records) {
      allLessons.push({
        itemIWID: record.data.item_iwid,
        itemATID: record.data.item_atid,
        title: record.data.title || '',
        completedAt: record.data.completed_at,
        recordId: record.id,
      });
    }

    hasMore = data.pagination?.hasMore === true;
    cursor = data.pagination?.endCursor ? String(data.pagination.endCursor) : undefined;
  }

  return { lessons: allLessons, count: allLessons.length };
}

// ─────────────────────────────────────────────
// LOCALSTORAGE — Lecture / Écriture
// ─────────────────────────────────────────────

/** Lit l'objet complet depuis le localStorage (usage interne). */
function readAllCoursesProgress(): Record<string, CourseProgressData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSES_PROGRESS);
    return raw ? (JSON.parse(raw) as Record<string, CourseProgressData>) : {};
  } catch {
    return {};
  }
}

/** Met à jour une formation et réécrit tout le JSON (usage interne). */
function writeCourseProgress(courseIWID: string, data: CourseProgressData): void {
  const all = readAllCoursesProgress();
  all[courseIWID] = data;
  localStorage.setItem(STORAGE_KEY_COURSES_PROGRESS, JSON.stringify(all));
}

/** Calcule le pourcentage de progression (retourne 0 si le total est inconnu). */
function calcPercentage(completed: number, total: number | null): number {
  return total && total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Lit la progression d'une formation depuis le localStorage.
 * Retourne null si la formation n'a pas encore été synchronisée.
 *
 * Exemple d'utilisation sur une page catalogue :
 *   const data = getCourseProgressFromStorage('masterclass-webflow');
 *   console.log(data.progress.percentage); // → 45
 */
export function getCourseProgressFromStorage(courseIWID: string): CourseProgressData | null {
  return readAllCoursesProgress()[courseIWID] ?? null;
}

/**
 * Lit la progression de toutes les formations depuis le localStorage.
 * Utile sur une page catalogue pour afficher plusieurs barres de progression.
 */
export function getAllCoursesProgressFromStorage(): Record<string, CourseProgressData> {
  return readAllCoursesProgress();
}

/**
 * Synchronise toutes les leçons vues depuis la Data Table vers le localStorage.
 * C'est le point de départ : appelé dès qu'un membre se connecte, sur toutes les pages.
 *
 * Ce que ça fait :
 *  - Lit TOUS les enregistrements de la table "progress" du membre
 *  - Groupe les leçons par formation
 *  - Écrit le résultat dans __iw_courses_progress
 *  - Préserve total et lastLesson* s'ils étaient déjà connus
 */
export async function syncAllCoursesProgressToStorage(): Promise<void> {
  const ms = window.$memberstackDom;

  // On va regrouper les leçons vues par formation
  const lessonsByCourse: Record<string, Record<string, LessonProgressEntry>> = {};

  let hasMore = true;
  let cursor: string | undefined = undefined;

  // On lit toutes les pages de résultats (100 leçons max par requête)
  while (hasMore) {
    const query: Record<string, unknown> = { orderBy: { createdAt: 'asc' }, take: 100 };
    if (cursor) query.after = cursor;

    const { data } = await ms.queryDataRecords({ table: 'progress', query });

    for (const record of data.records) {
      const courseIWID = record.data.course_iwid;
      const lessonIWID = record.data.item_iwid;
      if (!courseIWID || !lessonIWID) continue;

      lessonsByCourse[courseIWID] ??= {};
      lessonsByCourse[courseIWID][lessonIWID] = {
        title: record.data.title ?? '',
        lessonATID: record.data.item_atid,
        completedAt: record.data.completed_at,
      };
    }

    hasMore = data.pagination?.hasMore === true;
    cursor = data.pagination?.endCursor ? String(data.pagination.endCursor) : undefined;
  }

  // On reconstruit le JSON complet en une seule écriture
  const existing = readAllCoursesProgress();
  const updated: Record<string, CourseProgressData> = { ...existing };

  for (const [courseIWID, lessonsCompleted] of Object.entries(lessonsByCourse)) {
    const prev = existing[courseIWID];
    const completed = Object.keys(lessonsCompleted).length;
    const total = prev?.progress.total ?? null; // on garde le total s'il était déjà connu

    updated[courseIWID] = {
      lessonsCompleted,
      progress: { total, completed, percentage: calcPercentage(completed, total) },
      lastLessonIWID: prev?.lastLessonIWID ?? '',
      lastLessonURL: prev?.lastLessonURL ?? '',
    };
  }

  localStorage.setItem(STORAGE_KEY_COURSES_PROGRESS, JSON.stringify(updated));

  console.log(
    '💾 [Progression] localStorage synchronisé :',
    Object.fromEntries(Object.entries(lessonsByCourse).map(([id, l]) => [id, Object.keys(l).length]))
  );
}

/**
 * Met à jour le total de leçons et le pourcentage pour une formation.
 * Appelé sur les pages qui affichent la liste complète des leçons (DOM disponible).
 * Le total est compté via les checkboxes [data-iw-trigger="checkbox"] dans la page.
 */
export function updateCourseProgressTotal(courseIWID: string): void {
  const total = document.querySelectorAll('[data-iw-trigger="checkbox"]').length;
  if (total === 0) return;

  const existing = getCourseProgressFromStorage(courseIWID);
  const completed = existing?.progress.completed ?? 0;

  writeCourseProgress(courseIWID, {
    lessonsCompleted: existing?.lessonsCompleted ?? {},
    progress: { total, completed, percentage: calcPercentage(completed, total) },
    lastLessonIWID: existing?.lastLessonIWID ?? '',
    lastLessonURL: existing?.lastLessonURL ?? '',
  });
}

/**
 * Ajoute une leçon dans le localStorage après qu'elle a été cochée.
 * Recalcule automatiquement completed et percentage.
 */
export function addLessonToStorage(
  courseIWID: string,
  lessonIWID: string,
  entry: LessonProgressEntry
): void {
  const existing = getCourseProgressFromStorage(courseIWID);
  const lessonsCompleted = { ...(existing?.lessonsCompleted ?? {}), [lessonIWID]: entry };
  const completed = Object.keys(lessonsCompleted).length;
  const total = existing?.progress.total ?? null;

  writeCourseProgress(courseIWID, {
    lessonsCompleted,
    progress: { total, completed, percentage: calcPercentage(completed, total) },
    lastLessonIWID: existing?.lastLessonIWID ?? '',
    lastLessonURL: existing?.lastLessonURL ?? '',
  });
}

/**
 * Retire une leçon du localStorage après qu'elle a été décochée.
 * Recalcule automatiquement completed et percentage.
 */
export function removeLessonFromStorage(courseIWID: string, lessonIWID: string): void {
  const existing = getCourseProgressFromStorage(courseIWID);
  if (!existing) return;

  const lessonsCompleted = { ...existing.lessonsCompleted };
  delete lessonsCompleted[lessonIWID];
  const completed = Object.keys(lessonsCompleted).length;

  writeCourseProgress(courseIWID, {
    ...existing,
    lessonsCompleted,
    progress: { ...existing.progress, completed, percentage: calcPercentage(completed, existing.progress.total) },
  });
}

// ─────────────────────────────────────────────
// MEMBER JSON MEMBERSTACK
// ─────────────────────────────────────────────

/**
 * Copie la progression du localStorage dans le Member JSON Memberstack.
 * Le Member JSON est une sauvegarde côté serveur, accessible depuis d'autres outils.
 *
 * On passe le memberJSON existant en paramètre pour ne pas écraser ses autres champs.
 * Retourne l'objet fusionné (pour mettre à jour le cache local).
 * Non bloquant : une erreur ici n'empêche pas le reste de fonctionner.
 */
export async function syncCoursesProgressToMemberJSON(
  existingMemberJSON: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const merged = { ...existingMemberJSON, courses_progress: getAllCoursesProgressFromStorage() };
  try {
    await window.$memberstackDom.updateMemberJSON({ json: merged });
    console.log('💾 [Member JSON] progression synchronisée');
  } catch (error) {
    console.warn('⚠️ [Member JSON] échec synchronisation (non bloquant):', error);
  }
  return merged;
}

// ─────────────────────────────────────────────
// TYPES INTERNES MEMBERSTACK
// (nécessaires pour que TypeScript comprenne les réponses de l'API)
// ─────────────────────────────────────────────

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

type MemberstackDom = {
  getCurrentMember: () => Promise<{
    data: { id: string; memberDATAS?: { customFields?: Record<string, string> } } | null;
  }>;
  queryDataRecords: (args: { table: string; query: Record<string, unknown> }) => Promise<{
    data: {
      records: DataRecord[];
      pagination?: { hasMore: boolean; endCursor?: string | number };
    };
  }>;
  createDataRecord: (args: {
    table: string;
    data: Record<string, unknown>;
  }) => Promise<{ data: { id: string } }>;
  deleteDataRecord: (args: { recordId: string }) => Promise<void>;
  updateMemberJSON: (args: { json: Record<string, unknown> }) => Promise<unknown>;
  getMemberJSON: () => Promise<{ data?: unknown } | null>;
  updateMember: (data: { customFields?: Record<string, unknown>; memberJSON?: unknown }) => Promise<void>;
  addPlan: (options: { planId: string }) => Promise<void>;
};

declare global {
  interface Window {
    $memberstackDom: MemberstackDom;
  }
}
