/**
 * 👤 Gestion des données utilisateur
 *
 * Sauvegarde et récupération des données utilisateur dans les cookies.
 * Gère les formulaires, navigation et paramètres UTM.
 */

import { getFunnelDatas } from './data';

// --------- Fonctions gérant le tracking depuis Site vers Academy

export function transmitFunnelDatasToURL(links: NodeListOf<Element>) {
  const funnelDatas = getFunnelDatas();
  console.log('🔍 Funnel Datas:', funnelDatas);

  // On ajoute les paramètres UTM sur chaque lien sélectionné
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!href) return;
    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch (e) {
      return;
    }

    // Ajout des UTM depuis funnelDatas.userUTM
    if (funnelDatas && funnelDatas.userUTM) {
      const { utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = funnelDatas.userUTM;
      if (utmSource) url.searchParams.set('utm_source', utmSource);
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
      if (utmTerm) url.searchParams.set('utm_term', utmTerm);
      if (utmContent) url.searchParams.set('utm_content', utmContent);
    }

    // Ajout des paramètres de l'utilisateur depuis funnelDatas.userDevice
    if (funnelDatas && funnelDatas.userDevice) {
      const { deviceSupport, deviceLang } = funnelDatas.userDevice;
      if (deviceSupport) url.searchParams.set('device_support', deviceSupport);
      if (deviceLang) url.searchParams.set('device_lang', deviceLang);
    }

    // Ajout des paramètres de navigation depuis funnelDatas.userNavigation
    if (funnelDatas && funnelDatas.userNavigation) {
      const { currentPage, previousPage } = funnelDatas.userNavigation;
      if (currentPage) url.searchParams.set('page_current', currentPage);
      if (previousPage) url.searchParams.set('page_previous', previousPage);
    }

    link.setAttribute('href', url.toString());
  });
}

export function transmitPlanPriceToURL(addPlanWrappers: NodeListOf<Element>) {
  // Utiliser un sélecteur qui fonctionne avec les attributs contenant des caractères spéciaux

  addPlanWrappers.forEach((addPlanWrapper) => {
    const addPlanPriceID = addPlanWrapper.getAttribute('data-ms-price:add');
    const addPlanLink = addPlanWrapper.querySelector('a');

    if (!addPlanLink || !addPlanPriceID) return;

    // Au chargement de la page, on vérifie si un bouton doit rediriger automatiquement
    const addPlanLinkHREF = addPlanLink?.getAttribute('href');

    if (!addPlanLinkHREF || !addPlanPriceID) return;

    const url = new URL(addPlanLinkHREF, window.location.origin);
    url.searchParams.set('ms_priceID', addPlanPriceID);

    // Mettre à jour l'attribut href du bouton avec la nouvelle URL
    addPlanLink?.setAttribute('href', url.toString());
  });
}
/*
export function hasFunnelDataBeenTransmitted(): boolean {
  const courseID = getCookie('__iw_coursefunnel_onboarding_iwid');
  const state = getCookie('__iw_coursefunnel_' + courseID + '_datas_transmitted');
  return state === 'true';
}

export function markFunnelDataAsTransmitted(): void {
  const courseID = getCookie('__iw_coursefunnel_onboarding_iwid');
  document.cookie = `__iw_coursefunnel_${courseID}_datas_transmitted=true`;
}

export function isFirstLesson(): boolean {
  const currentModuleID = getCookie('__iw_lesson_iwid');
  return currentModuleID?.includes('chapter01-module01-lesson01') || false;
}
*/
