// Scènes d'histoire (data/story.json) : carte de chapitre, puis Gribouille raconte en quelques bulles.
// Chaque scène n'est jouée qu'une fois (identifiant rangé dans save.story).
import { W, H } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, fitText, font, roundRect, wrapLines, easeInOut } from '../ui.js';
import { drawGribouille } from '../portraits.js';
import { game } from '../state.js';
import { seen, markSeen } from '../tutorial.js';
import { vibrate } from '../feedback.js';
import * as fx from '../particles.js';
import { go } from '../scenes.js';
import { drawWorkshop, drawCounter } from './counter.js';

const TAU = Math.PI * 2;
const BOX = { x: 50, y: 1190, w: W - 100, h: 340 };
const TEXT = { x: 100, y: 1262, w: W - 200, size: 48, lineH: 62 };
const CPS = 42;
const CARD_TIME = 2.8;

let sc, id, then, phase, time, idx, shown, wrapped, buttons, sparkled;

// Scène à jouer après une commande (null si aucune ou déjà vue).
export function storyAfter(order) {
  const s = game.data.story && game.data.story.after_order[String(order.n)];
  return s && !seen(s) ? s : null;
}

// Scène d'ouverture d'un chapitre (null si aucune ou déjà vue).
export function chapterStory(rank) {
  const s = 'ch' + rank;
  return game.data.story && game.data.story.scenes[s] && !seen(s) ? s : null;
}

function text() {
  return t(sc.lines[idx]);
}

function atEnd() {
  return idx >= sc.lines.length - 1 && shown >= text().length;
}

function finish() {
  markSeen(id);
  go(then.scene, then.params || {});
}

function advance() {
  if (phase === 'card') { phase = 'talk'; time = Math.max(time, CARD_TIME); return; }
  const len = text().length;
  if (shown < len) { shown = len; return; }
  if (idx < sc.lines.length - 1) { idx++; shown = 0; wrapped = null; vibrate(8); return; }
  finish();
}

// Le carnet de Maître Ohm, ouvert sur le comptoir.
function drawNotebook(ctx, x, y, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.06);
  ctx.scale(k, k);
  ctx.fillStyle = '#7a3f1d';
  roundRect(ctx, -300, -175, 600, 360, 26); ctx.fill();
  ctx.fillStyle = '#fbf3e2';
  roundRect(ctx, -284, -165, 280, 330, 14); ctx.fill();
  roundRect(ctx, 4, -165, 280, 330, 14); ctx.fill();
  ctx.fillStyle = 'rgba(58, 42, 30, 0.18)';
  ctx.fillRect(-6, -165, 12, 330);
  // page de gauche : croquis d'un drone
  ctx.strokeStyle = '#5b6b8a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeRect(-200, -60, 110, 110);
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    ctx.beginPath(); ctx.arc(-145 + dx * 85, -5 + dy * 85, 32, 0, TAU); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-90, 50); ctx.lineTo(-40, 110); ctx.lineTo(-30, 110); ctx.stroke();
  ctx.font = 'italic 600 22px Georgia, "Times New Roman", serif';
  ctx.fillStyle = '#5b6b8a';
  ctx.textAlign = 'left';
  ctx.fillText('M.O.', -60, 128);
  // page de droite : une pensée de Maître Ohm, écrite à la main
  ctx.font = 'italic 600 30px Georgia, "Times New Roman", serif';
  const lines = wrapLines(ctx, t('story.nb.page'), 230);
  ctx.fillStyle = '#4a3a2c';
  lines.forEach((l, i) => ctx.fillText(l, 30, -110 + i * 40));
  ctx.restore();
}

function drawBox(ctx) {
  ctx.fillStyle = '#d9c3a3';
  roundRect(ctx, BOX.x, BOX.y + 10, BOX.w, BOX.h, 40); ctx.fill();
  ctx.fillStyle = C.paper;
  roundRect(ctx, BOX.x, BOX.y, BOX.w, BOX.h, 40); ctx.fill();
  ctx.strokeStyle = '#6b7684';
  ctx.lineWidth = 6;
  ctx.stroke();
  const name = t('name.gribouille');
  ctx.font = font(38, 900);
  const nw = ctx.measureText(name).width + 70;
  ctx.fillStyle = '#6b7684';
  roundRect(ctx, BOX.x + 40, BOX.y - 40, nw, 76, 38); ctx.fill();
  fitText(ctx, name, BOX.x + 40 + nw / 2, BOX.y - 1, nw - 40, 38, '#fff', 900);
  ctx.font = font(TEXT.size, 700);
  if (!wrapped) wrapped = wrapLines(ctx, text(), TEXT.w);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.ink;
  let left = Math.floor(shown);
  wrapped.forEach((line, i) => {
    if (left <= 0) return;
    ctx.fillText(line.slice(0, left), TEXT.x, TEXT.y + i * TEXT.lineH);
    left -= line.length + 1;
  });
  if (shown >= text().length && Math.sin(time * 6) > -0.3) {
    ctx.fillStyle = C.orange;
    const x = BOX.x + BOX.w - 60, y = BOX.y + BOX.h - 46;
    ctx.beginPath(); ctx.moveTo(x - 18, y - 10); ctx.lineTo(x + 18, y - 10); ctx.lineTo(x, y + 12); ctx.closePath(); ctx.fill();
  }
  sc.lines.forEach((_, i) => {
    ctx.fillStyle = i === idx ? C.copper : 'rgba(58, 42, 30, 0.2)';
    ctx.beginPath(); ctx.arc(W / 2 + (i - (sc.lines.length - 1) / 2) * 34, 1860, 10, 0, TAU); ctx.fill();
  });
}

