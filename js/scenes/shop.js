// Boutique d'outils : 4 outils, 3 niveaux chacun, chaque niveau demande un rang minimum.
import { W } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawCreamBackground, drawToast, roundRect, fitText } from '../ui.js';
import { decoList, decoState, buyDeco, hasDeco, drawDeco, ICON_SCALE } from '../deco.js';
import { save } from '../save.js';
import { game, toolLevel } from '../state.js';
import { TOOL_KEYS, currentTool, nextTool, buyState, buyTool } from '../progress.js';
import { vibrate } from '../feedback.js';
import * as fx from '../particles.js';
import { go } from '../scenes.js';
import { leftText } from './orders.js';
import { seen, markSeen, drawGribBox } from '../tutorial.js';

// Première visite : Gribouille présente la boutique (tutoriel, après la commande 1).
const TUTO = ['tuto.shop_here', 'tuto.shop_here2'];

const TAU = Math.PI * 2;
// 5 outils : cartes un peu plus serrées (la dévisseuse en premier)
const CARD = { x: 40, y: 360, w: W - 80, h: 220, step: 238 };
// V3b : onglet des décorations (2 colonnes × 4 lignes)
const TABS = { x: 40, y: 250, w: W - 80, h: 86 };
const DCARD = { x: 40, y: 360, w: (W - 100) / 2, h: 270, stepX: (W - 100) / 2 + 20, stepY: 290 };

let buttons, toast, time, tuto, page = 'tools';

function showToast(key, vars, color = C.inkSoft) {
  toast = { key, vars, color, t: 2, max: 2 };
}

