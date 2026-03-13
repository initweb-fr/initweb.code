/**
 * Tracker de progression — Orchestrateur principal
 *
 * Sauvegarde en deux endroits :
 *  - Memberstack Data Tables  → source de vérité (production)
 *  - Memberstack Member JSON  → copie rapide (développement)
 *
 * Hiérarchie : Course → Chapter → Module → Lesson
 */

import { storageKeyLastLessonIWID, storageKeyLastLessonURL } from '$global/storageKeys';

import type { CompletedLesson, ProgressContext } from './utils';
import {
  getCompletedLessonsList,
  getPageContext,
  getProgressStats,
  hideLoader,
  logProgress,
  markCompletedLessons,
  setupClickListeners,
  showLoader,
  trackLastLesson,
  updateLessonState,
} from './utils';

// ===============================
// TYPES
// ===============================

// Un "Member" représente l'utilisateur connecté sur Memberstack
type Member = {
  id?: string;
  memberJSON?: Record<string, unknown>;
  memberDATAS?: { customFields?: Record<string, string> };
};

// ===============================
// MÉMOIRE LOCALE (CACHE)
// ===============================

// On garde en mémoire les leçons terminées pour éviter d'interroger
// le serveur à chaque clic. Clé = itemIWID, Valeur = infos de la leçon.
const completedLessonsCache: Record<string, CompletedLesson> = {};

// Copie locale du memberJSON pour ne pas le relire à chaque clic
let memberJSONCache: Record<string, unknown> = {};

// ===============================
// DÉMARRAGE
// ===============================

export async function initProgressTracking(member: Member) {
  try {
    // Vérifier qu'un membre est bien connecté
    const memberMSID = member?.id;
    if (!memberMSID) {
      console.log('❌ Aucun membre MS connecté');
      return;
    }

    // Lire les informations de la page (cours, chapitre, module)
    const ctx = getPageContext();
    if (!ctx) return; // getPageContext() logue déjà l'erreur

    // Mémoriser la dernière leçon visitée (pour reprendre où on s'est arrêté)
    trackLastLesson(ctx.courseIWID);
    memberJSONCache = { ...(member.memberJSON || {}) };

    // Charger la liste des leçons déjà terminées depuis le serveur
    const completedLessonsData = await getCompletedLessonsList(ctx.courseIWID);
    const completedLessons = completedLessonsData.lessons;

    // Remplir la mémoire locale avec les leçons récupérées
    for (const lesson of completedLessons) {
      completedLessonsCache[lesson.itemIWID] = lesson;
    }

    // Mettre à jour l'affichage de la page (coches, stats...)
    const stats = getProgressStats(completedLessonsData.count);
    const itemATIDs = completedLessons.map((l) => l.itemATID).filter(Boolean);
    markCompletedLessons(itemATIDs);
    logProgress(stats);

    // Écouter les clics sur les boutons / cases à cocher
    setupClickListeners(memberMSID, (element) => handleClick(element, member, ctx));

    // Marquer automatiquement la leçon comme terminée quand la vidéo atteint 90%
    watchVideoProgress(member, ctx);

    console.log(`✅ Progression démarrée — ${ctx.contentType} / ${ctx.courseIWID}`);
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
  }
}

// ===============================
// GESTION DES CLICS
// ===============================