// Carte de chapitre : grand titre sur fond cuivre, qui s'efface.
function drawCard(ctx) {
  if (!sc.chapter) return;
  const a = phase === 'card' ? Math.min(1, time / 0.4) : Math.max(0, 1 - (time - CARD_TIME) / 0.5);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#5a3418';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255, 210, 160, 0.25)';
  ctx.lineWidth = 6;
  roundRect(ctx, 60, 560, W - 120, 640, 50); ctx.stroke();
  const k = easeInOut(Math.min(1, time / 0.8));
  ctx.font = font(96, 900);
  const lines = wrapLines(ctx, t('chapter.' + sc.chapter + '.title'), 880);
  const extra = (lines.length - 1) * 55;
  fitText(ctx, t('chapter.n', { n: sc.chapter }), W / 2, 760 - extra - (1 - k) * 40, 800, 64, '#ffd9a8', 800);
  ctx.save();
  ctx.translate(W / 2, 900);
  ctx.font = font(96, 900);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => {
    const y = (i - (lines.length - 1) / 2) * 110;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 22;
    ctx.strokeStyle = C.copperDark;
    ctx.strokeText(l, 0, y);
    ctx.fillStyle = C.turquoise;
    ctx.fillText(l, 0, y);
  });
  ctx.restore();
  fitText(ctx, t('chapter.' + sc.chapter + '.sub'), W / 2, 1100 + extra * 0.6, 860, 38, 'rgba(255, 230, 200, 0.85)', 700);
  ctx.restore();
}

export default {
  init(params = {}) {
    id = params.id;
    sc = game.data.story.scenes[id];
    then = params.then || { scene: 'orders' };
    if (!sc) { go(then.scene, then.params || {}); return; }
    phase = sc.chapter ? 'card' : 'talk';
    time = 0;
    idx = 0;
    shown = 0;
    wrapped = null;
    sparkled = false;
    buttons = new Buttons();
    buttons.add({
      x: 60, y: 1640, w: 300, h: 140, size: 44, style: 'secondary',
      label: () => t('counter.skip'),
      onTap: () => finish(),
    });
    buttons.add({
      x: 400, y: 1620, w: 620, h: 170, size: 58,
      label: () => (atEnd() ? t('done.continue') : t('counter.next')),
      onTap: () => advance(),
    });
  },

  update(dt) {
    time += dt;
    if (phase === 'card') {
      if (time >= CARD_TIME) phase = 'talk';
      for (const b of buttons.list) b.visible = false;
      return;
    }
    // une poignée d'étincelles quand le carnet apparaît
    if (sc.backdrop === 'notebook' && !sparkled) {
      sparkled = true;
      fx.spawn(720, 880, { count: 22, color: '#ffd36b', speed: 380, size: 7 });
    }
    const len = text().length;
    if (shown < len) shown = Math.min(len, shown + CPS * dt);
    buttons.list[0].visible = idx < sc.lines.length - 1;
    buttons.list[1].visible = true;
    buttons.list[1].pulse = atEnd();
  },

  draw(ctx) {
    drawWorkshop(ctx);
    drawCounter(ctx);
    const talk = phase === 'talk' && shown < text().length;
    if (sc.backdrop === 'notebook') {
      drawGribouille(ctx, 230, 870 - (talk ? Math.abs(Math.sin(time * 8)) * 10 : 0), 0.95, { time, talk });
      drawNotebook(ctx, 700, 870, 0.62 + 0.04 * Math.sin(time * 1.5));
    } else {
      drawGribouille(ctx, W / 2, 860 - (talk ? Math.abs(Math.sin(time * 8)) * 14 : 0), 1.25, { time, talk });
    }
    if (phase === 'talk') drawBox(ctx);
    buttons.draw(ctx);
    drawCard(ctx);
  },

  pointer(type, x, y) {
    if (phase === 'talk' && buttons.pointer(type, x, y)) return;
    if (type === 'up') advance();
  },
};
