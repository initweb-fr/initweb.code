/**
 * Clés de stockage centralisées — localStorage & cookies
 *
 * Convention :
 *  - Cookies JSON    : __iw_{namespace}          (ex. __iw_navigation)
 *  - localStorage    : __iw_{namespace}_{clé}    (ex. __iw_page_name)
 *
 * Tout en snake_case, séparateur unique : underscore.
 */

// ===============================
// Cookies JSON — noms de cookies
// ===============================

export const COOKIE_KEY_NAVIGATION = '__iw_navigation';
export const COOKIE_KEY_FUNNEL = '__iw_funnel';
export const COOKIE_KEY_USER = '__iw_user';

// ===============================
// Cookies JSON — types
// ===============================

export type NavigationCookie = {
  current?: { title?: string; url?: string };
  previous?: { title?: string; url?: string };
};

export type FunnelCookie = {
  device?: { support?: string; lang?: string };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  page?: { current?: string; previous?: string };
};

export type UserCookie = Record<string, string>;

// ===============================
// Thème (localStorage)
// ===============================

export const STORAGE_KEY_THEME = '__iw_theme';

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
// Leçon — Academy (localStorage)
// ===============================

export const STORAGE_KEY_CURRENT_LESSON_IWID = '__iw_currentlesson_iwid';

export const storageKeyLastLessonURL = (courseIWID: string) =>
  `__iw_course_${courseIWID}_last_lesson_url`;
export const storageKeyLastLessonIWID = (courseIWID: string) =>
  `__iw_course_${courseIWID}_last_lesson_iwid`;
