export function scrollToCurrentLink() {
  // Sélectionner le lien actif (avec la classe w--current)
  const currentLink = document.querySelector('.aca_toc_module_link.w--current');

  // Vérifier si un lien actif existe
  if (currentLink) {
    // Faire défiler le conteneur parent pour que le lien soit visible
    currentLink.scrollIntoView({
      behavior: 'smooth', // Animation fluide
      block: 'center', // Centrer l'élément dans la vue
    });
  }
}
