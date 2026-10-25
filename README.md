# Pico-Clinic — le Micro-Chirurgien de Drones

Jeu navigateur mobile (Canvas 2D, JavaScript pur, sans bibliothèque). Répare drones, insectes cybernétiques et mascottes mécaniques du bout du doigt.

- Jouer : https://keismey.github.io/Pico-Clinic/
- Game design : `docs/gdd/`
- Avancement : `docs/ETAT.md`

## Hors ligne et installation (V5)

- `sw.js` garde tout le jeu sur le téléphone : en ligne, il prend toujours la version la plus récente ; hors ligne, il sert la copie.
- Après chaque modification : `node tools/maj-cache.mjs` (refait la liste des fichiers) puis `node tools/verif-langues.mjs` (aucune clé FR/EN manquante).
- Liens : `?lang=fr` ou `?lang=en` choisit la langue (et la retient), `?essai` ouvre l'atelier d'essai.
