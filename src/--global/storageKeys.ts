/**
 * Clés de stockage centralisées — localStorage & cookies
 *
 * Convention : __iw_{namespace}_{clé}
 * - Préfixe obligatoire __iw_ pour éviter les collisions avec des scripts tiers
 * - Tout en snake_case, séparateur unique : underscore
 * - Clés dynamiques exposées comme fonctions
 */

// ===============================
// Thème
// ===============================

export const STORAGE_KEY_THEME = '__iw_theme';

// ===============================
// UI — Bannières
// ===============================

export const storageKeyBannerDismissed = (bannerId: string) =>
  `__iw_ui_banner_${bannerId}_dismissed`;

// ===============================
// UI — Stacked Notifications
// ===============================

export const storageKeyStackedNotificationDismissed = (notificationId: string) =>
  `__iw_ui_stacked_notification_${notificationId}_dismissed`;

// ===============================
// Navigation / Page
// ===============================

export const STORAGE_KEY_PAGE_NAME = '__iw_page_name';

export const STORAGE_KEY_NAV_CURRENT_TITLE = '__iw_nav_current_page_title';
export const STORAGE_KEY_NAV_CURRENT_URL = '__iw_nav_current_page_url';
export const STORAGE_KEY_NAV_PREVIOUS_TITLE = '__iw_nav_previous_page_title';
export const STORAGE_KEY_NAV_PREVIOUS_URL = '__iw_nav_previous_page_url';

// ===============================
// Funnel — Device
// ===============================

export const STORAGE_KEY_FUNNEL_DEVICE_SUPPORT = '__iw_funnel_device_support';
export const STORAGE_KEY_FUNNEL_DEVICE_LANG = '__iw_funnel_device_lang';

// ===============================
// Funnel — UTM
// ===============================

export const STORAGE_KEY_FUNNEL_UTM_SOURCE = '__iw_funnel_utm_source';
export const STORAGE_KEY_FUNNEL_UTM_MEDIUM = '__iw_funnel_utm_medium';
export const STORAGE_KEY_FUNNEL_UTM_CAMPAIGN = '__iw_funnel_utm_campaign';
export const STORAGE_KEY_FUNNEL_UTM_TERM = '__iw_funnel_utm_term';
export const STORAGE_KEY_FUNNEL_UTM_CONTENT = '__iw_funnel_utm_content';

// ===============================
// Funnel — Pages visitées
// ===============================

export const STORAGE_KEY_FUNNEL_PAGE_CURRENT = '__iw_funnel_page_current';
export const STORAGE_KEY_FUNNEL_PAGE_PREVIOUS = '__iw_funnel_page_previous';

// ===============================
// Funnel — Cours
// ===============================

export const STORAGE_KEY_FUNNEL_COURSE_IWID = '__iw_funnel_course_iwid';
export const storageKeyFunnelCourseDatasStatus = (courseID: string) =>
  `__iw_funnel_course_${courseID}_datas_status`;

// ===============================
// Funnel — Onboarding
// ===============================

export const STORAGE_KEY_COURSEFUNNEL_ONBOARDING_IWID = '__iw_coursefunnel_onboarding_iwid';
export const storageKeyCourseFunnelDatasTransmitted = (courseID: string) =>
  `__iw_coursefunnel_${courseID}_datas_transmitted`;

// ===============================
// Utilisateur
// ===============================

export const STORAGE_KEY_USER_PREFIX = '__iw_';
export const STORAGE_KEY_USER_FIRSTNAME = '__iw_user_firstname';
export const STORAGE_KEY_USER_LASTNAME = '__iw_user_lastname';
export const STORAGE_KEY_USER_FULLNAME = '__iw_user_fullname';

// ===============================
// Leçon (Academy)
// ===============================

export const STORAGE_KEY_LESSON_IWID = '__iw_lesson_iwid';
export const STORAGE_KEY_CURRENT_LESSON_IWID = '__iw_currentlesson_iwid';

export const storageKeyLastLessonURL = (courseIWID: string) =>
  `__iw_course_${courseIWID}_last_lesson_url`;
export const storageKeyLastLessonIWID = (courseIWID: string) =>
  `__iw_course_${courseIWID}_last_lesson_iwid`;
