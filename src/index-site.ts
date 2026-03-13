//import { initFunnelDatas, initTransmitFunnelDatas } from 'src/site/tracking/funnel';
// Importation des fonctions V3
import { checkLinks } from 'src/---dev/checkLinks';
import { getMemberDatas, getMemberJSON } from 'src/--global/auth/data';
import { manageBanners } from 'src/--global/display/banner';
import { manageDropdowns } from 'src/--global/display/dropdown';
import { manageModals } from 'src/--global/display/modal';
import { managePageInfo } from 'src/--global/display/pageInfo';
import { manageStackedNotifications } from 'src/--global/display/stackedNotification';
import { manageTabs } from 'src/--global/display/tab';
import { saveNavigationInfos } from 'src/--global/tracking/navigation';
import { initBunnyPlayerBackground } from 'src/--global/video/backgroundVideo';
import { initBunnyPlayer } from 'src/--global/video/siteVideo';
import { animateMarquee } from 'src/site/animate/marquee';
import {
  animateNavDropDownOnResponsive,
  animateNavOnResponsive,
} from 'src/site/animate/navigation';
// Importation des fonctions d'affichage
import { sliderReviewsCards, sliderReviewsMarquee } from 'src/site/sliders/slidersReviews';
import { sliderTargetsCards } from 'src/site/sliders/slidersTargets';

// Déclaration des types globaux
declare global {
  interface Window {
    fsAttributes: Array<unknown>; // Attributs personnalisés pour le CMS
    Webflow?: Array<() => void>;
  }
}
// Initialisation de Memberstack
window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
  if (member) {
    // --- --- Ajout de l'attribut data-memberstack-logged-in au body --- ---
    document.body.setAttribute('data-memberstack-logged-in', 'true');
    // --- --- Affichage des Données Membre dans la Console --- ---
    console.log('Membre connecté sur le site :', member.id);
    console.log('Membre connecté (Datas) :', member);
    getMemberJSON().then((memberJSON: { data?: unknown } | null) => {
      console.log('Membre connecté (JSON) :', memberJSON?.data);
    });
    // --- --- Gestion des Fonctions liées au Membre connecté --- ---
  }
});

// Initialisation de Webflow
window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('testLocal');
  // --- --- Gestion des Vidéos HLS --- ---
  initBunnyPlayer();
  initBunnyPlayerBackground();

  // --- --- Gestion des Components Webflow --- ---
  manageModals();
  manageTabs();

  // Fonctionnalités de tracking
  saveNavigationInfos();

  // --- --- Gestion des Animations --- ---
  animateMarquee();
  sliderReviewsCards();
  sliderReviewsMarquee();
  sliderTargetsCards();

  // --- --- Gestion des initialisations générales --- ---

  // --- --- Gestion des Fonctionnalités de l'Interface Utilisateur --- ---
  managePageInfo();
  manageBanners();
  manageDropdowns();
  manageStackedNotifications();
  displayJoinAccess();

  // --- --- Gestion des Animations Responsives --- ---
  animateNavOnResponsive();
  animateNavDropDownOnResponsive();
  animateSliderC1OnResponsive();
});
