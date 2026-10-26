// Fin de jeu — une fois les 60 commandes réparées, « Jouer » mène ici au lieu de la liste des commandes :
// trois gros boutons (Défi du jour, Atelier libre, Rejouer les niveaux) et la rangée habituelle
// Boutique · Carnet · Menu. « Rejouer » ouvre la liste (game.replay) ; son « Retour » ramène ici.
import { W } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, STYLES, ACCESS, drawCreamBackground, fitText, roundRect, font } from '../ui.js';
import { game } from '../state.js';
import { save, totalStars } from '../save.js';
import { orderState, orderStars } from '../progress.js';
import { triesLeft, DAILY_TRIES } from '../daily.js';
import { go } from '../scenes.js';
import { askMenu } from '../back.js';
import { leftText, miniStar, shopOpen, notebookOpen, openMode } from './orders.js';
import { seen } from '../tutorial.js';

const DEPTH = 12;
let bottom, big, time;

// Les 60 commandes sont réparées (la liste laisse alors place à cet écran).
export function allDone() {
  const list = game.data.orders;
  return list.length > 0 && list.every((o) => orderState(o) === 'done');
}

// Étoiles qu'il reste à gagner sur l'ensemble des commandes.
export function missingStars() {
  return game.data.orders.reduce((n, o) => n + 3 - orderStars(o), 0);
}

function dailySub() {
  const n = triesLeft();
  if (n <= 0) return t('daily.tomorrow');
  return n === 1 ? t('lobby.daily_1') : t('lobby.daily_n', { n });
}

function replaySub() {
  const m = missingStars();
  if (m <= 0) return { text: t('lobby.all_stars'), star: false };
  return { text: m === 1 ? t('lobby.missing_1') : t('lobby.missing', { n: m }), star: true };
}

// Gros bouton à deux lignes, même relief que les boutons du jeu.
function drawBig(ctx, b, pressed) {
  const st = STYLES[b.style];
  const push = pressed ? DEPTH - 3 : 0;
  const pulse = b.pulse && b.pulse() ? 1 + 0.03 * Math.sin(time * 6) : 1;
  const face = b.h - DEPTH;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-b.w / 2, -b.h / 2);
  ctx.fillStyle = st.shadow;
  roundRect(ctx, 0, DEPTH, b.w, face, 36); ctx.fill();
  ctx.fillStyle = st.fill;
  roundRect(ctx, 0, push, b.w, face, 36); ctx.fill();
  if (ACCESS.contrast) { ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke(); }
  const cy = push + face / 2;
  fitText(ctx, b.label(), b.w / 2, cy - 30, b.w - 60, 64, st.text, 900);
  const sub = b.sub();
  const subColor = b.style === 'secondary' ? (sub.star ? C.orangeDark : C.turquoiseDark) : st.text;
  if (sub.star) {
    // petite étoile devant « x étoiles manquantes »
    ctx.font = font(34, 800);
    const w = Math.min(ctx.measureText(sub.text).width, b.w - 140);
    const sx = b.w / 2 - (w + 48) / 2;
    ctx.save();
    miniStar(ctx, sx + 18, cy + 40, 20, true);
    ctx.restore();
    leftText(ctx, sub.text, sx + 48, cy + 42, b.w - 140, 34, subColor, 800);
  } else {
    fitText(ctx, sub.text, b.w / 2, cy + 42, b.w - 60, 34, subColor, 800);
  }
  ctx.restore();
}

export default {
  init() {
    time = 0;
    game.replay = false;
    big = new Buttons();
    big.add({
      x: 140, y: 570, w: 800, h: 240, style: 'on',
      label: () => t('orders.daily'), sub: () => ({ text: dailySub() }),
      pulse: () => triesLeft() >= DAILY_TRIES,
      onTap: () => openMode('daily'),
    });
    big.add({
      x: 140, y: 870, w: 800, h: 240, style: 'primary',
      label: () => t('orders.free'), sub: () => ({ text: t('lobby.free_sub') }),
      onTap: () => openMode('free'),
    });
    big.add({
      x: 140, y: 1170, w: 800, h: 240, style: 'secondary',
      label: () => t('lobby.replay'), sub: replaySub,
      onTap: () => { game.replay = true; go('orders'); },
    });
    bottom = new Buttons();
    bottom.add({ x: 50, y: 1570, w: 310, h: 160, size: 52, label: () => t('orders.shop'), visible: shopOpen(), onTap: () => go('shop') });
    bottom.add({
      x: 385, y: 1570, w: 310, h: 160, size: 52, label: () => t('orders.notebook'), visible: notebookOpen(),
      onTap: () => (seen('notebook') ? go('notebook') : go('story', { id: 'notebook', then: { scene: 'notebook' } })),
    });
    bottom.add({ x: 720, y: 1570, w: 310, h: 160, size: 52, style: 'secondary', label: () => t('orders.menu'), onTap: () => askMenu() });
  },

  update(dt) {
    time += dt;
  },

  draw(ctx) {
    drawCreamBackground(ctx);
    leftText(ctx, t('counter.sign'), 60, 85, W - 120, 76, C.copperDark, 900);
    leftText(ctx, t('orders.status', { r: save.rank, name: t('rank.' + save.rank), n: save.credits, s: totalStars() }), 60, 180, W - 120, 38, C.inkSoft, 800);
    fitText(ctx, t('lobby.done'), W / 2, 486, W - 160, 40, C.copperDark, 800);
    for (const b of big.list) drawBig(ctx, b, b === big.pressed);
    bottom.draw(ctx);
  },

  pointer(type, x, y) {
    if (big.pointer(type, x, y)) return;
    bottom.pointer(type, x, y);
  },
};
