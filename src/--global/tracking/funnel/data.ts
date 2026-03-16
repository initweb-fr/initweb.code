/**
 * Funnel Tracker — Données de suivi
 *
 * Sauvegarde et lecture des données de funnel dans des cookies individuels.
 *
 * Cookies écrits :
 *   __iw_funnel_device_support   — type d'appareil (computer, tablet, phone)
 *   __iw_funnel_device_lang      — langue du navigateur
 *   __iw_funnel_utm_source       — paramètre UTM source
 *   __iw_funnel_utm_medium       — paramètre UTM medium
 *   __iw_funnel_utm_campaign     — paramètre UTM campaign
 *   __iw_funnel_utm_term         — paramètre UTM term
 *   __iw_funnel_utm_content      — paramètre UTM content
 *   __iw_funnel_page_current     — chemin de la page courante
 *   __iw_funnel_page_previous    — chemin de la page précédente
 */

import { getCookie, setCookie } from '$global/utils/cookieUtilities';
import {
  STORAGE_KEY_FUNNEL_DEVICE_LANG,
  STORAGE_KEY_FUNNEL_DEVICE_SUPPORT,
  STORAGE_KEY_FUNNEL_PAGE_CURRENT,
  STORAGE_KEY_FUNNEL_PAGE_PREVIOUS,
  STORAGE_KEY_FUNNEL_UTM_CAMPAIGN,
  STORAGE_KEY_FUNNEL_UTM_CONTENT,
  STORAGE_KEY_FUNNEL_UTM_MEDIUM,
  STORAGE_KEY_FUNNEL_UTM_SOURCE,
  STORAGE_KEY_FUNNEL_UTM_TERM,
} from '$global/storageKeys';

// ===============================
// Lecture des données
// ===============================

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

// ===============================
// Sauvegarde des données
// ===============================

export function saveUserDeviceInfos() {
  const deviceWidth = window.innerWidth;
  const deviceSupport = deviceWidth > 992 ? 'computer' : deviceWidth > 768 ? 'tablet' : 'phone';
  const deviceLang =
    navigator.language || (navigator as unknown as { userLanguage: string }).userLanguage || '';

  setCookie(STORAGE_KEY_FUNNEL_DEVICE_SUPPORT, deviceSupport);
  setCookie(STORAGE_KEY_FUNNEL_DEVICE_LANG, deviceLang);
}

export function saveUserUTMInfos() {
  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get('utm_source');
  const utm_medium = urlParams.get('utm_medium');
  const utm_campaign = urlParams.get('utm_campaign');
  const utm_term = urlParams.get('utm_term');
  const utm_content = urlParams.get('utm_content');

  if (utm_source) setCookie(STORAGE_KEY_FUNNEL_UTM_SOURCE, utm_source);
  if (utm_medium) setCookie(STORAGE_KEY_FUNNEL_UTM_MEDIUM, utm_medium);
  if (utm_campaign) setCookie(STORAGE_KEY_FUNNEL_UTM_CAMPAIGN, utm_campaign);
  if (utm_term) setCookie(STORAGE_KEY_FUNNEL_UTM_TERM, utm_term);
  if (utm_content) setCookie(STORAGE_KEY_FUNNEL_UTM_CONTENT, utm_content);
}

export function saveUserNavigationInfos() {
  if (window.location.pathname.includes('/log/')) {
    const urlParams = new URLSearchParams(window.location.search);
    const utmPageCurrent = urlParams.get('page_current');
    const utmPagePrevious = urlParams.get('page_previous');
    if (utmPageCurrent) setCookie(STORAGE_KEY_FUNNEL_PAGE_CURRENT, utmPageCurrent);
    if (utmPagePrevious) setCookie(STORAGE_KEY_FUNNEL_PAGE_PREVIOUS, utmPagePrevious);
  } else {
    const previousPagePath = getCookie(STORAGE_KEY_FUNNEL_PAGE_CURRENT);
    const currentPagePath = decodeURIComponent(window.location.pathname);

    if (previousPagePath && previousPagePath !== currentPagePath) {
      setCookie(STORAGE_KEY_FUNNEL_PAGE_PREVIOUS, previousPagePath);
    }
    setCookie(STORAGE_KEY_FUNNEL_PAGE_CURRENT, currentPagePath);
  }
}

export function saveMSPlanFromURL() {
  const priceID = new URLSearchParams(window.location.search).get('ms_priceID');
  if (priceID && window.location.pathname.includes('/log/')) {
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
