// Démarrage, boucle de jeu, doigt (un seul à la fois), pause automatique, sélecteur FR/EN.
import { canvas, ctx, resize, beginFrame, toLogical } from './canvas.js';
import { loadLanguages, detectLang, setLang, getLang } from './i18n.js';
import { save } from './save.js';
import { changeLang } from './settings.js';
import { loadData } from './state.js';
import { register, go, scene, sceneName } from './scenes.js';
import { Buttons, tickUI } from './ui.js';
import * as fx from './particles.js';
import title from './scenes/title.js';
import operation from './scenes/operation.js';
import reactivation from './scenes/reactivation.js';
import done from './scenes/done.js';
import orders from './scenes/orders.js';
import shop from './scenes/shop.js';
import counter from './scenes/counter.js';
import notebook from './scenes/notebook.js';
import rank from './scenes/rank.js';

// Petit sélecteur FR/EN en haut à droite (sur tous les écrans sauf le titre).
const langPill = new Buttons();
for (const [i, l] of ['fr', 'en'].entries()) {
  langPill.add({
    x: 780 + i * 150, y: 30, w: 140, h: 130, size: 46, style: 'secondary',
    label: () => l.toUpperCase(),
    selected: () => getLang() === l,
    onTap: () => changeLang(l),
  });
}

let last = 0;
let paused = false;
let activeId = null;
let owner = null; // 'pill' ou 'scene'

function loop(ts) {
  requestAnimationFrame(loop);
  if (paused) { last = ts; return; }
  const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
  last = ts;
  tickUI(dt);
  scene().update(dt);
  fx.update(dt);
  beginFrame();
  scene().draw(ctx);
  fx.draw(ctx);
  if (sceneName() !== 'title') langPill.draw(ctx);
}

function onPointer(type, e) {
  if (type === 'down') {
    if (activeId !== null) return; // un seul doigt
    activeId = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
  } else if (e.pointerId !== activeId) {
    return;
  }
  e.preventDefault();
  const p = toLogical(e);
  if (type === 'down') {
    owner = sceneName() !== 'title' && langPill.pointer('down', p.x, p.y) ? 'pill' : 'scene';
  }
  if (owner === 'pill') langPill.pointer(type, p.x, p.y);
  else scene().pointer(type, p.x, p.y);
  if (type === 'up' || type === 'cancel') { activeId = null; owner = null; }
}

async function boot() {
  resize();
  window.addEventListener('resize', resize);
  await Promise.all([loadLanguages(), loadData()]);
  setLang(save.settings.lang || detectLang());

  register('title', title);
  register('operation', operation);
  register('reactivation', reactivation);
  register('done', done);
  register('orders', orders);
  register('shop', shop);
  register('counter', counter);
  register('notebook', notebook);
  register('rank', rank);

  canvas.addEventListener('pointerdown', (e) => onPointer('down', e));
  canvas.addEventListener('pointermove', (e) => onPointer('move', e));
  canvas.addEventListener('pointerup', (e) => onPointer('up', e));
  canvas.addEventListener('pointercancel', (e) => onPointer('cancel', e));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // pause quand l'onglet n'est plus visible (le doigt en cours est relâché)
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (paused && activeId !== null) {
      if (owner === 'scene') scene().pointer('cancel', 0, 0);
      activeId = null;
      owner = null;
    }
  });

  const loading = document.getElementById('loading');
  if (loading) loading.remove();
  go('title');
  requestAnimationFrame(loop);
}

boot().catch((err) => {
  console.error(err);
  const loading = document.getElementById('loading');
  if (loading) loading.textContent = 'Erreur de chargement / Loading error';
});
