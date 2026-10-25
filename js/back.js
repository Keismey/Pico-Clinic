// Bouton retour du téléphone (ou du navigateur) : on reste dans le jeu et on remonte d'un écran.
// Écran titre : on quitte vraiment. Pendant une réparation : une petite pause demande confirmation.
import { W, H } from './canvas.js';
import { t } from './i18n.js';
import { Buttons, C, drawText, roundRect } from './ui.js';
import { go, scene, sceneName } from './scenes.js';
import { drawGribouille } from './portraits.js';
import { game } from './state.js';

// Écran → écran précédent (les écrans absents d'ici gèrent eux-mêmes le retour, avec back()).
const PARENT = { orders: 'title', shop: 'orders', notebook: 'orders', rank: 'orders', done: 'orders', bench: 'title', free: 'orders', daily: 'orders' };
const REPAIR = ['operation', 'reactivation'];

// Quitter une réparation : atelier d'essai (gestes ou commandes), Atelier libre ou liste des commandes.
function leave() {
  const o = game.repair && game.repair.patient.order;
  if (o && o.test) go(o.free ? 'free' : 'bench', o.free ? { test: true } : { page: o.clone ? 'orders' : 'gestures' });
  else go(o && o.daily ? 'daily' : o && o.free ? 'free' : 'orders');
}

let ask = null; // fenêtre « Quitter la réparation ? »
let time = 0;

function openAsk() {
  time = 0;
  const b = new Buttons();
  b.add({ x: 130, y: 1090, w: 380, h: 150, size: 50, style: 'secondary', label: () => t('back.leave'), onTap: () => { ask = null; leave(); } });
  b.add({ x: 570, y: 1090, w: 380, h: 150, size: 50, label: () => t('back.stay'), onTap: () => { ask = null; } });
  ask = { buttons: b };
}

function onBack() {
  const name = sceneName();
  if (ask) { ask = null; return true; }               // retour pendant la question = continuer
  if (REPAIR.includes(name)) { openAsk(); return true; }
  const sc = scene();
  if (sc.back && sc.back()) return true;
  if (PARENT[name]) { go(PARENT[name]); return true; }
  return false;
}

// cancelFinger : relâche le doigt en cours avant de changer d'écran.
export function initBack(cancelFinger) {
  history.pushState({ pico: 1 }, '');
  window.addEventListener('popstate', () => {
    cancelFinger();
    if (onBack()) history.pushState({ pico: 1 }, '');
    else history.back(); // écran titre : on quitte le jeu
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
  drawText(ctx, t('back.title'), W / 2, 900, W - 220, 56, { color: C.copperDark, weight: 900 });
  drawText(ctx, t('back.text'), W / 2, 1000, W - 240, 38, { color: C.inkSoft, weight: 700, lineH: 48 });
  ask.buttons.draw(ctx);
  ctx.restore();
}