// Petites icônes d'outils.
function drawIcon(ctx, k, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  if (k === 'driver') {
    // tournevis, ou dévisseuse électrique une fois achetée
    ctx.rotate(-0.7);
    ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(0, -75); ctx.lineTo(0, -15); ctx.stroke();
    if (toolLevel('driver') > 1) {
      ctx.fillStyle = C.turquoise; roundRect(ctx, -30, -20, 60, 50, 14); ctx.fill();
      ctx.fillStyle = '#374151'; roundRect(ctx, -16, 24, 32, 50, 10); ctx.fill();
      ctx.fillStyle = '#ffd166'; ctx.fillRect(-20, -6, 10, 20);
    } else {
      // manche jaune strié et bout plat (différent du fer à souder)
      ctx.fillStyle = '#ffd166'; roundRect(ctx, -17, -15, 34, 80, 14); ctx.fill();
      ctx.strokeStyle = '#c4862a'; ctx.lineWidth = 4;
      for (const dx of [-7, 0, 7]) { ctx.beginPath(); ctx.moveTo(dx, -5); ctx.lineTo(dx, 55); ctx.stroke(); }
      ctx.fillStyle = '#9aa3ad'; ctx.fillRect(-9, -84, 18, 10);
    }
  } else if (k === 'iron') {
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

function tapDeco(d, x, y) {
  const st = decoState(d);
  if (st === 'ok') {
    buyDeco(d);
    vibrate([10, 20, 40]);
    fx.spawn(x + 110, y + 150, { count: 26, color: '#ffd36b', speed: 480, size: 8 });
    showToast('shop.deco_bought', { name: t('deco.' + d.id) }, C.green);
  } else {
    vibrate([15, 25, 15]);
    if (st === 'rank') showToast('shop.toast_rank', { r: d.rank });
    else if (st === 'money') showToast('shop.toast_money', { n: d.price - save.credits });
    else showToast('shop.deco_owned');
  }
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
  init(params = {}) {
    tuto = seen('shop') ? null : { i: 0, shown: 0 };
    toast = null;
    time = 0;
    if (params.page) page = params.page;
    if (tuto) page = 'tools';
    this.build();
  },

  build() {
    buttons = new Buttons();
    if (page === 'tools') {
      TOOL_KEYS.forEach((k, i) => {
        buttons.add({
          x: CARD.x + CARD.w - 262, y: CARD.y + i * CARD.step + 44, w: 236, h: 130, size: 38,
          style: 'secondary', tool: k,
          label: () => {
            const n = nextTool(k);
            if (!n) return t('shop.max_short');
            return buyState(k) === 'rank' ? t('shop.need_rank', { r: n.rank }) : t('shop.price', { n: n.price });
          },
          onTap: () => tap(k, i),
        });
      });
    } else {
      decoList().forEach((d, i) => {
        const x = DCARD.x + (i % 2) * DCARD.stepX, y = DCARD.y + Math.floor(i / 2) * DCARD.stepY;
        buttons.add({
          x: x + DCARD.w - 210, y: y + 150, w: 190, h: 100, size: 34, style: 'secondary', deco: d,
          label: () => {
            const st = decoState(d);
            if (st === 'owned') return t('shop.owned');
            return st === 'rank' ? t('shop.need_rank', { r: d.rank }) : t('shop.price', { n: d.price });
          },
          onTap: () => tapDeco(d, x, y),
        });
      });
    }
    buttons.add({ x: 240, y: 1580, w: 600, h: 160, size: 60, label: () => t('shop.back'), onTap: () => go('orders') });
  },

  update(dt) {
    time += dt;
    if (tuto) tuto.shown = Math.min(t(TUTO[tuto.i]).length, tuto.shown + 42 * dt);
    for (const b of buttons.list) b.visible = !tuto;
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
    // bouton orange seulement si l'achat est possible
    for (const b of buttons.list) {
      if (!b.tool && !b.deco) continue;
      const ok = b.tool ? buyState(b.tool) === 'ok' : decoState(b.deco) === 'ok';
      b.style = ok ? 'primary' : 'secondary';
      b.pulse = ok;
    }
  },

  draw(ctx) {
    drawCreamBackground(ctx);
    leftText(ctx, t('shop.title'), 60, 95, 680, 76, C.copperDark, 900);
    leftText(ctx, t('shop.status', { n: save.credits, r: save.rank, name: t('rank.' + save.rank) }), 60, 205, W - 120, 38, C.inkSoft, 800);

    this.drawTabs(ctx);
    if (page === 'tools') this.drawTools(ctx); else this.drawDecos(ctx);

    buttons.draw(ctx);
    if (tuto) drawGribBox(ctx, { x: 60, y: 1530, w: W - 120, h: 300 }, t(TUTO[tuto.i]), tuto.shown, time, { more: true, size: 42 });
    if (toast) drawToast(ctx, t(toast.key, toast.vars), W / 2, 1800, toast.t / toast.max, toast.color);
  },

  drawTabs(ctx) {
    ['tools', 'deco'].forEach((pg, i) => {
      const w = TABS.w / 2, x = TABS.x + i * w, on = pg === page;
      ctx.fillStyle = on ? C.copper : 'rgba(196, 122, 60, 0.15)';
      roundRect(ctx, x + 4, TABS.y, w - 8, TABS.h, 30); ctx.fill();
      fitText(ctx, t('shop.tab.' + pg), x + w / 2, TABS.y + TABS.h / 2 + 2, w - 40, 38, on ? '#fff' : C.copperDark, 900);
    });
  },

  drawTools(ctx) {
    TOOL_KEYS.forEach((k, i) => {
      const x = CARD.x, y = CARD.y + i * CARD.step, w = CARD.w, h = CARD.h;
      const lv = toolLevel(k);
      const n = game.data.tools[k].levels.length;
      ctx.fillStyle = '#d9c3a3';
      roundRect(ctx, x, y + 10, w, h - 4, 34); ctx.fill();
      ctx.fillStyle = C.paper;
      roundRect(ctx, x, y, w, h - 8, 34); ctx.fill();
      // icône et niveau
      ctx.fillStyle = 'rgba(63, 208, 187, 0.15)';
      ctx.beginPath(); ctx.arc(x + 110, y + 88, 72, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(x + 110, y + 88); ctx.scale(0.85, 0.85); drawIcon(ctx, k, 0, 0); ctx.restore();
      for (let d = 0; d < n; d++) {
        ctx.fillStyle = d < lv ? C.turquoise : 'rgba(58, 42, 30, 0.15)';
        ctx.beginPath(); ctx.arc(x + 110 + (d - (n - 1) / 2) * 40, y + 184, 12, 0, TAU); ctx.fill();
      }
      // textes
      const tw = w - 520;
      leftText(ctx, t('tool.' + currentTool(k).id), x + 220, y + 42, tw, 42, C.ink, 900);
      leftText(ctx, t('shop.level', { l: lv, n }), x + 220, y + 84, tw, 28, C.inkSoft, 700);
      const nx = nextTool(k);
      if (nx) {
        leftText(ctx, t('shop.next', { name: t('tool.' + nx.id) }), x + 220, y + 130, tw, 30, C.copperDark, 800);
        leftText(ctx, t('tool.' + nx.id + '.desc'), x + 220, y + 170, tw, 26, C.inkSoft, 700);
      } else {
        leftText(ctx, t('shop.max'), x + 220, y + 140, tw, 30, C.green, 800);
      }
    });
  },

  drawDecos(ctx) {
    decoList().forEach((d, i) => {
      const x = DCARD.x + (i % 2) * DCARD.stepX, y = DCARD.y + Math.floor(i / 2) * DCARD.stepY, w = DCARD.w, h = DCARD.h;
      const owned = hasDeco(d.id);
      ctx.fillStyle = '#d9c3a3';
      roundRect(ctx, x, y + 10, w, h - 4, 34); ctx.fill();
      ctx.fillStyle = owned ? '#eaf6ee' : C.paper;
      roundRect(ctx, x, y, w, h - 8, 34); ctx.fill();
      ctx.fillStyle = 'rgba(196, 122, 60, 0.12)';
      ctx.beginPath(); ctx.arc(x + 110, y + 150, 80, 0, TAU); ctx.fill();
      if (d.id === 'neon_sign') {
        // l'enseigne seule, en petit, pour montrer le cadre lumineux autour
        ctx.fillStyle = '#c47a3c';
        roundRect(ctx, x + 110 - 62, y + 150 - 16, 124, 32, 8); ctx.fill();
      }
      drawDeco(ctx, d.id, x + 110, y + 150, ICON_SCALE[d.id] || 0.7, time);
      fitText(ctx, t('deco.' + d.id), x + w / 2, y + 50, w - 50, 38, C.ink, 900);
      if (owned) fitText(ctx, t('shop.in_workshop'), x + w - 115, y + 120, 200, 26, C.green, 800);
    });
  },

  pointer(type, x, y) {
    if (!tuto && type === 'up' && y >= TABS.y && y <= TABS.y + TABS.h && x >= TABS.x && x <= TABS.x + TABS.w) {
      const pg = x < TABS.x + TABS.w / 2 ? 'tools' : 'deco';
      if (pg !== page) { page = pg; vibrate(8); this.build(); }
      return;
    }
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
