/**
 * Signup Plan Injector — Page Inscription
 *
 * Si l'URL contient un paramètre `?plan=<id>`, injecte automatiquement
 * cet id sur le formulaire Memberstack pour pré-sélectionner le plan.
 *
 * Attribut cible :
 *   data-ms-form="signup"  — formulaire d'inscription Memberstack
 *
 * Paramètre URL :
 *   ?plan=<memberstack-plan-id>
 */

// ===============================
// Fonction principale
// ===============================

/**
 * Lit le paramètre `plan` dans l'URL et l'injecte sur le formulaire signup Memberstack.
 */
export function initSignupPlan(): void {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');

  const form = document.querySelector<HTMLElement>("[data-ms-form='signup']");
  if (plan && form) {
    form.setAttribute('data-ms-plan', plan);
  }
}
