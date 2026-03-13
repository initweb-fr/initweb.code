
// --------- Fonctions gérant la sauvegarde des données

import { getCookie, setCookie } from '$global/utils/cookieUtilities';
import {
  STORAGE_KEY_FUNNEL_DEVICE_SUPPORT,
  STORAGE_KEY_FUNNEL_DEVICE_LANG,
  STORAGE_KEY_FUNNEL_UTM_SOURCE,
  STORAGE_KEY_FUNNEL_UTM_MEDIUM,
  STORAGE_KEY_FUNNEL_UTM_CAMPAIGN,
  STORAGE_KEY_FUNNEL_UTM_TERM,
  STORAGE_KEY_FUNNEL_UTM_CONTENT,
  STORAGE_KEY_FUNNEL_PAGE_CURRENT,
  STORAGE_KEY_FUNNEL_PAGE_PREVIOUS,
} from '$global/storageKeys';

export function getFunnelDeviceInfos() {
  const deviceSupport = getCookie(STORAGE_KEY_FUNNEL_DEVICE_SUPPORT);
  const deviceLang = getCookie(STORAGE_KEY_FUNNEL_DEVICE_LANG);
  return { deviceSupport, deviceLang };
}

export function getFunnelUTMInfos() {
  const utmSource = getCookie(STORAGE_KEY_FUNNEL_UTM_SOURCE);
  const utmMedium = getCookie(STORAGE_KEY_FUNNEL_UTM_MEDIUM);
  const utmCampaign = getCookie(STORAGE_KEY_FUNNEL_UTM_CAMPAIGN);
  const utmTerm = getCookie(STORAGE_KEY_FUNNEL_UTM_TERM);
  const utmContent = getCookie(STORAGE_KEY_FUNNEL_UTM_CONTENT);
  return { utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
}

export function getFunnelNavInfos() {
  const currentPage = getCookie(STORAGE_KEY_FUNNEL_PAGE_CURRENT);
  const previousPage = getCookie(STORAGE_KEY_FUNNEL_PAGE_PREVIOUS);

  return { currentPage, previousPage };
}

export function getFunnelDatas() {
  const userUTM = getFunnelUTMInfos();
  const userDevice = getFunnelDeviceInfos();
  const userNavigation = getFunnelNavInfos();

  return { userUTM, userDevice, userNavigation };
}



export function saveUserDeviceInfos() {
  // Détermination du type d'écran
  const deviceWidth = window.innerWidth;
  const deviceSupport = deviceWidth > 992 ? 'computer' : deviceWidth > 768 ? 'tablet' : 'phone';

  // Détermination de la langue de l'utilisateur
  const deviceLang =
    navigator.language || (navigator as unknown as { userLanguage: string }).userLanguage || '';

  // Sauvegarde des données
  setCookie(STORAGE_KEY_FUNNEL_DEVICE_SUPPORT, deviceSupport);
  setCookie(STORAGE_KEY_FUNNEL_DEVICE_LANG, deviceLang);
}

export function saveUserUTMInfos() {
  // Récupération des paramètres UTM
  const urlParams = new URLSearchParams(window.location.search);

  const utm_source = urlParams.get('utm_source');
  const utm_medium = urlParams.get('utm_medium');
  const utm_campaign = urlParams.get('utm_campaign');
  const utm_term = urlParams.get('utm_term');
  const utm_content = urlParams.get('utm_content');

  // Sauvegarde des cookies seulement si les valeurs existent et ne sont pas vides
  if (utm_source) {
    setCookie(STORAGE_KEY_FUNNEL_UTM_SOURCE, utm_source);
  }
  if (utm_medium) {
    setCookie(STORAGE_KEY_FUNNEL_UTM_MEDIUM, utm_medium);
  }
  if (utm_campaign) {
    setCookie(STORAGE_KEY_FUNNEL_UTM_CAMPAIGN, utm_campaign);
  }
  if (utm_term) {
    setCookie(STORAGE_KEY_FUNNEL_UTM_TERM, utm_term);
  }
  if (utm_content) {
    setCookie(STORAGE_KEY_FUNNEL_UTM_CONTENT, utm_content);
  }
}

export function saveUserNavigationInfos() {
  // Si l'URL contient "/log/", on arrête la fonction
  if (window.location.pathname.includes('/log/')) {
    // Si les paramètres utm_page_current et utm_page_previous existent dans l'URL, on les sauvegarde dans les cookies
    const urlParams = new URLSearchParams(window.location.search);
    const utmPageCurrent = urlParams.get('page_current');
    const utmPagePrevious = urlParams.get('page_previous');
    if (utmPageCurrent) {
      setCookie(STORAGE_KEY_FUNNEL_PAGE_CURRENT, utmPageCurrent);
    }
    if (utmPagePrevious) {
      setCookie(STORAGE_KEY_FUNNEL_PAGE_PREVIOUS, utmPagePrevious);
    }
  } else {
    const previousPagePath = getCookie(STORAGE_KEY_FUNNEL_PAGE_CURRENT);
    const currentPagePath: string = decodeURIComponent(window.location.pathname);

    // Sauvegarde du chemin de la page précédente si différent
    if (previousPagePath !== currentPagePath && previousPagePath) {
      setCookie(STORAGE_KEY_FUNNEL_PAGE_PREVIOUS, previousPagePath);
    }

    // Mise à jour du chemin de la page courante
    setCookie(STORAGE_KEY_FUNNEL_PAGE_CURRENT, currentPagePath);
  }
}

export function saveMSPlanFromURL() {
  const priceID = new URLSearchParams(window.location.search).get('ms_priceID');
  if (priceID && window.location.pathname.includes('/log/')) {
    // Sauvegarde du plan dans le sessionStorage
    // sessionStorage.setItem('ms_priceID', priceID);
    // console.log('📦 Plan détecté dans l’URL, sauvegarde dans le sessionStorage:', priceID);
    // On applique l'attribut data-ms-price avec la valeur de priceID au formulaire de signup/login
    const form =
      document.querySelector('[data-ms-form="signup"]') ||
      document.querySelector('[data-ms-form="login"]');

    form?.setAttribute('data-ms-price:add', priceID);
    console.log(`Attribut data-ms-price="${priceID}" appliqué au formulaire.`);
  }
}

export function saveFunnelDatas() {
  saveUserDeviceInfos();
  saveUserUTMInfos();
  saveUserNavigationInfos();
  saveMSPlanFromURL();
}
