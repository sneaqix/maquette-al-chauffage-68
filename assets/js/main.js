/* ==========================================================================
   SCRIPT DU MODÈLE ARTISAN
   --------------------------------------------------------------------------
   Quatre petites fonctions, sans bibliothèque :
     1. le menu ☰ sur téléphone
     2. la carte Google Maps chargée seulement au clic (pas de cookies avant)
     3. le bouton "Lire la suite" des avis trop longs
     4. les titres de section qui apparaissent au défilement

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


/* 3. AVIS : "LIRE LA SUITE" ---------------------------------------------------- */
// Le CSS coupe chaque avis à 4 lignes. On ajoute un bouton seulement
// sous les avis vraiment coupés (texte plus haut que la zone visible).
document.querySelectorAll('.avis-carte__texte').forEach((texte, numero) => {
  if (texte.scrollHeight <= texte.clientHeight + 1) return; // avis court : rien à faire

  texte.id = `avis-texte-${numero + 1}`;
  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = 'avis-carte__suite';
  bouton.textContent = 'Lire la suite';
  bouton.setAttribute('aria-expanded', 'false');
  bouton.setAttribute('aria-controls', texte.id);

  bouton.addEventListener('click', () => {
    const deplie = texte.classList.toggle('est-deplie');
    bouton.setAttribute('aria-expanded', String(deplie));
    bouton.textContent = deplie ? 'Réduire' : 'Lire la suite';
  });

  texte.after(bouton); // le bouton se place juste sous le texte
});


/* 4. TITRES QUI APPARAISSENT AU DÉFILEMENT --------------------------------------- */
// Seulement si le visiteur n'a pas demandé moins d'animations,
// et si le navigateur connaît IntersectionObserver (tous les récents).
const animationsOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

if (animationsOk && 'IntersectionObserver' in window) {
  // IntersectionObserver prévient quand un élément entre dans l'écran,
  // sans avoir à surveiller chaque mouvement de défilement (plus léger).
  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) {
        entree.target.classList.add('est-visible');
        observateur.unobserve(entree.target); // une seule fois par titre
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' }); // un peu avant le bas de l'écran

  document.querySelectorAll('main section h2').forEach((titre) => {
    // Les titres déjà visibles à l'ouverture ne sont pas animés (pas de clignotement)
    if (titre.getBoundingClientRect().top < window.innerHeight) return;
    titre.classList.add('apparition');
    observateur.observe(titre);
  });
}
