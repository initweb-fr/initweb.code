/**
 * lessonProgress.ts — Orchestrateur de la progression
 * ──────────────────────────────────────────────────────
 * Ce fichier est le chef d'orchestre : il coordonne tout ce qui se passe
 * sur une page leçon quand un membre interagit avec sa progression.
 *
 * FLOW PRINCIPAL :
 *  1. initProgressTracking()  →  chargement de la page leçon
 *     - Récupère les leçons vues depuis la Data Table
 *     - Affiche les coches dans la page
 *     - Met à jour le localStorage avec le total de leçons
 *     - Active les boutons / checkboxes
 *
 *  2. handleClick()  →  clic sur un bouton ou une checkbox
 *     - Coche   : Data Table → cache → localStorage → Member JSON
 *     - Décoche : Data Table → cache → localStorage → Member JSON
 *
 * OÙ SONT STOCKÉES LES DONNÉES :
 *  - Data Table Memberstack  → source de vérité (serveur)
 *  - localStorage            → cache rapide, accessible sur toutes les pages
 *  - Member JSON Memberstack → copie serveur du localStorage
 */

import type { CompletedLesson, ProgressContext } from './utils';
import {
  addLessonToStorage,
  getCompletedLessonsList,
  getPageContext,
  getProgressStats,
  hideLoader,
  logProgress,
  markCompletedLessons,
  removeLessonFromStorage,
  setupClickListeners,
  showLoader,
  syncCoursesProgressToMemberJSON,
  trackLastLesson,
  updateCourseProgressTotal,
  updateLessonState,
} from './utils';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

// Représente le membre connecté
type Member = {
  id?: string;
  memberJSON?: Record<string, unknown>;
  memberDATAS?: { customFields?: Record<string, string> };
};

// ─────────────────────────────────────────────
// CACHE EN MÉMOIRE
// Ces variables sont gardées en RAM pendant toute la session de la page.
// Elles évitent de relire la Data Table à chaque clic.
// ─────────────────────────────────────────────

// Leçons vues : clé = itemIWID, valeur = données de la leçon (dont le recordId pour la supprimer)
const completedLessonsCache: Record<string, CompletedLesson> = {};

// Copie du Member JSON : permet de mettre à jour sans écraser les autres champs
let memberJSONCache: Record<string, unknown> = {};

// ─────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────

/**
 * Point d'entrée sur une page leçon.
 * À appeler une seule fois, dès que le membre est connecté.
 */
export async function initProgressTracking(member: Member) {
  try {
    const memberMSID = member?.id;
    if (!memberMSID) {
      console.log('❌ Aucun membre MS connecté');
      return;
    }

    // Lire le contexte de la page (quel cours, quel chapitre…)
    const ctx = getPageContext();
    if (!ctx) return;

    // Sauvegarder la leçon en cours comme "dernière leçon visitée"
    trackLastLesson(ctx.courseIWID);
    memberJSONCache = { ...(member.memberJSON || {}) };

    // Charger les leçons déjà vues depuis la Data Table Memberstack
    const completedLessonsData = await getCompletedLessonsList(ctx.courseIWID);
    const completedLessons = completedLessonsData.lessons;

    // Remplir le cache mémoire
    for (const lesson of completedLessons) {
      completedLessonsCache[lesson.itemIWID] = lesson;
    }

    // Mettre à jour l'affichage (coches, stats dans la console)
    const stats = getProgressStats(completedLessonsData.count);
    markCompletedLessons(completedLessons.map((l) => l.itemATID).filter(Boolean));
    logProgress(stats);

    // Maintenant qu'on a le DOM complet, on peut calculer le total de leçons
    updateCourseProgressTotal(ctx.courseIWID);

    // Activer les boutons et checkboxes de la page
    setupClickListeners(memberMSID, (element) => handleClick(element, member, ctx));

    // Marquer automatiquement la leçon comme vue quand la vidéo atteint 90%
    watchVideoProgress(member, ctx);

    console.log(`✅ Progression démarrée — ${ctx.contentType} / ${ctx.courseIWID}`);
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
  }
}

