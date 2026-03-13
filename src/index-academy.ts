import { animateAcaPanels } from 'src/academy/animate/animatePanels';
import { animateSchemes } from 'src/--global/themes/switchThemes';
import { scrollToCurrentLink } from 'src/academy/animate/animateTOC';
import { initProgressTracking } from 'src/academy/progress/lessonProgress';
import { manageStackedNotifications } from 'src/--global/display/stackedNotification';
import { saveNavigationInfos } from 'src/--global/tracking/navigation';

import { getMemberJSON } from './--global/auth/data';
//import { sendFunnelDatasToWebhook } from 'src/academy/tracking/transmit';

declare global {
  interface Window {
    $memberstackReady?: boolean;
    fsAttributes: Array<unknown>;
    Webflow?: Array<() => void>;
    MemberStack?: {
      onReady: Promise<{
        member: { id: string; email: string } | null;
      }>;
    };
    sendFunnelDatasToWebhook?: () => void;
  }
}

// Initialisation de Memberstack
window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
  if (member) {
    // Ajout de l'attribut data-memberstack-logged-in au body
    document.body.setAttribute('data-memberstack-logged-in', 'true');

    // Affichage des données membre dans la console
    console.log('Membre connecté sur le site :', member.id);
    console.log('Membre connecté (Datas) :', member);

    // On attend le memberJSON avant de lancer le tracker
    // car tracker.ts en a besoin pour initialiser memberJSONCache
    getMemberJSON().then((memberJSON: { data?: unknown } | null) => {
      console.log('Membre connecté (JSON) :', memberJSON?.data);
      initProgressTracking({
        ...member,
        memberJSON: (memberJSON?.data as Record<string, unknown>) ?? {},
      });
    });
  }
});

// Initialisation de Webflow et du reste des fonctions
window.Webflow ||= [];
window.Webflow.push(() => {
  // Fonctionnalités de tracking
  saveNavigationInfos();
  // ⚠️ saveFunnelDatas();

  // Fonctionnalités de gestion des données utilisateur
  // ⚠️ saveUserLocalDatas();
  // ⚠️ fillUserLocalDatas();

  // Fonctions d'animation
  animateSchemes();
  animateAcaPanels();

  // Fonctions d'interface utilisateur
  manageStackedNotifications();

  // Fonctions d'interface utilisateur
  if (window.location.pathname.includes('/formations/modules')) {
    scrollToCurrentLink();
  }
  if (window.location.pathname.includes('/bienvenue')) {
    if (typeof window.sendFunnelDatasToWebhook === 'function') {
      window.sendFunnelDatasToWebhook();
    }
  }
});
