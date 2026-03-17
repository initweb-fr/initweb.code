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
 *   - Membre connecté + plan déjà actif → redirect direct vers la formation
 *   - Membre connecté + plan absent     → addPlan puis redirect
 *   - Membre non connecté               → href redirigé vers signup avec plan en param
 */

import { getMemberPlans } from 'src/--global/auth/data';

// ===============================
// Configuration
// ===============================

const SIGNUP_URL = 'https://aca.initweb.fr/log/inscription';

const BUTTON_TYPE = {
  ACCESS_FREE_COURSE: 'access-free-course',
  ACCESS_PAID_COURSE: 'access-paid-course',
} as const;

// ===============================
// Handlers par type de bouton
// ===============================

function initAccessFreeCourseButtons(memberPlans: string[] | null): void {
  document
    .querySelectorAll<HTMLAnchorElement>(
      `[data-iw-button-type="${BUTTON_TYPE.ACCESS_FREE_COURSE}"]`
    )
    .forEach((btn) => {
      const planId = btn.dataset.iwButtonPlanMsid;
      const formationUrl = btn.getAttribute('href');

      if (!planId || !formationUrl) return;

      if (memberPlans !== null) {
        const alreadyHasPlan = memberPlans.indexOf(planId) !== -1;

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (alreadyHasPlan) {
            window.location.href = formationUrl;
            return;
          }
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
 * Récupère la liste des plans du membre avant d'initialiser chaque bouton.
 */
export async function manageButtons(): Promise<void> {
  const { data: member } = await window.$memberstackDom.getCurrentMember();

  const memberPlans = member ? await getMemberPlans() : null;

  initAccessFreeCourseButtons(memberPlans);
}
