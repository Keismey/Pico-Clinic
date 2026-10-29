// Bouton retour du téléphone (ou du navigateur, ou Échap) : on remonte d'un écran.
// L'historique est géré par commun/ks-back.js (même fichier dans tous les jeux du hub).
// Questions : pendant une réparation « Quitter la réparation ? », sur la liste des commandes
// « Revenir à l'écran titre ? », sur l'écran titre « Aller au hub ? ».
import { W, H } from './canvas.js';
import { t, getLang } from './i18n.js';
import { Buttons, C, drawText, roundRect } from './ui.js';
import { go, scene, sceneName } from './scenes.js';
import { drawGribouille } from './portraits.js';
import { game } from './state.js';

// Écran → écran précédent (les écrans absents d'ici gèrent eux-mêmes le retour, avec back()).
const PARENT = { shop: 'orders', notebook: 'orders', rank: 'orders', done: 'orders', bench: 'title', free: 'orders', daily: 'orders' };
const REPAIR = ['operation', 'reactivation'];

// Quitter une réparation : atelier d'essai (gestes ou commandes), Atelier libre ou liste des commandes.
function leave() {
  const o = game.repair && game.repair.patient.order;
  if (o && o.daily) go('daily', { test: !!o.test });
  else if (o && o.test) go(o.free ? 'free' : 'bench', o.free ? { test: true } : { page: o.clone ? 'orders' : 'gestures' });
  else go(o && o.daily ? 'daily' : o && o.free ? 'free' : 'orders');
}

// Les trois questions : clé des textes et action du bouton « oui ».
const ASKS = {
  repair: { key: 'back.', yes: leave },
  menu: { key: 'back.menu.', yes: () => go('title') },
  hub: { key: 'back.hub.', yes: () => window.KSBack.toHub() },
};

let ask = null; // question ouverte
let time = 0;

function openAsk(kind) {
  time = 0;
  const a = ASKS[kind];
  const b = new Buttons();
  b.add({ x: 130, y: 1090, w: 380, h: 150, size: 50, style: 'secondary', label: () => t(a.key + 'leave'), onTap: () => { ask = null; a.yes(); } });
  b.add({ x: 570, y: 1090, w: 380, h: 150, size: 50, label: () => t(a.key + 'stay'), onTap: () => { ask = null; } });
  ask = { key: a.key, buttons: b };
}

// Bouton « Menu » de la liste des commandes : même question que le retour du téléphone.
export function askMenu() {
  openAsk('menu');
}

function onBack() {
  if (window.KS && window.KS.closeDialog()) return;   // fenêtre « Sauvegarde » (commun/ks-studio.js)
  if (ask) { ask = null; return; }                    // retour pendant la question = rester
  const name = sceneName();
  if (REPAIR.includes(name)) { openAsk('repair'); return; }
  const sc = scene();
  if (sc.back && sc.back()) return;
  if (name === 'title') { openAsk('hub'); return; }
  if (name === 'orders' && game.replay) { go('lobby'); return; }
  if (name === 'orders' || name === 'lobby') { openAsk('menu'); return; }
  if (PARENT[name]) go(PARENT[name]);
}

// cancelFinger : relâche le doigt en cours avant de changer d'écran.
export function initBack(cancelFinger) {
  window.KSBack.init({
    back: () => { cancelFinger(); onBack(); },
    lang: () => getLang(),
    title: () => sceneName() === 'title' && !ask && !scene().showsLogo(),
  });
}

// Pendant la question, le jeu est en pause.
export function asking() {
  return !!ask;
}

export function tickAsk(dt) {
  time += dt;
}

export function askPointer(type, x, y) {
  ask.buttons.pointer(type, x, y);
}

export function drawAsk(ctx) {
  const k = Math.min(1, time * 5);
  ctx.save();
  ctx.globalAlpha = k;
  ctx.fillStyle = 'rgba(58, 42, 30, 0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d9c3a3';
  roundRect(ctx, 60, 642, W - 120, 640, 44); ctx.fill();
  ctx.fillStyle = C.paper;
  roundRect(ctx, 60, 630, W - 120, 640, 44); ctx.fill();
  drawGribouille(ctx, W / 2, 760, 0.6, { time });
  drawText(ctx, t(ask.key + 'title'), W / 2, 900, W - 220, 56, { color: C.copperDark, weight: 900 });
  drawText(ctx, t(ask.key + 'text'), W / 2, 1000, W - 240, 38, { color: C.inkSoft, weight: 700, lineH: 48 });
  ask.buttons.draw(ctx);
  ctx.restore();
}
