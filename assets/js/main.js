/* ==========================================================================
   SCRIPT DU MODÈLE ARTISAN
   --------------------------------------------------------------------------
   Petites fonctions, sans bibliothèque :
     1. le menu ☰ sur téléphone
     2. la carte Google Maps chargée seulement au clic (pas de cookies avant)
     3. le bouton "Lire la suite" des avis trop longs
     4. les titres de section qui apparaissent au défilement
     5. l'en-tête qui se cache quand on descend (téléphone)
     6. le formulaire de devis
     7. le compteur et les flèches du carrousel d'avis
     8. la barre du bas qui arrive quand le bouton "Appeler" sort de l'écran

   Le site reste utilisable sans JavaScript : menu toujours affiché,
   carte masquée, formulaire envoyé normalement, avis à faire glisser,
   barre du bas toujours affichée.
   ========================================================================== */

// Note : la classe "js" est ajoutée sur <html> par une ligne dans le <head>
// de base.html, pour que le CSS replie le menu dès l'affichage.


/* 1. MENU MOBILE ------------------------------------------------------------ */
const boutonMenu = document.querySelector('.menu-bouton');
const menu = document.getElementById('menu');

if (boutonMenu && menu) {
  const entete = boutonMenu.closest('.entete');
  const texteBouton = boutonMenu.querySelector('.menu-bouton__texte');

  // Le voile qui assombrit la page. C'est un vrai élément (et pas un ::after)
  // pour que Safari sur iPhone prenne bien en compte le toucher.
  const voile = document.createElement('div');
  voile.className = 'menu-voile';
  voile.setAttribute('aria-hidden', 'true');
  document.body.append(voile);

  const menuEstOuvert = () => menu.classList.contains('est-ouvert');

  // Donne au CSS le bas de l'en-tête : le menu défile si l'écran est trop bas
  // (téléphone tenu à l'horizontale).
  const mesurerEntete = () => {
    menu.style.setProperty('--menu-haut', `${entete.getBoundingClientRect().bottom}px`);
  };

  // Un seul endroit pour ouvrir ou fermer : tout reste synchronisé
  const afficherMenu = (ouvrir) => {
    if (ouvrir) mesurerEntete();
    // aria-expanded indique aux lecteurs d'écran si le menu est ouvert
    boutonMenu.setAttribute('aria-expanded', String(ouvrir));
    texteBouton.textContent = ouvrir ? 'Fermer' : 'Menu';
    menu.classList.toggle('est-ouvert', ouvrir);
    voile.classList.toggle('est-visible', ouvrir);
    // Bloque le défilement de la page derrière le menu
    document.documentElement.classList.toggle('menu-ouvert', ouvrir);
  };

  boutonMenu.addEventListener('click', () => afficherMenu(!menuEstOuvert()));
  voile.addEventListener('click', () => afficherMenu(false));

  // Au clavier : si on sort de l'en-tête avec Tab, le menu se referme
  entete.addEventListener('focusout', (evenement) => {
    const suivant = evenement.relatedTarget;
    if (menuEstOuvert() && suivant && !entete.contains(suivant)) afficherMenu(false);
  });

  // Passage en grand écran : le menu redevient une simple ligne de liens
  window.matchMedia('(min-width: 900px)').addEventListener('change', (evenement) => {
    if (evenement.matches) afficherMenu(false);
  });
  window.addEventListener('resize', () => {
    if (menuEstOuvert()) mesurerEntete();
  });

  // Bouton "retour" : le navigateur peut réafficher la page telle qu'on l'a quittée
  window.addEventListener('pageshow', (evenement) => {
    if (evenement.persisted) afficherMenu(false);
  });

  // Touche Échap : referme le menu et remet le focus sur le bouton
  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape' && menuEstOuvert()) {
      afficherMenu(false);
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


/* 5. EN-TÊTE QUI SE CACHE QUAND ON DESCEND ---------------------------------------- */
// Téléphone seulement, et jamais si le visiteur a demandé moins d'animations.
// Il reste affiché : en haut de page, menu ouvert, ou élément de l'en-tête au clavier.
const enteteCollant = document.querySelector('.entete');

if (enteteCollant) {
  const petitEcran = window.matchMedia('(max-width: 899.98px)');
  const moinsDAnimations = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SEUIL = 8; // en pixels : ignore les petits tremblements du doigt
  let dernierY = window.scrollY;

  const montrerEntete = () => enteteCollant.classList.remove('est-cache');

  window.addEventListener('scroll', () => {
    const y = Math.max(0, window.scrollY); // Safari renvoie des valeurs négatives en rebondissant

    const doitResterVisible = !petitEcran.matches
      || moinsDAnimations.matches
      || y < 120
      || document.documentElement.classList.contains('menu-ouvert')
      || enteteCollant.querySelector(':focus-visible');

    if (doitResterVisible) {
      montrerEntete();
      dernierY = y;
    } else if (Math.abs(y - dernierY) >= SEUIL) {
      enteteCollant.classList.toggle('est-cache', y > dernierY);
      dernierY = y;
    }
  }, { passive: true }); // passive : ne ralentit jamais le défilement

  enteteCollant.addEventListener('focusin', montrerEntete);
  petitEcran.addEventListener('change', montrerEntete);
  moinsDAnimations.addEventListener('change', montrerEntete);
}


/* 6. FORMULAIRE DE DEVIS ----------------------------------------------------------- */
// Avec JS : erreurs sous les champs, puis envoi sans quitter la page (fetch).
// Sans JS : le navigateur vérifie et envoie lui-même.
const formulaire = document.querySelector('.formulaire');

if (formulaire) {
  const boutonEnvoi = formulaire.querySelector('.formulaire__envoi');
  const etat = formulaire.querySelector('.formulaire__etat');
  const champsObligatoires = [...formulaire.querySelectorAll('[required]')];
  const demonstration = formulaire.hasAttribute('data-demo');

  formulaire.noValidate = true; // nos messages remplacent les bulles du navigateur
  formulaire.classList.add('est-pret');
  boutonEnvoi.disabled = false;

  // Affiche ou efface l'erreur d'un champ ; renvoie true si le champ est correct
  const verifier = (champ) => {
    const { valueMissing, valid } = champ.validity;
    const vide = valueMissing || champ.value.trim() === '';
    const correct = valid && !vide;

    let message = '';
    if (vide) message = champ.dataset.erreurVide;
    else if (!valid) message = champ.dataset.erreurFormat;

    champ.setAttribute('aria-invalid', String(!correct));
    document.getElementById(`erreur-${champ.name}`).textContent = message;
    return correct;
  };

  champsObligatoires.forEach((champ) => {
    champ.addEventListener('input', () => {
      // On corrige le message pendant la frappe, sans gronder avant le premier envoi
      if (champ.getAttribute('aria-invalid') === 'true') verifier(champ);
    });
  });

  const annoncer = (message, type) => {
    etat.textContent = message;
    etat.dataset.type = type;
    etat.focus();
  };

  formulaire.addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    etat.textContent = '';

    const incorrects = champsObligatoires.filter((champ) => !verifier(champ));
    if (incorrects.length) {
      incorrects[0].focus(); // le lecteur d'écran lit le champ et son message d'erreur
      return;
    }

    if (demonstration) {
      annoncer("Démonstration : rien n'a été envoyé. Sur le site final, votre demande partirait maintenant.", 'info');
      return;
    }

    const donnees = new FormData(formulaire);
    donnees.delete('redirect'); // réservé à l'envoi sans JS

    const annulation = new AbortController();
    const minuteur = setTimeout(() => annulation.abort(), 15000); // réseau mobile : 15 s maximum
    boutonEnvoi.disabled = true;
    boutonEnvoi.textContent = 'Envoi en cours…';

    let envoye = false;
    try {
      const reponse = await fetch(formulaire.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: donnees,
        signal: annulation.signal,
      });
      const resultat = await reponse.json();
      envoye = reponse.ok && resultat.success === true;
    } catch {
      envoye = false; // pas de réseau, délai dépassé ou réponse illisible
    }

    clearTimeout(minuteur);
    boutonEnvoi.disabled = false;
    boutonEnvoi.textContent = 'Envoyer ma demande';

    if (envoye) {
      formulaire.reset();
      annoncer(etat.dataset.confirmation, 'succes'); // texte préparé par generer.py (normal ou test)
    } else {
      // Les champs restent remplis : le visiteur ne perd rien
      annoncer(`L'envoi n'a pas fonctionné. Réessayez, ou appelez le ${etat.dataset.telephone}.`, 'erreur');
    }
  });
}


