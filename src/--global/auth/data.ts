// ===============================
// Fonctions Memberstack
// ===============================

/**
 * Récupère le membre connecté depuis Memberstack
 * @returns Données membre Memberstack ou null
 */
export function getMemberDatas() {
  // Récupération des données du membre
  const memberstack = window.$memberstackDom;
  if (!memberstack) return null;
  const member = memberstack.getCurrentMember();
  // Récupération des données du membre JSON

  return member;
}

export function getMemberJSON() {
  const memberstack = window.$memberstackDom;
  if (!memberstack) return null;
  const memberJSON = memberstack.getMemberJSON();
  return memberJSON;
}

/**
 * Retourne la liste des planId actifs du membre connecté.
 * Retourne un tableau vide si le membre n'est pas connecté.
 */
export async function getMemberPlans(): Promise<string[]> {
  const { data: member } = await window.$memberstackDom.getCurrentMember();
  if (!member) return [];
  return (member.planConnections ?? [])
    .filter((p) => p.status === 'ACTIVE')
    .map((p) => p.planId);
}
