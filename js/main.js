// Démarrage, boucle de jeu, doigt (un seul à la fois), pause automatique.
import { canvas, ctx, resize, beginFrame, toLogical } from './canvas.js';
import { loadLanguages, detectLang, setLang } from './i18n.js';
import { save } from './save.js';
import { loadData } from './state.js';
import { register, go, scene } from './scenes.js';
import { tickUI } from './ui.js';
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
import story from './scenes/story.js';

// La langue se choisit uniquement sur l'écran titre.

let last = 0;
let paused = false;
let activeId = null;
let owner = null; // 'scene' tant qu'un doigt est posé

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
  if (type === 'down') owner = 'scene';
  scene().pointer(type, p.x, p.y);
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
  register('story', story);

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