async function handleClick(element: HTMLElement, member: Member, ctx: ProgressContext) {
  // Récupérer les identifiants de la leçon cliquée
  const itemATID = element.dataset.iwItemAtid || '';
  const itemIWID = element.dataset.iwItemIwid || '';
  const itemTitle = element.dataset.iwItemTitle || '';

  // Arrêter si les identifiants sont manquants
  if (!itemATID || !itemIWID) return;

  // Déterrminer l'action : si la leçon était déjà vue, on la décoche, sinon on la coche
  const isWatched = element.dataset.iwWatched === 'true';
  const isCompleted = !isWatched;

  // Afficher le loader et mettre à jour l'UI immédiatement (sans attendre le serveur)
  showLoader(element, itemATID);
  updateLessonState(itemATID, isCompleted);

  try {
    if (isCompleted) {
      // ── MARQUER COMME TERMINÉ ──────────────────────────────────────

      // Sauvegarder dans la Data Table (source principale)
      const dataTableResult = await saveToDataTable(itemIWID, itemATID, itemTitle, ctx);

      // Sauvegarder aussi dans le memberJSON (copie de développement)
      await saveToMemberJSON(itemIWID, itemATID, itemTitle, ctx, true);

      // Ajouter la leçon dans la mémoire locale
      completedLessonsCache[itemIWID] = {
        itemIWID,
        itemATID,
        title: itemTitle,
        completedAt: new Date().toISOString(),
        recordId: dataTableResult.recordId,
      };

      console.log(`✅ "${itemTitle}" complété — record: ${dataTableResult.recordId}`);
    } else {
      // ── DÉCOCHER ──────────────────────────────────────────────────

      // Chercher les infos de la leçon dans la mémoire locale
      let cached = completedLessonsCache[itemIWID];

      // Si la mémoire est vide (ex: rechargement de page), on recharge depuis le serveur
      if (!cached?.recordId) {
        console.warn('⚠️ recordId absent du cache, relecture Data Table...');
        const fresh = await getCompletedLessonsList(ctx.courseIWID);
        for (const l of fresh.lessons) {
          completedLessonsCache[l.itemIWID] = l;
        }
        cached = completedLessonsCache[itemIWID];
      }

      // Si on ne trouve toujours pas le record, on annule
      if (!cached?.recordId) {
        console.error('❌ Record introuvable, annulation');
        updateLessonState(itemATID, true); // Annuler le changement visuel
        return;
      }

      // Supprimer le record dans Memberstack
      await window.$memberstackDom.deleteDataRecord({ recordId: cached.recordId });

      // Mettre à jour aussi le memberJSON
      await saveToMemberJSON(itemIWID, itemATID, itemTitle, ctx, false);

      // Retirer la leçon de la mémoire locale
      delete completedLessonsCache[itemIWID];
      console.log(`↩️ "${itemTitle}" décoché — record supprimé: ${cached.recordId}`);
    }

    // Recalculer et afficher les stats
    const completedCount = Object.keys(completedLessonsCache).length;
    logProgress(getProgressStats(completedCount));
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    updateLessonState(itemATID, isWatched); // Annuler le changement visuel en cas d'erreur
  } finally {
    hideLoader(element, itemATID);
  }
}

// ===============================
// SAUVEGARDE DATA TABLE
// ===============================

async function saveToDataTable(
  itemIWID: string,
  itemATID: string,
  itemTitle: string,
  ctx: ProgressContext
): Promise<{ recordId: string }> {
  const { data } = await window.$memberstackDom.createDataRecord({
    table: 'progress',
    data: {
      content_type: ctx.contentType,
      course_iwid: ctx.courseIWID,
      chapter_iwid: ctx.chapterIWID,
      module_iwid: ctx.moduleIWID,
      item_iwid: itemIWID,
      item_atid: itemATID,
      title: itemTitle,
      completed_at: new Date().toISOString(),
    },
  });
  console.log('💾 [Data Table] sauvegardé');
  return { recordId: data.id };
}

// ===============================
// SAUVEGARDE MEMBER JSON (debug)
// ===============================

/**
 * Structure dans le memberJSON :
 * {
 *   [courseIWID]: {
 *     lastLessonURL,
 *     lastLessonIWID,
 *     courseStats: { total, completed, percentage },
 *     lessonCompleted: {
 *       [itemIWID]: { itemATID, title, chapterIWID, moduleIWID, completedAt }
 *     }
 *   }
 * }
 */
async function saveToMemberJSON(
  itemIWID: string,
  itemATID: string,
  itemTitle: string,
  ctx: ProgressContext,
  isCompleted: boolean
): Promise<void> {
  try {
    // Récupérer la progression existante pour ce cours (ou un objet vide si aucune)
    const courseProgress = (memberJSONCache[ctx.courseIWID] as Record<string, unknown>) || {};
    const lessonCompleted = {
      ...((courseProgress['lessonCompleted'] as Record<string, unknown>) || {}),
    };

    // Ajouter ou supprimer la leçon selon l'action
    if (isCompleted) {
      lessonCompleted[itemIWID] = {
        itemATID,
        title: itemTitle,
        chapterIWID: ctx.chapterIWID,
        moduleIWID: ctx.moduleIWID,
        completedAt: new Date().toISOString(),
      };
    } else {
      delete lessonCompleted[itemIWID];
    }

    // Calculer les nouvelles stats
    const completedCount = Object.keys(lessonCompleted).length;
    const stats = getProgressStats(completedCount);

    // Construire l'objet de progression mis à jour
    const newCourseProgress = {
      lastLessonURL: localStorage.getItem(storageKeyLastLessonURL(ctx.courseIWID)),
      lastLessonIWID: localStorage.getItem(storageKeyLastLessonIWID(ctx.courseIWID)),
      courseStats: { ...stats, completed: completedCount },
      lessonCompleted,
    };

    // Mettre à jour la mémoire locale
    memberJSONCache = { ...memberJSONCache, [ctx.courseIWID]: newCourseProgress };

    // Sauvegarder sur Memberstack
    await window.$memberstackDom.updateMemberJSON({ json: memberJSONCache });
    console.log(`💾 [Member JSON] sauvegardé (debug) — cours: ${ctx.courseIWID}`);
  } catch (error) {
    console.warn('⚠️ [Member JSON] échec sauvegarde (non bloquant):', error);
  }
}
