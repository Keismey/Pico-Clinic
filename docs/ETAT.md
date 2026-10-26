# Pico-Clinic — État du projet
Mis à jour : 2026-10-26 (écran de fin après les 60 commandes). Jeu : https://keismey.github.io/Pico-Clinic/ · Essai : https://keismey.github.io/Pico-Clinic/?essai

## Fait
- Écran de fin (`js/scenes/lobby.js`) : une fois les 60 commandes réparées, « Jouer » mène à Défi du jour / Atelier libre / Rejouer les niveaux (étoiles manquantes), avec Boutique · Carnet · Menu. « Rejouer » ouvre la liste sur le premier chapitre incomplet ; son bouton « Retour » ramène à l'écran de fin.
- Gribouille présente le Défi du jour (rang 3) et l'Atelier libre (rang 5), après le chapitre ou au premier appui (scènes `daily`, `free`).
- Transitions jusqu'au menu : le logo attend ses images (2 s max), fondus enchaînés autour de l'écran titre (`fadeFrom` dans `scenes.js`), boutons du menu qui montent, bandes noir → beige en fondu, son au toucher. Lancement comme les autres jeux : logo Keismey Studio (`img/keismey-studio.webp`, 2,3 s, un toucher le passe), puis « Appuie pour continuer » sur l'image Gemini `img/titre.webp` (titre ajouté en code avec contour crème), puis le menu. Retour : `commun/ks-back.js` du hub ; liste des commandes (retour ou bouton Menu) → « Revenir à l'écran titre ? » ; écran titre → « Aller au hub ? ».
- Correctifs recette 2 : la main de Gribouille (circuit oxydé) ne frotte plus sur les composants (zigzag vérifié, sinon pas de démo) ; en diagnostic, la loupe prend toujours le doigt (la fiche se branche après) ; bulle de la boutique descendue sous la ligne Pince ; texte d'aide qui rétrécit pour rester dans son cadre (circuit oxydé, rouille en FR).
- 2026-10-26 : icône (`icons/`, 5 tailles, maskable réduite à 80 %) et couverture `couverture.webp` (titre ajouté en code) tirées des images Gemini ; le hub les reprend tout seul. Recette robot : 56 commandes sur 60 jouées au doigt simulé, aucune erreur, FR/EN sans débordement, sons et cache complets.
- C13 V5 : hors ligne (`sw.js` : en ligne la dernière version, sinon la copie ; réseau lent > 4 s → copie ; liste refaite par `node tools/maj-cache.mjs`). Installation : `manifest.webmanifest` (FR) et `manifest-en.webmanifest` (choisi selon la langue), icônes et couverture. Lien `?lang=fr|en`. `tools/verif-langues.mjs` : 678 clés FR = EN, aucune clé manquante, variables identiques. Relecture : EN harmonisé (trace, customer, fried chip, magnifier, power vacuum, racing drone, blueprint), FR « morceau {i} sur {n} », « Version {v} » à l'écran titre. Hub : carte Pico-Clinic (`games.js`, progression rang / étoiles / crédits), raccourci du manifest, nouvelle dans `news.json` (sans notification).
- C12 V4b : écran Options (langue, volumes, vibrations, tremblement réduit, gaucher, contrastes, effacer) ; défi quotidien dès le rang 3 (`js/daily.js`).
- C11 V4a : musiques Gemini en boucle, ~35 effets en code (`js/audio.js`, `audio/LISEZMOI.md`), vibrations, particules (max 150), relecture des textes, générique.
- C9-C10 V3 : 60 commandes, 5 rangs, examens, prototypes et pièces rares exigées, décorations, Atelier libre, textes des chapitres 3 à 5 et de la fin.
- C1-C8 : gestes de base et secondaires, loupe, aspirateur, étoiles, paie, sauvegarde `pico_save_v1`, boutique, comptoir, Carnet, tutoriel, chapitres 1-2, bouton retour.

## Écarts au GDD
- Absents : élytres à clips (7), coutures (17), mécanisme à clé (29), 3 engrenages de la tortue (55) ; un geste de chaque type par patient ; pas de panne secondaire cachée.
- Clients de passage sans texte dans le GDD (dialogues d'origine). Défi quotidien : 2 essais, une seule paie.

## À vérifier au doigt (recette)
- Installation depuis le hub, jeu complet en mode avion, sauvegarde après fermeture, les deux langues.
- Vitesses (dévisseuse, batterie, cœur, ressort, broches), temps cibles de Turbo, tremblement réduit, volumes, vibrations iPhone (iOS 18+).

## Bugs connus
- Temps cibles peut-être trop larges (robot : 10 à 30 s pour 90 à 120 s) : à juger au doigt.

## Prochaine étape
- Recette au doigt sur téléphone (rubrique « À vérifier »), puis correctifs éventuels.

## Plus tard
- Images Gemini : non conseillées dans le jeu (mélange de styles, zones à toucher décalées). Succès. Indice 20 s ; pause ; gaucher dans les vues rapprochées ; Options depuis l'atelier ; sauver une réparation en cours ; revoir le tutoriel ; pannes cachées dans la loupe ; retour qui ferme d'abord la vue rapprochée.
