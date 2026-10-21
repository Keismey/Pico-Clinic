// Liste des commandes : une ligne par réparation, débloquées l'une après l'autre.
import { W } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawToast, roundRect, font } from '../ui.js';
import { game } from '../state.js';
import { save, totalStars } from '../save.js';
import { orderState, orderStars } from '../progress.js';
import { vibrate } from '../feedback.js';
import { go } from '../scenes.js';

const TAU = Math.PI * 2;
const ROW = { x: 50, y: 270, w: W - 100, h: 112, step: 122 };

let buttons, toast, pressed, time;

// Texte aligné à gauche, rétréci s'il est trop long.
export function leftText(ctx, text, x, y, maxW, size, color, weight = 800) {
  let s = size;
  ctx.font = font(s, weight);
  while (ctx.measureText(text).width > maxW && s > 18) { s -= 2; ctx.font = font(s, weight); }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function miniStar(ctx, x, y, r, on) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = on ? '#ffc93c' : 'rgba(58, 42, 30, 0.13)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = on ? '#c4862a' : 'rgba(58, 42, 30, 0.22)';
  ctx.stroke();
}

function drawLock(ctx, x, y) {
  ctx.strokeStyle = C.inkSoft;
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(x, y - 12, 20, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = C.inkSoft;
  roundRect(ctx, x - 30, y - 12, 60, 46, 8); ctx.fill();
}

function rowAt(x, y) {
  const i = Math.floor((y - ROW.y) / ROW.step);
  if (x < ROW.x || x > ROW.x + ROW.w || i < 0 || i >= game.data.orders.length) return -1;
  return y - ROW.y - i * ROW.step <= ROW.h ? i : -1;
}

function showToast(key, vars, color = C.inkSoft) {
  toast = { key, vars, color, t: 2.2, max: 2.2 };
}

function open(o) {
  const st = orderState(o);
  if (st === 'locked') { vibrate([15, 25, 15]); showToast('orders.locked'); return; }
  if (st === 'stars') { vibrate([15, 25, 15]); showToast('orders.need_stars', { n: o.stars_needed, s: totalStars() }, C.orangeDark); return; }
  go('operation', { order: o.id });
}

export default {
  init() {
    toast = null;
    pressed = -1;
    time = 0;
    buttons = new Buttons();
    buttons.add({ x: 60, y: 1560, w: 460, h: 160, size: 58, label: () => t('orders.shop'), onTap: () => go('shop') });
    buttons.add({ x: 560, y: 1560, w: 460, h: 160, size: 58, style: 'secondary', label: () => t('orders.menu'), onTap: () => go('title') });
  },

  update(dt) {
    time += dt;
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
  },

  draw(ctx) {
    drawCreamBackground(ctx);
    leftText(ctx, t('orders.title'), 60, 95, 680, 76, C.copperDark, 900);
    leftText(ctx, t('orders.status', { r: save.rank, name: t('rank.' + save.rank), n: save.credits, s: totalStars() }), 60, 205, W - 120, 38, C.inkSoft, 800);

    game.data.orders.forEach((o, i) => {
      const st = orderState(o);
      const x = ROW.x, y = ROW.y + i * ROW.step, h = ROW.h, cy = y + h / 2;
      const dim = st === 'locked' || st === 'stars';
      ctx.save();
      ctx.globalAlpha = dim ? 0.55 : 1;
      ctx.fillStyle = '#d9c3a3';
      roundRect(ctx, x, y + 8, ROW.w, h - 4, 30); ctx.fill();
      ctx.fillStyle = i === pressed ? '#f3e2c8' : C.paper;
      roundRect(ctx, x, y, ROW.w, h - 6, 30); ctx.fill();
      // numéro
      ctx.fillStyle = st === 'done' ? C.copper : st === 'open' ? C.turquoise : '#b9ab98';
      ctx.beginPath(); ctx.arc(x + 66, cy - 3, 40, 0, TAU); ctx.fill();
      ctx.font = font(40, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(String(o.n), x + 66, cy - 1);
      // patient et client
      const name = o.name ? t(o.name) : t('patient.' + o.model);
      leftText(ctx, name, x + 130, cy - 22, 560, 40, C.ink, 800);
      const sub = t('client.' + o.client) + (o.exam ? '  ·  ' + t('orders.exam', { r: o.exam }) : '');
      leftText(ctx, sub, x + 130, cy + 22, 560, 30, o.exam ? C.orangeDark : C.inkSoft, 700);
      // à droite : étoiles, nouveau, cadenas ou étoiles nécessaires
      const rx = x + ROW.w - 60;
      if (st === 'done') {
        const n = orderStars(o);
        for (let k = 0; k < 3; k++) miniStar(ctx, rx - 180 + k * 70, cy - 3, 28, k < n);
      } else if (st === 'open') {
        const a = 0.75 + 0.25 * Math.sin(time * 5);
        ctx.globalAlpha = a;
        ctx.font = font(34, 900); ctx.textAlign = 'right';
        ctx.fillStyle = C.orange;
        ctx.fillText(t('orders.new'), rx + 20, cy - 3);
      } else if (st === 'stars') {
        miniStar(ctx, rx - 110, cy - 3, 26, true);
        ctx.font = font(36, 900); ctx.textAlign = 'right'; ctx.fillStyle = C.ink;
        ctx.fillText(`${totalStars()}/${o.stars_needed}`, rx + 20, cy - 1);
      } else {
        drawLock(ctx, rx - 10, cy);
      }
      ctx.restore();
    });

    buttons.draw(ctx);
    if (toast) drawToast(ctx, t(toast.key, toast.vars), W / 2, 950, toast.t / toast.max, toast.color);
  },

  pointer(type, x, y) {
    if (buttons.pointer(type, x, y)) return;
    if (type === 'down') pressed = rowAt(x, y);
    else if (type === 'up') {
      const i = rowAt(x, y);
      if (i >= 0 && i === pressed) { vibrate(10); open(game.data.orders[i]); }
      pressed = -1;
    } else if (type === 'cancel') pressed = -1;
  },
};