/* 7. CARROUSEL D'AVIS --------------------------------------------------------------- */
// Le défilement est fait par le CSS. Ici : compteur "1 / 4", flèches et clavier.
const commandesAvis = document.querySelector('.carrousel__commandes');

if (commandesAvis) {
  const liste = document.querySelector('.carrousel .avis');
  const cartes = [...liste.children];
  const fleches = [...commandesAvis.querySelectorAll('.carrousel__fleche')];
  const [compteurVu, compteurLu] = commandesAvis.querySelectorAll('.carrousel__compteur span');
  const enGrille = window.matchMedia('(min-width: 900px)');
  const sansMouvement = window.matchMedia('(prefers-reduced-motion: reduce)');
  let numero = 0;      // la carte affichée (0 = la première)
  let cible = null;    // la carte vers laquelle une flèche fait défiler
  let finDefilement;

  const afficherNumero = (nouveau) => {
    numero = nouveau;
    compteurVu.textContent = `${numero + 1} / ${cartes.length}`;
    const phrase = `Avis ${numero + 1} sur ${cartes.length}`;
    if (compteurLu.textContent !== phrase) compteurLu.textContent = phrase;
    activerFleches();
  };

  // Un bouton désactivé perd le focus clavier : on le passe d'abord à l'autre flèche
  const activerFleches = () => {
    const inactives = [numero === 0, numero === cartes.length - 1];
    fleches.forEach((fleche, i) => {
      if (inactives[i] && document.activeElement === fleche) {
        const autre = fleches[1 - i];
        autre.disabled = false;
        autre.focus({ preventScroll: true });
      }
    });
    fleches.forEach((fleche, i) => { fleche.disabled = inactives[i]; });
  };

  // Retrouve la carte affichée d'après la position de défilement
  const lirePosition = () => {
    const maximum = liste.scrollWidth - liste.clientWidth;
    // Tout au bout, la dernière carte ne peut pas se caler à gauche : cas à part
    if (maximum > 0 && liste.scrollLeft >= maximum - 4) return cartes.length - 1;
    const ecarts = cartes.map((carte) => Math.abs(carte.offsetLeft - cartes[0].offsetLeft - liste.scrollLeft));
    return ecarts.indexOf(Math.min(...ecarts));
  };

  const allerA = (demande) => {
    const suivant = Math.max(0, Math.min(cartes.length - 1, demande));
    if (suivant === numero) return;
    cible = suivant;
    afficherNumero(suivant);
    const gauche = suivant === cartes.length - 1
      ? liste.scrollWidth - liste.clientWidth
      : cartes[suivant].offsetLeft - cartes[0].offsetLeft;
    liste.scrollTo({ left: gauche, behavior: sansMouvement.matches ? 'auto' : 'smooth' });
  };

  liste.addEventListener('scroll', () => {
    // Pendant un défilement lancé par une flèche, le compteur ne repasse pas par les cartes du milieu
    if (cible === null) afficherNumero(lirePosition());
    clearTimeout(finDefilement);
    finDefilement = setTimeout(() => {
      cible = null;
      afficherNumero(lirePosition());
    }, 150);
  }, { passive: true });

  // Le doigt (ou la molette) reprend la main : compteur et flèches suivent la vraie position
  ['touchstart', 'wheel'].forEach((geste) => {
    liste.addEventListener(geste, () => { cible = null; }, { passive: true });
  });

  fleches.forEach((fleche) => {
    fleche.addEventListener('click', () => allerA(numero + Number(fleche.dataset.sens)));
  });

  liste.addEventListener('keydown', (evenement) => {
    if (enGrille.matches || evenement.target !== liste) return;
    const sens = { ArrowLeft: -1, ArrowRight: 1 }[evenement.key];
    if (!sens) return;
    evenement.preventDefault();
    allerA(numero + sens);
  });

  // Sur ordinateur c'est une grille : inutile de s'y arrêter avec la touche Tab
  const adapter = () => {
    if (enGrille.matches) liste.removeAttribute('tabindex');
    else liste.tabIndex = 0;
    cible = null;
    afficherNumero(lirePosition());
  };
  enGrille.addEventListener('change', adapter);

  commandesAvis.hidden = false;
  adapter();
}


