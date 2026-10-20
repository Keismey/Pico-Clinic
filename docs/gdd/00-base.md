# Pico-Clinic — GDD v14 · Base : vision, UX, technique, écrans, déploiement et langues, feuille de route

> Extrait fidèle du GDD (artefact « GDD – Pico-Clinic, le Micro-Chirurgien de Drones »), découpé le 2026-10-21.

## Vision

Tu tiens l'atelier de micro-chirurgie mécanique de la ville. Chaque jour, des clients excentriques déposent drones, insectes cybernétiques et mascottes mécaniques en panne. Tu ouvres, diagnostiques, répares du bout du doigt, puis tu les vois repartir en vol. **Promesse :** la précision tactile de Trauma Center dans un artisanat apaisant et ultra satisfaisant.

### Piliers

- **Satisfaction tactile** : chaque geste a un retour visuel, sonore et une vibration.
- **Précision sans punition** : on rate = moins d'étoiles, jamais de game over.
- **Le plaisir du « ça redémarre ! »** : la réactivation est le moment fort de chaque réparation.
- **Sessions courtes** : une réparation = 2 à 4 minutes, jouable d'une main.

### Cible & contraintes

- Joueurs mobiles casual, 8 ans et +. Français et anglais dès le départ, textes isolés dans des fichiers de langue.
- HTML/Canvas 2D/JS pur, sans bibliothèque, hébergé sur GitHub Pages, installable (PWA), jouable hors ligne.


## UX & ambiance

- **Écran atelier** : établi vu de dessus, tiroir d'outils en bas, client au comptoir en haut.
- **Écran opération** : zoom plein écran sur les entrailles, outil actif sous le doigt avec un décalage pour voir la pointe, jauges discrètes sur le côté.
- **Retour sensoriel** : vibration courte à chaque vis, grésillement de soudure, tintement de puce enclenchée, rotors qui montent en régime à la réactivation.
- **Accessibilité** : option « tremblement réduit », tolérance élargie, gauchers (outils à droite ou à gauche), contrastes forts, sons réglables.
- **Ton** : chaleureux, atelier lumineux, couleurs cuivre, turquoise et orange.


## Technique

- Un seul `index.html` + modules JS, Canvas 2D plein écran, boucle `requestAnimationFrame`, pointer events (un seul doigt, pas de multitouch requis).
- Rendu en couches : fond de la machine (image), pièces mobiles (sprites), effets (étincelles, fumée en particules légères), UI.
- Chaque opération = une « scène » avec `init / update / draw / pointer`, ce qui permet d'en ajouter sans toucher au reste.
- Données des drones, pannes, clients et outils dans des fichiers JSON (équilibrage sans toucher au code).
- Sauvegarde automatique en `localStorage` ; service worker pour le hors ligne ; manifest PWA pour l'ajout à l'écran d'accueil.
- Sons : audio WebAudio, sons courts compressés ; vibration via `navigator.vibrate` si disponible.
- Budget : images WebP, planches découpées par JSON, poids total visé \< 15 Mo.

### Plan de dev

- Le plan par étapes (V0 à V5), avec le critère de validation de chacune, est dans l'onglet Feuille de route.


## Enchaînement des écrans

**Titre** → **Atelier** (hub) → **Comptoir** (client + commande) → **Diagnostic** → **Opération** (phases enchaînées) → **Réactivation** → **Résultats** → retour **Atelier**.

| Écran | Contenu | Actions |
|---|---|---|
| Titre | Logo, drone animé, version du jeu | Jouer / Continuer, Réglages, langue |
| Atelier | Établi, client au comptoir, tiroir d'outils, crédits, rang | Prendre la commande, Boutique, Carnet, Réglages |
| Comptoir | Client, 2 à 3 bulles de dialogue, aperçu du patient et récompense | Accepter, Plus tard |
| Diagnostic | Patient fermé puis ouvert, loupe, liste des pannes trouvées | Balayer, Passer au bloc quand tout est trouvé |
| Opération | Zoom plein écran, outil actif, 2 jauges (propreté, soin), indicateur de phase | Geste en cours, changer d'outil, indice, pause |
| Réactivation | Manette de démarrage, test rotors et lumières | Tirer la manette |
| Résultats | 3 étoiles qui s'allument, crédits, pourboire, pièce rare éventuelle, départ du client | Continuer, Rejouer |
| Carnet | Clients et leurs histoires, collection de pièces rares, étoiles par commande | Consulter |
| Réglages | Langue, son, musique, vibration, tremblement réduit, gaucher, effacer la sauvegarde | Modifier |

### Règles d'ergonomie

- Toutes les actions principales dans la moitié basse de l'écran, accessibles au pouce.
- Boutons d'au moins 48 px, un seul geste à la fois.
- La pause est toujours disponible et l'opération reprend exactement où elle était.
- Confirmation seulement pour effacer la sauvegarde.


