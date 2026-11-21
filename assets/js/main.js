/* ==========================================================================
   SCRIPT DU MODÈLE ARTISAN
   --------------------------------------------------------------------------
   Deux petites fonctions, sans bibliothèque :
     1. le menu ☰ sur téléphone
     2. la carte Google Maps chargée seulement au clic (pas de cookies avant)

   Le site reste utilisable sans JavaScript : menu toujours affiché,
   lien "Itinéraire" à la place de la carte.
   ========================================================================== */

// Note : la classe "js" est ajoutée sur <html> par une ligne dans le <head>
// de base.html, pour que le CSS replie le menu dès l'affichage.


/* 1. MENU MOBILE ------------------------------------------------------------ */
const boutonMenu = document.querySelector('.menu-bouton');
const menu = document.getElementById('menu');

if (boutonMenu && menu) {
  boutonMenu.addEventListener('click', () => {
    const ouvert = boutonMenu.getAttribute('aria-expanded') === 'true';
    // aria-expanded indique aux lecteurs d'écran si le menu est ouvert
    boutonMenu.setAttribute('aria-expanded', String(!ouvert));
    menu.classList.toggle('est-ouvert', !ouvert);
  });

  // Touche Échap : referme le menu et remet le focus sur le bouton
  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape' && menu.classList.contains('est-ouvert')) {
      boutonMenu.setAttribute('aria-expanded', 'false');
      menu.classList.remove('est-ouvert');
      boutonMenu.focus();
    }
  });
}


/* 2. CARTE GOOGLE MAPS AU CLIC ------------------------------------------------ */
const carte = document.querySelector('.carte[data-carte-src]');

if (carte) {
  const boutonCarte = carte.querySelector('.carte__bouton');

  boutonCarte.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = carte.dataset.carteSrc;   // l'adresse vient de data-carte-src
    iframe.title = 'Carte Google Maps';    // obligatoire pour l'accessibilité
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;

    carte.replaceChildren(iframe);         // remplace le texte et le bouton
    carte.classList.add('est-chargee');
  });
}