// ─────────────────────────────────────────────
// GESTION DES CLICS
// ─────────────────────────────────────────────

/**
 * Appelé à chaque clic sur un bouton ou une checkbox.
 * Détermine si on coche ou décoche, puis met à jour les 4 couches dans l'ordre.
 */
async function handleClick(element: HTMLElement, member: Member, ctx: ProgressContext) {
  const itemATID = element.dataset.iwItemAtid || '';
  const itemIWID = element.dataset.iwItemIwid || '';
  const itemTitle = element.dataset.iwItemTitle || '';

  if (!itemATID || !itemIWID) return;

  // Si la leçon était déjà vue → on décoche. Sinon → on coche.
  const isWatched = element.dataset.iwWatched === 'true';
  const isCompleted = !isWatched;

  // Retour visuel immédiat (sans attendre le serveur)
  showLoader(element, itemATID);
  updateLessonState(itemATID, isCompleted);

  try {
    if (isCompleted) {
      // ── COCHER UNE LEÇON ────────────────────────────────────────

      // 1. Data Table (source de vérité)
      const dataTableResult = await saveToDataTable(itemIWID, itemATID, itemTitle, ctx);
      const completedAt = new Date().toISOString();

      // 2. Cache mémoire (pour retrouver le recordId si on décoche plus tard)
      completedLessonsCache[itemIWID] = {
        itemIWID,
        itemATID,
        title: itemTitle,
        completedAt,
        recordId: dataTableResult.recordId,
      };

      // 3. localStorage
      addLessonToStorage(ctx.courseIWID, itemIWID, {
        title: itemTitle,
        lessonATID: itemATID,
        completedAt,
      });

      // 4. Member JSON
      await syncProgressToMemberJSON();

      console.log(`✅ "${itemTitle}" complété — record: ${dataTableResult.recordId}`);
    } else {
      // ── DÉCOCHER UNE LEÇON ──────────────────────────────────────

      // Retrouver le recordId dans le cache (nécessaire pour supprimer le record)
      let cached = completedLessonsCache[itemIWID];

      // Si le cache est vide (ex: rechargement de page), on le recharge depuis le serveur
      if (!cached?.recordId) {
        console.warn('⚠️ recordId absent du cache, relecture Data Table...');
        const fresh = await getCompletedLessonsList(ctx.courseIWID);
        for (const l of fresh.lessons) completedLessonsCache[l.itemIWID] = l;
        cached = completedLessonsCache[itemIWID];
      }

      if (!cached?.recordId) {
        console.error('❌ Record introuvable, annulation');
        updateLessonState(itemATID, true); // on annule le changement visuel
        return;
      }

      // 1. Data Table (source de vérité)
      await window.$memberstackDom.deleteDataRecord({ recordId: cached.recordId });

      // 2. Cache mémoire
      delete completedLessonsCache[itemIWID];

      // 3. localStorage
      removeLessonFromStorage(ctx.courseIWID, itemIWID);

      // 4. Member JSON
      await syncProgressToMemberJSON();

      console.log(`↩️ "${itemTitle}" décoché — record supprimé: ${cached.recordId}`);
    }

    // Afficher les stats à jour dans la console
    logProgress(getProgressStats(Object.keys(completedLessonsCache).length));
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    updateLessonState(itemATID, isWatched); // annuler le changement visuel en cas d'erreur
  } finally {
    hideLoader(element, itemATID);
  }
}

// ─────────────────────────────────────────────
// SAUVEGARDE DATA TABLE
// ─────────────────────────────────────────────

/** Crée un enregistrement dans la Data Table "progress" de Memberstack. */
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

// ─────────────────────────────────────────────
// SYNCHRONISATION MEMBER JSON
// ─────────────────────────────────────────────

/**
 * Copie le localStorage dans le Member JSON Memberstack.
 * Met aussi à jour memberJSONCache pour les prochains appels.
 */
async function syncProgressToMemberJSON(): Promise<void> {
  memberJSONCache = await syncCoursesProgressToMemberJSON(memberJSONCache);
}
