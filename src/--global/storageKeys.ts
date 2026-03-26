/**
 * Clés de stockage centralisées — localStorage & cookies
 *
 * Convention : __iw_{groupe}_{clé}
 *  - Préfixe obligatoire __iw_ pour éviter les collisions avec des scripts tiers
 *  - Groupe explicite : navigation, funnel, user, ui…
 *  - Tout en snake_case, séparateur unique : underscore
 *  - Clés dynamiques exposées comme fonctions
 */

// ===============================
// Thème (localStorage)
// ===============================

export const STORAGE_KEY_THEME = '__iw_ui_theme';
export const STORAGE_KEY_PANELS = '__iw_ui_panels';
// ===============================
// UI — Bannières (localStorage)
// ===============================

export const storageKeyBannerDismissed = (bannerId: string) =>
  `__iw_ui_banner_${bannerId}_dismissed`;

// ===============================
// UI — Stacked Notifications (localStorage)
// ===============================

export const storageKeyStackedNotificationDismissed = (notificationId: string) =>
  `__iw_ui_stacked_notification_${notificationId}_dismissed`;

// ===============================
// Page (localStorage)
// ===============================

export const STORAGE_KEY_PAGE_NAME = '__iw_page_name';

// ===============================
// Navigation (cookies)
// ===============================

export const STORAGE_KEY_NAVIGATION_CURRENT_TITLE = '__iw_navigation_current_title';
export const STORAGE_KEY_NAVIGATION_CURRENT_URL = '__iw_navigation_current_url';
export const STORAGE_KEY_NAVIGATION_PREVIOUS_TITLE = '__iw_navigation_previous_title';
export const STORAGE_KEY_NAVIGATION_PREVIOUS_URL = '__iw_navigation_previous_url';

// ===============================
// Funnel — Appareil (cookies)
// ===============================

export const STORAGE_KEY_FUNNEL_DEVICE_SUPPORT = '__iw_funnel_device_support';
export const STORAGE_KEY_FUNNEL_DEVICE_LANG = '__iw_funnel_device_lang';

// ===============================
// Funnel — UTM (cookies)
// ===============================

export const STORAGE_KEY_FUNNEL_UTM_SOURCE = '__iw_funnel_utm_source';
export const STORAGE_KEY_FUNNEL_UTM_MEDIUM = '__iw_funnel_utm_medium';
export const STORAGE_KEY_FUNNEL_UTM_CAMPAIGN = '__iw_funnel_utm_campaign';
export const STORAGE_KEY_FUNNEL_UTM_TERM = '__iw_funnel_utm_term';
export const STORAGE_KEY_FUNNEL_UTM_CONTENT = '__iw_funnel_utm_content';

// ===============================
// Funnel — Pages visitées (cookies)
// ===============================

export const STORAGE_KEY_FUNNEL_PAGE_CURRENT = '__iw_funnel_page_current';
export const STORAGE_KEY_FUNNEL_PAGE_PREVIOUS = '__iw_funnel_page_previous';

// ===============================
// Utilisateur (cookies)
// ===============================

export const STORAGE_KEY_USER_PREFIX = '__iw_user_';
export const STORAGE_KEY_USER_FIRSTNAME = '__iw_user_firstname';
export const STORAGE_KEY_USER_LASTNAME = '__iw_user_lastname';
export const STORAGE_KEY_USER_FULLNAME = '__iw_user_fullname';

// ===============================
// Leçon — Academy (localStorage)
// ===============================

export const STORAGE_KEY_CURRENT_LESSON_IWID = '__iw_currentlesson_iwid';

// Progression de toutes les formations — un seul objet JSON
// Format : { [courseIWID]: { lessonsCompleted, progress, lastLessonIWID, lastLessonURL } }
export const STORAGE_KEY_COURSES_PROGRESS = '__iw_courses_progress';
