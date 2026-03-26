/**
 * index-academy.ts — Point d'entrée de l'espace Academy
 * ────────────────────────────────────────────────────────
 * Ce fichier est chargé sur toutes les pages de l'Academy.
 * Il initialise les fonctionnalités dans le bon ordre.
 *
 * ORDRE D'INITIALISATION (membre connecté) :
 *  1. Memberstack confirme l'identité du membre
 *  2. En parallèle :
 *     - Lecture du Member JSON (pour préserver ses autres champs)
 *     - Synchronisation Data Table → localStorage (progression)
 *  3. Quand les deux sont prêts :
 *     - Mise à jour du Member JSON avec la progression
 *     - Lancement du tracker (pages leçon uniquement)
 *
 * FONCTIONS ACTIVÉES SUR TOUTES LES PAGES :
 *  - Thème clair/sombre
 *  - Panels latéraux (menu, TOC…)
 *  - Notifications
 *  - Tracking de navigation
 */

import { manageStackedNotifications } from 'src/--global/display/stackedNotification';
import { animateSchemes } from 'src/--global/themes/switchThemes';
import { saveNavigationInfos } from 'src/--global/tracking/navigation';
import { initSignupPlan } from 'src/academy/auth/signup';
import { animateAcaPanels } from 'src/academy/display/panels';
import { renderProgressGraphs } from 'src/academy/display/progressGraph';
import { scrollToCurrentLink } from 'src/academy/display/toc';
import { initProgressTracking } from 'src/academy/progress/lessonProgress';
import {
  syncAllCoursesProgressToStorage,
  syncCoursesProgressToMemberJSON,
} from 'src/academy/progress/utils';

import { getMemberJSON } from './--global/auth/data';

declare global {
  interface Window {
    $memberstackReady?: boolean;
    fsAttributes: Array<unknown>;
    Webflow?: Array<() => void>;
    MemberStack?: {
      onReady: Promise<{ member: { id: string; email: string } | null }>;
    };
    sendFunnelDatasToWebhook?: () => void;
  }
}

// ─────────────────────────────────────────────
// INITIALISATION MEMBERSTACK
// ─────────────────────────────────────────────

window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
  if (!member) return;

  // Signaler à Webflow que le membre est connecté (utile pour afficher/masquer des éléments)
  document.body.setAttribute('data-memberstack-logged-in', 'true');
  console.log('Membre connecté :', member.id);

  // On lance les deux opérations en parallèle pour gagner du temps :
  //  - getMemberJSON      : lit les données existantes du Member JSON
  //  - syncAllCourses...  : lit la Data Table et écrit dans le localStorage
  Promise.all([getMemberJSON(), syncAllCoursesProgressToStorage()]).then(([memberJSON]) => {
    const memberJSONData = (memberJSON?.data as Record<string, unknown>) ?? {};
    console.log('Member JSON :', memberJSONData);

    // Maintenant que le localStorage est à jour, on le copie dans le Member JSON
    syncCoursesProgressToMemberJSON(memberJSONData);

    // Afficher les graphes de progression (localStorage synchronisé)
    renderProgressGraphs();

    // Sur les pages leçon, on lance le tracker de progression
    initProgressTracking({ ...member, memberJSON: memberJSONData });
  });
});

// ─────────────────────────────────────────────
// INITIALISATION WEBFLOW
// Fonctions activées sur toutes les pages Academy
// ─────────────────────────────────────────────

window.Webflow ||= [];
window.Webflow.push(() => {
  saveNavigationInfos();
  animateSchemes();
  animateAcaPanels();
  manageStackedNotifications();

  // Fonctions spécifiques à certaines pages
  if (window.location.pathname.includes('/formations/modules')) {
    scrollToCurrentLink();
  }
  if (window.location.pathname.includes('/log/inscription')) {
    initSignupPlan();
  }
  if (window.location.pathname.includes('/bienvenue')) {
    if (typeof window.sendFunnelDatasToWebhook === 'function') {
      window.sendFunnelDatasToWebhook();
    }
  }
});
