// Boutique d'outils : 4 outils, 3 niveaux chacun, chaque niveau demande un rang minimum.
import { W } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawToast, roundRect } from '../ui.js';
import { save } from '../save.js';
import { toolLevel } from '../state.js';
import { TOOL_KEYS, currentTool, nextTool, buyState, buyTool } from '../progress.js';
import { vibrate } from '../feedback.js';
import * as fx from '../particles.js';
import { go } from '../scenes.js';
import { leftText } from './orders.js';
import { seen, markSeen, drawGribBox } from '../tutorial.js';

// Première visite : Gribouille présente la boutique (tutoriel, après la commande 1).
const TUTO = ['tuto.shop_here', 'tuto.shop_here2'];

const TAU = Math.PI * 2;
const CARD = { x: 40, y: 270, w: W - 80, h: 272, step: 300 };

let buttons, toast, time, tuto;

function showToast(key, vars, color = C.inkSoft) {
  toast = { key, vars, color, t: 2, max: 2 };
}

// Petites icônes d'outils.
function drawIcon(ctx, k, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  if (k === 'iron') {
    ctx.rotate(-0.8);
    ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -10); ctx.stroke();
    ctx.strokeStyle = C.orange; ctx.lineWidth = 30;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 60); ctx.stroke();
  } else if (k === 'vacuum') {
    ctx.strokeStyle = '#6b7684'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(50, 10, 40, 60); ctx.stroke();
    ctx.fillStyle = C.turquoise;
    ctx.beginPath(); ctx.arc(-20, -20, 40, 0, TAU); ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.beginPath(); ctx.arc(-20, -20, 18, 0, TAU); ctx.fill();
  } else if (k === 'lens') {
    ctx.strokeStyle = C.copperDark; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.moveTo(25, 25); ctx.lineTo(62, 62); ctx.stroke();
    ctx.fillStyle = 'rgba(159, 245, 231, 0.6)';
    ctx.beginPath(); ctx.arc(-10, -10, 46, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6b7684'; ctx.lineWidth = 10; ctx.stroke();
  } else {
    ctx.strokeStyle = '#aeb6c0'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(-8, -70); ctx.lineTo(-30, 60); ctx.moveTo(8, -70); ctx.lineTo(30, 60); ctx.stroke();
    ctx.fillStyle = '#7b8592';
    ctx.beginPath(); ctx.arc(0, -70, 16, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function tap(k, i) {
  const st = buyState(k);
  const n = nextTool(k);
  if (st === 'ok') {
    buyTool(k);
    vibrate([10, 20, 40]);
    const cy = CARD.y + i * CARD.step + CARD.h / 2;
    fx.spawn(CARD.x + 110, cy, { count: 26, color: '#ffd36b', speed: 480, size: 8 });
    showToast('shop.bought', { name: t('tool.' + n.id) }, C.green);
  } else {
    vibrate([15, 25, 15]);
    if (st === 'rank') showToast('shop.toast_rank', { r: n.rank });
    else if (st === 'money') showToast('shop.toast_money', { n: n.price - save.credits });
    else showToast('shop.maxed');
  }
}

export default {
  init() {
    tuto = seen('shop') ? null : { i: 0, shown: 0 };
    toast = null;
    time = 0;
    buttons = new Buttons();
    TOOL_KEYS.forEach((k, i) => {
      buttons.add({
        x: CARD.x + CARD.w - 262, y: CARD.y + i * CARD.step + 60, w: 236, h: 150, size: 40,
        style: 'secondary',
        label: () => {
          const n = nextTool(k);
          if (!n) return t('shop.max_short');
          return buyState(k) === 'rank' ? t('shop.need_rank', { r: n.rank }) : t('shop.price', { n: n.price });
        },
        onTap: () => tap(k, i),
      });
    });
    buttons.add({ x: 240, y: 1560, w: 600, h: 160, size: 60, label: () => t('shop.back'), onTap: () => go('orders') });
  },

  update(dt) {
    time += dt;
    if (tuto) tuto.shown = Math.min(t(TUTO[tuto.i]).length, tuto.shown + 42 * dt);
    for (const b of buttons.list) b.visible = !tuto;
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
    // bouton orange seulement si l'achat est possible
    TOOL_KEYS.forEach((k, i) => {
      const ok = buyState(k) === 'ok';
      buttons.list[i].style = ok ? 'primary' : 'secondary';
      buttons.list[i].pulse = ok;
    });
  },

  draw(ctx) {
    drawCreamBackground(ctx);
    leftText(ctx, t('shop.title'), 60, 95, 680, 76, C.copperDark, 900);
    leftText(ctx, t('shop.status', { n: save.credits, r: save.rank, name: t('rank.' + save.rank) }), 60, 205, W - 120, 38, C.inkSoft, 800);

    TOOL_KEYS.forEach((k, i) => {
      const x = CARD.x, y = CARD.y + i * CARD.step, w = CARD.w, h = CARD.h;
      const lv = toolLevel(k);
      ctx.fillStyle = '#d9c3a3';
      roundRect(ctx, x, y + 10, w, h - 4, 34); ctx.fill();
      ctx.fillStyle = C.paper;
      roundRect(ctx, x, y, w, h - 8, 34); ctx.fill();
      // icône et niveau
      ctx.fillStyle = 'rgba(63, 208, 187, 0.15)';
      ctx.beginPath(); ctx.arc(x + 110, y + 112, 88, 0, TAU); ctx.fill();
      drawIcon(ctx, k, x + 110, y + 112);
      for (let d = 0; d < 3; d++) {
        ctx.fillStyle = d < lv ? C.turquoise : 'rgba(58, 42, 30, 0.15)';
        ctx.beginPath(); ctx.arc(x + 70 + d * 40, y + 228, 13, 0, TAU); ctx.fill();
      }
      // textes
      const tw = w - 520;
      leftText(ctx, t('tool.' + currentTool(k).id), x + 220, y + 52, tw, 44, C.ink, 900);
      leftText(ctx, t('shop.level', { l: lv }), x + 220, y + 100, tw, 30, C.inkSoft, 700);
      const n = nextTool(k);
      if (n) {
        leftText(ctx, t('shop.next', { name: t('tool.' + n.id) }), x + 220, y + 158, tw, 32, C.copperDark, 800);
        leftText(ctx, t('tool.' + n.id + '.desc'), x + 220, y + 206, tw, 28, C.inkSoft, 700);
      } else {
        leftText(ctx, t('shop.max'), x + 220, y + 170, tw, 32, C.green, 800);
      }
    });

    buttons.draw(ctx);
    if (tuto) drawGribBox(ctx, { x: 60, y: 1530, w: W - 120, h: 300 }, t(TUTO[tuto.i]), tuto.shown, time, { more: true, size: 42 });
    if (toast) drawToast(ctx, t(toast.key, toast.vars), W / 2, 1800, toast.t / toast.max, toast.color);
  },

  pointer(type, x, y) {
    if (tuto) {
      if (type !== 'up') return;
      const len = t(TUTO[tuto.i]).length;
      if (tuto.shown < len) { tuto.shown = len; return; }
      vibrate(8);
      if (tuto.i < TUTO.length - 1) { tuto.i++; tuto.shown = 0; } else { tuto = null; markSeen('shop'); }
      return;
    }
    buttons.pointer(type, x, y);
  },
};
