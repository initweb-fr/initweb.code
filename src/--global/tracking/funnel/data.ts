/**
 * Funnel Tracker — Données de suivi
 *
 * Sauvegarde et lecture des données de funnel dans un cookie JSON unique.
 *
 * Cookie écrit :
 *   __iw_funnel  →  { device: { support, lang }, utm: { source, medium, ... }, page: { current, previous } }
 */

import { COOKIE_KEY_FUNNEL, type FunnelCookie } from '$global/storageKeys';
import { getJsonCookie, setJsonCookie } from '$global/utils/cookieUtilities';

// ===============================
// Lecture des données
// ===============================

export function getFunnelDeviceInfos() {
  const funnel = getJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL);
  return {
    deviceSupport: funnel.device?.support ?? null,
    deviceLang: funnel.device?.lang ?? null,
  };
}

export function getFunnelUTMInfos() {
  const funnel = getJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL);
  return {
    utmSource: funnel.utm?.source ?? null,
    utmMedium: funnel.utm?.medium ?? null,
    utmCampaign: funnel.utm?.campaign ?? null,
    utmTerm: funnel.utm?.term ?? null,
    utmContent: funnel.utm?.content ?? null,
  };
}

export function getFunnelNavInfos() {
  const funnel = getJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL);
  return {
    currentPage: funnel.page?.current ?? null,
    previousPage: funnel.page?.previous ?? null,
  };
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

  const current = getJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL);
  setJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL, {
    ...current,
    device: { support: deviceSupport, lang: deviceLang },
  });
}

export function saveUserUTMInfos() {
  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get('utm_source');
  const utm_medium = urlParams.get('utm_medium');
  const utm_campaign = urlParams.get('utm_campaign');
  const utm_term = urlParams.get('utm_term');
  const utm_content = urlParams.get('utm_content');

  if (!utm_source && !utm_medium && !utm_campaign && !utm_term && !utm_content) return;

  const current = getJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL);
  const newUtm = { ...current.utm };
  if (utm_source) newUtm.source = utm_source;
  if (utm_medium) newUtm.medium = utm_medium;
  if (utm_campaign) newUtm.campaign = utm_campaign;
  if (utm_term) newUtm.term = utm_term;
  if (utm_content) newUtm.content = utm_content;

  setJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL, { ...current, utm: newUtm });
}

export function saveUserNavigationInfos() {
  const current = getJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL);

  if (window.location.pathname.includes('/log/')) {
    const urlParams = new URLSearchParams(window.location.search);
    const utmPageCurrent = urlParams.get('page_current');
    const utmPagePrevious = urlParams.get('page_previous');

    const newPage = { ...current.page };
    if (utmPageCurrent) newPage.current = utmPageCurrent;
    if (utmPagePrevious) newPage.previous = utmPagePrevious;

    setJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL, { ...current, page: newPage });
  } else {
    const previousPagePath = current.page?.current;
    const currentPagePath = decodeURIComponent(window.location.pathname);

    const newPage = { ...current.page };
    if (previousPagePath && previousPagePath !== currentPagePath) {
      newPage.previous = previousPagePath;
    }
    newPage.current = currentPagePath;

    setJsonCookie<FunnelCookie>(COOKIE_KEY_FUNNEL, { ...current, page: newPage });
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