/* 8. BARRE DU BAS ------------------------------------------------------------------- */
// Accueil seulement (le seul bouton marqué data-appel-principal). Ailleurs, sans JS
// ou avec "réduire les animations", la barre reste affichée tout le temps.
const appelPrincipal = document.querySelector('[data-appel-principal]');
const barreAction = document.querySelector('.barre-action');

if (appelPrincipal && barreAction && 'IntersectionObserver' in window) {
  const barreFixe = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Le haut de l'écran est occupé par l'en-tête : le bouton n'y compte pas comme visible
  const MARGE_HAUT = 64;
  const position = appelPrincipal.getBoundingClientRect();
  let boutonVisible = position.bottom > MARGE_HAUT && position.top < window.innerHeight;

  const placerBarre = () => {
    barreAction.classList.toggle('est-masquee', boutonVisible && !barreFixe.matches);
  };

  // Premier placement sans glissement, puis on autorise l'animation
  placerBarre();
  requestAnimationFrame(() => requestAnimationFrame(() => barreAction.classList.add('est-animee')));

  new IntersectionObserver((entrees) => {
    boutonVisible = entrees[entrees.length - 1].isIntersecting;
    placerBarre();
  }, { rootMargin: `-${MARGE_HAUT}px 0px 0px 0px` }).observe(appelPrincipal);

  barreFixe.addEventListener('change', placerBarre);
}
