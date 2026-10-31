# Pico-Clinic — le Micro-Chirurgien de Drones

Jeu navigateur mobile (Canvas 2D, JavaScript pur, sans bibliothèque). Répare drones, insectes cybernétiques et mascottes mécaniques du bout du doigt.

- Jouer : https://keismey.github.io/Pico-Clinic/
- Game design : `docs/gdd/`
- Avancement : `docs/ETAT.md`

## Hors ligne et installation (V5)

- `sw.js` garde tout le jeu sur le téléphone : en ligne, il prend toujours la version la plus récente ; hors ligne, il sert la copie.
  Préchargés à l'installation : environ 1 Mo. Les musiques sont gardées à part (cache `pico-clinic-music`) dès leur première écoute, avec leur empreinte : une musique modifiée est retéléchargée, les autres restent. Les grandes icônes et `og.jpg` ne sont pas préchargés.
- Après chaque modification : `node tools/maj-cache.mjs` (refait la liste des fichiers) puis `node tools/verif-langues.mjs` (aucune clé FR/EN manquante).
- Liens : `?lang=fr` ou `?lang=en` choisit la langue (et la retient), `?essai` ouvre l'atelier d'essai.

## Commun aux jeux Keismey Studio

- `commun/ks-back.js` (bouton retour) et `commun/ks-studio.js` (sauvegarde à exporter / importer, signaler un bug, soutenir le studio, stockage persistant) : mêmes fichiers dans tous les jeux du hub, ne pas les modifier ici.
- Options : notes de mise à jour, sauvegarde, bug, soutien, ligne « v… · Keismey Studio » et crédits. Les notes sont dans `js/settings.js` (`VERSION` et `NOTES`) : à chaque mise à jour, ajouter une entrée en tête et changer `VERSION` ; elles s'affichent une fois aux joueurs qui ont déjà une partie.
- Mesure d'audience Cloudflare (sans cookie) et aperçu de lien (`og.jpg`, 1200 × 630) dans `index.html`.