## Déploiement & langues

### Déploiement sur le hub

- **Cible :** le jeu est publié sur le hub `https://keismey.github.io/` (GitHub Pages) et référencé depuis la page d'accueil du hub (carte : titre, icône, lien, description courte, en français et en anglais). Reprendre le format déjà utilisé par les autres jeux du hub.
- **Chemins relatifs uniquement** (jamais de `/` absolu) : le jeu vit dans un sous-chemin du hub. Le `manifest` PWA (`start_url`, `scope`) et le service worker utilisent aussi des chemins relatifs.
- **Aucun outil à installer :** toute la publication se fait depuis l'interface web de GitHub (création du dépôt/dossier, envoi des fichiers, activation de Pages). Le développeur guide l'utilisateur pas à pas, captures de menus décrites à l'appui, car l'utilisateur n'est pas développeur.
- **Recette avant mise en ligne :** tester sur smartphone via l'URL du hub (chargement, hors ligne, ajout à l'écran d'accueil, sauvegarde).

### Traduction française / anglaise

- **Deux langues dès la V0 :** FR et EN, traduction réalisée par le développeur (l'utilisateur relit).
- **Aucun texte en dur dans le code :** tous les textes passent par des fichiers de langue (`fr.json`, `en.json`) indexés par identifiants ; fonction unique `t("clé")`. Le système est mis en place dès la première étape du plan de dev.
- **Choix de la langue :** détection automatique (`navigator.language` : français → FR, sinon EN), sélecteur FR/EN sur l'écran titre, choix mémorisé en `localStorage`, changement possible en cours de partie.
- **Sauvegardes indépendantes de la langue :** elles stockent des identifiants, jamais du texte traduit.
- **Mise en page :** prévoir de la marge dans les boîtes de texte (l'anglais et le français n'ont pas la même longueur) ; retours à la ligne automatiques, pas de largeur fixe.
- **Assets :** les images générées ne contiennent aucun texte, donc une seule version pour les deux langues et aucun prompt Gemini supplémentaire.
- **Titre et fiche du jeu :** titre, description du hub et textes du manifest PWA fournis en FR et EN.

### Spécifique à ce jeu

- À traduire en priorité : noms et dialogues des clients, descriptions des pannes, noms des outils et des pièces, textes de boutique, de notation et de réputation. Tous dans les fichiers de langue, à côté des JSON de données (drones, pannes, clients, outils).
- Plan de dev : système de langues dès **V0**, relecture FR/EN et publication sur le hub à **V5**.


## Feuille de route de développement

Chaque étape se termine par un jeu jouable que le manager teste sur son téléphone. On ne passe à la suivante qu'une fois la validation faite.

| Étape | Livrable | Validation (test sur téléphone) |
|---|---|---|
| **V0** Prototype | Système de langues FR/EN, boucle de jeu, 1 drone jouet, 4 gestes (dévisser, brancher un connecteur, souder, remplacer la puce), réactivation | Réparer le drone de bout en bout ; les gestes sont agréables ; le changement de langue fonctionne |
| **V1** Cœur de jeu | Nettoyage, diagnostic, notation 3 étoiles, crédits, boutique d'outils, 3 familles de patients (5 modèles chacune), sauvegarde | Enchaîner 10 réparations sans bug ; les étoiles semblent justes ; la sauvegarde survit à un rechargement |
| **V2** Histoire | Clients, dialogues, rangs, Carnet, pièces rares, les 10 réparations du tutoriel, chapitres 1 à 2 | Quelqu'un qui n'a jamais joué comprend le jeu sans explication ; les clients sont attachants |
| **V3** Contenu complet | 60 réparations, 5 rangs, tous les outils, décorations, chapitres 3 à 5, mode Atelier libre | Une partie de bout en bout ; l'équilibrage donne un outil amélioré toutes les 7 à 8 réparations |
| **V4** Habillage | Musiques, effets sonores, vibrations, particules, options d'accessibilité, défis quotidiens | Le « ça démarre ! » procure du plaisir ; aucune option n'est cassée |
| **V5** Publication | PWA hors ligne, relecture complète FR/EN, carte sur le hub, recette finale | Installation depuis le hub sur un téléphone, jeu complet hors ligne, les deux langues sans clé manquante |

### Principes de travail

- Le développeur livre à chaque étape un lien ou des fichiers prêts à tester, avec les consignes pour l'essayer.
- Les retours du manager sont classés en corrections (tout de suite) et envies (étape suivante).
- Les images et sons arrivent au fil des étapes ; en attendant, des formes simples servent de remplacement.
- Aucune dépense : outils gratuits, hébergement GitHub Pages, assets générés par le manager.
