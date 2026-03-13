export function checkLinks() {
  // Fonction pour détecter si un href est valide
  function isValidHref(href: string | null) {
    if (!href) return false;
    const trimmed = href.trim().toLowerCase();
    return trimmed !== '' && trimmed !== '#' && !trimmed.startsWith('javascript:');
  }

  // Sélectionner tous les liens de la page
  const links = document.querySelectorAll('a');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!isValidHref(href)) {
      // Ajout d’un style visible pour marquer le lien
      link.style.outline = '3px solid blue';
      link.style.outlineOffset = '0.5Rem';
      link.title = 'Lien non précisé';
      link.style.borderRadius = '0.5rem';
    }
  });

  console.log(
    `[INFO] ${links.length} liens analysés. Les liens sans href valide sont entourés en rouge.`
  );
}
