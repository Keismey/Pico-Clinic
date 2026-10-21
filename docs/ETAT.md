# Pico-Clinic — État du projet

Mis à jour : 2026-10-21 (C8 V3a + correctifs après tests PC et téléphone). Jeu : https://keismey.github.io/Pico-Clinic/ · Essai des gestes : https://keismey.github.io/Pico-Clinic/?essai

## Fait
- C1-C7 (V0 à V2b) : 7 gestes de base, loupe, aspirateur, étoiles, paie, sauvegarde v3, boutique, comptoir, rangs, Carnet, pièces rares, tutoriel de Gribouille, chapitres 1 et 2 (commandes 1 à 22), bouton retour du téléphone.
- C8 V3a gestes secondaires en « vue rapprochée » (`js/closeup.js`, `js/gestures/`) : la pièce en panne clignote sur la carte, on la touche, un grand panneau s'ouvre ; réussi, il se referme seul (croix = revenir plus tard). Batterie gonflée (sortir par le rail lentement et sans toucher les bords rouges, la poser sur le support, prendre la neuve et l'insérer avec les mêmes règles), cœur-batterie de peluche (pochette en tissu : ouvrir la fermeture éclair, 6 battements en rythme, trop vite = -soin, refermer), engrenage (débris, axe, quart de tour à 20°, aide verte après 3 essais), capteur (2 curseurs, son qui monte, voyants en haut de l'écran car le doigt cache le bouton, zone 12 % tenue 0,8 s), broches (1 à 4, à 6°), ressort (3 tours, jauge de vitesse, saute si trop vite), piles (2 piles aimantées + panneau à frotter à 90 %), circuit oxydé (pinceau fin, 90 % ; chaque contact = -3 propreté, au 3e le composant se fêle : au bac, puis un neuf à poser, payé en crédits comme les condensateurs).
- Maladresses = -propreté (`rep.care`), réglages et alignements = précision (`rep.scores`). Réglages dans `data/gestures.json` ; la pince aide aussi pour les piles et les broches.
- Vraies pannes remises : 7 et 19 (batterie), 9 et 17 (cœur-batterie), 13 et 20 (engrenage), 14 (capteur), 18 (oxydation). Leçon de Gribouille la 1re fois pour chaque geste.
- Atelier d'essai (lien `?essai`, `js/scenes/bench.js`, `tests` dans `data/orders.json`) : 8 boutons, rien n'est payé ni enregistré.
- Testé en navigateur automatique : les 8 gestes réussis au doigt simulé, démarrage raté puis réparé, retour à l'atelier d'essai, commandes 1 à 22 chargées sans erreur ; clés FR = EN (436). Propreté affichée dans la vue rapprochée dès la 1re maladresse.

## Écarts au GDD
- Élytres à clips (7), coutures (17), 2e piste (16, 21) toujours absents ; 2 patients à la commande 22. Ressort, broches et piles seulement dans l'atelier d'essai (commandes 25, 34, 41 pas encore créées).
- Pas de panne secondaire cachée à la loupe pour l'instant. Répliques des passages 2-6, 12, 13, 17, 20 inventées. Temps cible de Turbo 15 : 90 s.

## Valeurs à valider au doigt
- Engrenage, broches, piles validés au téléphone. Vitesse max de la batterie (340), rythme du cœur (1 s, fenêtre ±0,16 s), vitesse du ressort (0,35 à 1,6 tour/s), tolérance des broches (6°), seuil de la plaque, main fantôme, `data/gestures.json`.

## Bugs connus
- Vibrations absentes sur iPhone. En diagnostic, la fiche peut attraper le doigt avant la loupe. Indices longs (rouille) un peu serrés dans le panneau d'aide.

## Prochaine étape
- C9 V3b contenu : les 60 réparations en JSON, prototypes et pièces rares exigées, décorations, Atelier libre, équilibrage.

## Plus tard
- Économie à décider : rejouer une commande ne paie rien mais les pièces de rechange coûtent (crédits jamais sous 0). Pistes : Atelier libre (C9, gains 50 %), pièces gratuites en rejouant.
- Images Gemini (clients, Gribouille, carnet, pièces rares, pièces des gestes secondaires) ; son du clic de vis. Chapitres 3 à 5, patients multiples, défi quotidien, succès.
- Indice 20 s ; bouton pause à l'écran ; gaucher ; sauver une réparation en cours ; revoir le tutoriel depuis les réglages ; pannes secondaires cachées visibles dans la loupe ; bouton retour qui ferme d'abord la vue rapprochée.
