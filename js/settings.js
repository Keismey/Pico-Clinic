// Version du jeu, notes de mise à jour et changement de langue (mémorisé dans la sauvegarde).
import { setLang } from './i18n.js';
import { save, persist } from './save.js';

export const VERSION = '1.0.12';

// Notes de mise à jour, la plus récente en premier (affichées dans les Options, et une fois après chaque mise à jour).
export const NOTES = [
  { v: '1.0.12', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Une copie de secours de ta partie est gardée : si la sauvegarde est abîmée, le jeu la reprend au lieu de repartir de zéro.', 'Sur iPhone, le son revient après un appel ou une alarme.'],
    en: ['A backup copy of your game is kept: if the save gets damaged, the game uses it instead of starting over.', 'On iPhone, sound comes back after a call or an alarm.'] },
  { v: '1.0.11', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Défi du jour : après le partage avec l’image, le bouton devient « Copier le texte », pour les applis (comme Threads) qui oublient le texte.'],
    en: ['Daily challenge: after sharing with the picture, the button becomes “Copy the text”, for apps (like Threads) that drop the text.'] },
  { v: '1.0.10', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Téléphone tourné à l’horizontale : le jeu se met en pause et te demande de le redresser, au lieu de s’afficher en tout petit.'],
    en: ['Phone turned sideways: the game pauses and asks you to turn it upright, instead of showing up tiny.'] },
  { v: '1.0.9', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Boutons orange et turquoise plus lisibles : texte foncé au lieu de blanc. Onglets choisis et nom de Maître Ohm plus contrastés.'],
    en: ['Orange and turquoise buttons are easier to read: dark text instead of white. Selected tabs and Master Ohm’s name have more contrast.'] },
  { v: '1.0.8', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Textes plus grands : conseils de Gribouille pendant les réparations, à la boutique et après une commande, boutons et descriptions des Options.'],
    en: ['Bigger text: Gribouille’s tips during repairs, in the shop and after an order, plus the buttons and descriptions in Options.'] },
  { v: '1.0.7', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Boutons plus faciles à toucher : Options, onglets des commandes, de la boutique et du carnet, cartes des décorations (on peut toucher toute la carte).'],
    en: ['Buttons that are easier to tap: Options, tabs in the orders, shop and notebook, decoration cards (the whole card can be tapped).'] },
  { v: '1.0.6', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Le jeu prend moins de mémoire sur le téléphone : une seule musique est prête à la fois (environ 40 % de mémoire en moins pour la musique).'],
    en: ['The game uses less memory on your phone: only one piece of music is loaded at a time (about 40% less memory for music).'] },
  { v: '1.0.5', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Première visite plus légère : environ 1 Mo à télécharger au lieu de 5,4 Mo. Les musiques sont gardées pour jouer hors ligne dès leur première écoute, et ne sont plus téléchargées deux fois.'],
    en: ['Lighter first visit: about 1 MB to download instead of 5.4 MB. Music is kept for offline play from the first time it plays, and is no longer downloaded twice.'] },
  { v: '1.0.4', d: ['31 octobre 2026', '31 October 2026'],
    fr: ['Réparation : un bouton pause en haut de l’écran met le jeu en pause et permet de quitter la réparation (utile sur iPhone, où l’appli installée n’a pas de bouton retour).'],
    en: ['Repairs: a pause button at the top of the screen pauses the game and lets you leave the repair (handy on iPhone, where the installed app has no back button).'] },
  { v: '1.0.3', d: ['29 octobre 2026', '29 October 2026'],
    fr: ['Options : bouton « Retour au hub », et le même ordre que dans les autres jeux du studio (son, langue, sauvegarde, puis le studio).'],
    en: ['Options: a “Back to the hub” button, in the same order as the studio’s other games (sound, language, save, then the studio).'] },
  { v: '1.0.2', d: ['26 octobre 2026', '26 October 2026'],
    fr: ['Défi du jour : un bouton « Partager mon résultat » envoie ta médaille, tes étoiles et ton temps à tes amis, sans rien dévoiler de la réparation.'],
    en: ['Daily challenge: a “Share my result” button sends your medal, stars and time to your friends, without giving away anything about the repair.'] },
  { v: '1.0.1', d: ['26 octobre 2026', '26 October 2026'],
    fr: ['Options : notes de mise à jour, sauvegarde à exporter ou importer (pour changer d’appareil), signaler un bug, soutenir le studio, crédits.',
      'Le navigateur est invité à garder ta sauvegarde même quand il fait du ménage.',
      'Écran titre : « Touche pour commencer » ; la langue se choisit dans les Options, comme dans les autres jeux du studio.'],
    en: ['Options: patch notes, a save you can export or import (to switch devices), bug reports, studio support, credits.',
      'The browser is asked to keep your save even when it clears space.',
      'Title screen: “Tap to start”; the language is now chosen in Options, like in the studio’s other games.'] },
  { v: '1.0.0', d: ['25 octobre 2026', '25 October 2026'],
    fr: ['Première version : 60 commandes en 5 chapitres, la boutique et les décorations, le défi du jour et l’Atelier libre.'],
    en: ['First release: 60 orders across 5 chapters, the shop and decorations, the daily challenge and the Free Workshop.'] },
];

const NOTES_KEY = 'pico_notes';

// Une fois après chaque mise à jour, et seulement pour un joueur qui a déjà joué (un nouveau joueur ne les voit pas).
export function notesDue() {
  let seen = null;
  try { seen = localStorage.getItem(NOTES_KEY); } catch (e) { return false; }
  if (seen === VERSION) return false;
  const played = save.credits > 0 || Object.keys(save.orders).length > 0;
  if (!played) { notesSeen(); return false; }
  return true;
}

export function notesSeen() {
  try { localStorage.setItem(NOTES_KEY, VERSION); } catch (e) { /* stockage indisponible */ }
}

export function changeLang(l) {
  setLang(l);
  save.settings.lang = l;
  persist();
}
