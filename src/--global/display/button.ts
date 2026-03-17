/**
 * Button Manager — Gestion des boutons par type
 *
 * Gère le comportement des boutons selon leur attribut `data-iw-button-type`.
 *
 * ── Type : access-free-course ───────────────────────────────────────────────
 *
 * Attributs requis sur le bouton :
 *   data-iw-button-type="access-free-course"
 *   data-iw-button-plan-msid="<memberstack-plan-id>"
 *   href="<url-de-la-formation>"
 *
 * Comportement :
 *   - Membre connecté   → clic ajoute le plan Memberstack, puis redirige vers la formation
 *   - Membre non connecté → href redirigé vers la page signup avec le plan en paramètre
 */

// ===============================
// Configuration
// ===============================

const SIGNUP_URL = 'https://aca.initweb.fr/log/inscription';
const LOGIN_URL = 'https://aca.initweb.fr/log/connexion';

const BUTTON_TYPE = {
  ACCESS_FREE_COURSE: 'access-free-course',
  ACCESS_PAID_COURSE: 'access-paid-course',
} as const;

// ===============================
// Handlers par type de bouton
// ===============================

function initAccessFreeCourseButtons(isLoggedIn: boolean): void {
  document
    .querySelectorAll<HTMLAnchorElement>(
      `[data-iw-button-type="${BUTTON_TYPE.ACCESS_FREE_COURSE}"]`
    )
    .forEach((btn) => {
      const planId = btn.dataset.iwButtonPlanMsid;
      const formationUrl = btn.getAttribute('href');

      if (!planId || !formationUrl) return;

      if (isLoggedIn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.$memberstackDom.addPlan({ planId }).then(() => {
            window.location.href = formationUrl;
          });
        });
      } else {
        btn.setAttribute('href', `${SIGNUP_URL}?plan=${planId}`);
      }
    });
}

// ===============================
// Fonction principale
// ===============================

/**
 * Initialise la gestion de tous les boutons typés présents sur la page.
 * Doit être appelée après résolution de l'état Memberstack.
 */
export function manageButtons(): void {
  window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
    initAccessFreeCourseButtons(!!member);
  });
}
