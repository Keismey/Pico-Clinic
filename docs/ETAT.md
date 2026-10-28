# Pico-Clinic — État du projet
Mis à jour : 2026-10-28. **Statut : TERMINÉ (version 1.0.1).**
Jeu : https://keismey.github.io/Pico-Clinic/ · Essai : https://keismey.github.io/Pico-Clinic/?essai

## Fait (les 13 étapes du plan, C1 à C13)
- Gestes de base et secondaires, loupe, aspirateur, 3 étoiles, pourboires, sauvegarde `pico_save_v1` (export / import).
- 60 commandes, 5 rangs et examens, prototypes, pièces rares, Carnet, boutique (outils niveaux 1 à 4, décorations dont 4 de prestige), Atelier libre, Défi du jour (rang 3), écran de fin après les 60 commandes.
- Tutoriel avec Gribouille, histoire complète (chapitres 1 à 5 et fin), FR/EN (678 clés, aucune manquante).
- Musiques Gemini en boucle, ~35 bruitages en code, vibrations, particules ; Options (langue, volumes, accessibilité, notes de mise à jour, sauvegarde, signaler un bug, soutenir le studio).
- Lancement commun aux jeux du hub (logo Keismey Studio, « Appuie pour continuer », retour `ks-back`), PWA hors ligne (`sw.js`, `tools/maj-cache.mjs`), icônes, couverture, aperçu de lien, carte et nouvelle sur le hub.
- Partage du Défi du jour (`js/share.js`) : texte + image 1080 de large (illustration entière en haut, médaille du jeu, 3 étoiles dessinées, pastilles temps et essais, bouton adresse). Refaite le 28/10 ; à vérifier sur téléphone.

## Écarts au GDD (assumés)
- Absents : élytres à clips (7), coutures (17), mécanisme à clé (29), 3 engrenages de la tortue (55) ; un geste de chaque type par patient ; pas de panne secondaire cachée.
- Clients de passage avec dialogues d'origine. Défi quotidien : 2 essais, une seule paie.

## Si un bug remonte
- Ouvrir une conversation « Correctifs Pico-Clinic 1.0.x » avec la liste des bugs ; augmenter la version dans `js/settings.js` et lancer `node tools/maj-cache.mjs` avant le commit.
- Points jamais vérifiés au doigt : vitesses des gestes, temps cibles de Turbo (peut-être trop larges), outils niveau 4, vibrations iPhone, jeu complet en mode avion, image de partage du Défi du jour.

## Idées pour une éventuelle 1.1
- Succès ; indice après 20 s ; pause ; gaucher dans les vues rapprochées ; Options depuis l'atelier ; sauver une réparation en cours ; revoir le tutoriel ; pannes cachées dans la loupe ; retour qui ferme d'abord la vue rapprochée.
