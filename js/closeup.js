// V3a — Vue rapprochée des gestes secondaires.
// Sur la carte, chaque pièce en panne (batterie, engrenage, capteur, broches, ressort, piles,
// circuit oxydé) a une petite icône qui clignote. La toucher ouvre un grand panneau où l'on fait
// le geste ; réussi, le panneau se referme tout seul et la panne disparaît. La croix referme sans
// rien perdre (on peut revenir plus tard).
import { W, H } from './canvas.js';
import { t } from './i18n.js';
import { C, roundRect, fitText, easeInOut } from './ui.js';
import { SEC, isHidden } from './drone.js';
import { demo } from './tutorial.js';
import { toneStop } from './feedback.js';
import { createBattery } from './gestures/battery.js';
import { createGear, drawGear } from './gestures/gear.js';
import { createSensor } from './gestures/sensor.js';
import { createPins } from './gestures/pins.js';
import { createSpring } from './gestures/spring.js';
import { createBatteries } from './gestures/batteries.js';
import { createOxide } from './gestures/oxide.js';

const TAU = Math.PI * 2;
export const PANEL = { x: 60, y: 300, w: 960, h: 960, cx: 540, cy: 780 };
const CLOSE = { x: 966, y: 354, r: 44 };

const MAKE = {
  battery: (g, fx) => createBattery(g.battery, fx),
  heart: (g, fx) => createBattery(g.battery, fx, { heart: true }),
  gear: (g, fx) => createGear(g.gear, fx),
  sensor: (g, fx) => createSensor(g.sensor, fx),
  pins: (g, fx, p) => createPins(g.pins, fx, { count: p.pins }),
  spring: (g, fx) => createSpring(g.spring, fx),
  batteries: (g, fx) => createBatteries(g.batteries, fx),
  oxide: (g, fx) => createOxide(g.oxide, fx),
};

// ---------- Icônes sur la carte ----------

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.5, y + s * 0.1, x - s * 1.1, y - s * 1.1, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 1.1, y - s * 1.1, x + s * 1.5, y + s * 0.1, x, y + s * 0.9);
  ctx.closePath();
}

function drawIcon(ctx, type, x, y, broken, time) {
  ctx.save();
  const blink = 0.5 + 0.5 * Math.sin(time * 8);
  switch (type) {
    case 'battery':
      if (!broken) break; // la batterie normale est déjà dessinée par la carte
      ctx.fillStyle = '#e8b84a';
      ctx.beginPath(); ctx.ellipse(x, y, 78, 72, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#a8781f'; ctx.lineWidth = 6; ctx.stroke();
      ctx.fillStyle = C.red;
      ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '900 36px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y + 2);
      break;
    case 'heart':
      ctx.fillStyle = '#2f8a5b';
      roundRect(ctx, x - 70, y - 66, 140, 134, 18); ctx.fill();
      heartPath(ctx, x, y + 4, 54);
      ctx.fillStyle = broken ? '#c98aa0' : '#ff5c8a'; ctx.fill();
      ctx.strokeStyle = broken ? '#8a5466' : '#b8264f'; ctx.lineWidth = 6; ctx.stroke();
      ctx.fillStyle = broken ? `rgba(214, 69, 69, ${0.5 + 0.5 * blink})` : C.green;
      roundRect(ctx, x - 22, y - 6, broken ? 12 : 44, 18, 5); ctx.fill();
      break;
    case 'gear':
      drawGear(ctx, x - 14, y + 4, 30, 9, broken ? 0.2 : time * 2);
      drawGear(ctx, x + 32, y - 18, 18, 7, broken ? 0 : -time * 3.4, { color: '#c9a24a', dark: '#7a5a1a' });
      if (broken) { ctx.fillStyle = '#7d7468'; ctx.beginPath(); ctx.arc(x + 18, y + 6, 11, 0, TAU); ctx.fill(); }
      break;
    case 'sensor':
      ctx.fillStyle = '#1f2937';
      roundRect(ctx, x - 44, y - 26, 88, 52, 10); ctx.fill();
      ctx.fillStyle = '#5fd3ff';
      ctx.beginPath(); ctx.arc(x - 16, y, 14, 0, TAU); ctx.fill();
      ctx.fillStyle = broken ? `rgba(214, 69, 69, ${0.4 + 0.6 * blink})` : C.green;
      ctx.beginPath(); ctx.arc(x + 22, y - 6, 8, 0, TAU); ctx.fill();
      break;
    case 'pins':
      ctx.fillStyle = '#1f2937';
      roundRect(ctx, x - 48, y + 14, 96, 22, 6); ctx.fill();
      ctx.strokeStyle = '#e3b450'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const px = x - 36 + i * 18;
        const a = broken && (i === 1 || i === 3) ? (i === 1 ? -0.5 : 0.45) : 0;
        ctx.beginPath(); ctx.moveTo(px, y + 16); ctx.lineTo(px + Math.sin(a) * 44, y + 16 - Math.cos(a) * 44); ctx.stroke();
      }
      break;
    case 'spring':
      ctx.strokeStyle = '#b9c2cc'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 8; k++) {
        const yy = y - 36 + k * 9 * (broken ? 1 + (k % 3) * 0.25 : 1);
        ctx.lineTo(x + (k % 2 ? 26 : -26), yy);
      }
      ctx.stroke();
      break;
    case 'batteries':
      ctx.fillStyle = '#244a8a';
      ctx.fillRect(x - 48, y - 40, 96, 34);
      if (broken) { ctx.fillStyle = 'rgba(150, 132, 108, 0.8)'; ctx.fillRect(x - 48, y - 40, 96, 34); }
      for (const dx of [-20, 20]) {
        ctx.fillStyle = broken ? '#8a8279' : '#3fd0bb';
        roundRect(ctx, x + dx - 14, y + 2, 28, 46, 7); ctx.fill();
      }
      break;
    case 'oxide':
      ctx.fillStyle = '#e8d6b0';
      for (const [dx, dy] of [[-30, -16], [10, -24], [-14, 16], [26, 14]]) { roundRect(ctx, x + dx - 14, y + dy - 6, 28, 12, 4); ctx.fill(); }
      if (broken) {
        ctx.fillStyle = 'rgba(110, 196, 170, 0.85)';
        for (const [dx, dy, r] of [[-8, -4, 22], [22, -2, 16], [-28, 22, 14]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, TAU); ctx.fill(); }
      }
      break;
    default:
  }
  ctx.restore();
}

// ---------- Gestionnaire ----------

// hooks : { toast(key, color, vars), vibrate(p), spawn(x, y, opts), fixed(fault) }
export function createCloseup(rep, hooks) {
  const items = Object.entries(rep.bay || {}).map(([fault, spot]) => ({ fault, type: SEC[fault], spot, mod: null }));
  let open = null;   // { item, k, closing, success }

  const fx = {
    ok: (key, vars) => hooks.toast(key, C.green, vars),
    bad: (key, vars) => hooks.toast(key, C.red, vars),
    info: (key, vars) => hooks.toast(key, C.inkSoft, vars),
    vibrate: (p) => hooks.vibrate(p),
    spawn: (x, y, o) => hooks.spawn(x, y, o),
    care: (n) => { rep.care = (rep.care || 0) + n; },
    score: (v) => { (rep.scores = rep.scores || []).push(Math.max(0, Math.min(1, v))); },
  };

  function broken(it) {
    return rep.faults.has(it.fault);
  }

  function openItem(it) {
    if (!it.mod) it.mod = MAKE[it.type](rep.g, fx, rep.patient.order || {});
    open = { item: it, k: 0, closing: false, success: 0 };
    hooks.vibrate(12);
  }

  function close() {
    if (!open) return;
    if (open.item.mod) open.item.mod.up();
    toneStop();
    open.closing = true;
  }

  const ready = () => open && open.k >= 1 && !open.closing && !open.success;

  return {
    get active() { return !!open; },
    get current() { return open && !open.closing ? open.item : null; },

    // Leçons de Gribouille (une par type de panne présent, la première fois seulement).
    lessons() {
      const seenTypes = new Set();
      const out = [];
      for (const it of items) {
        if (seenTypes.has(it.type)) continue;
        seenTypes.add(it.type);
        const mine = () => !!(open && open.item.type === it.type);
        const mod = () => (mine() && open.k >= 1 ? open.item.mod : null);
        out.push({
          id: 'sec_' + it.type,
          key: () => (mine() ? 'tuto.sec.' + it.type + '2' : 'tuto.sec.' + it.type),
          praise: 'tuto.bravo',
          start: () => rep.coverAnim >= 1 && rep.phase === 'repair' && (!open || mine()),
          done: () => !items.some((x) => x.type === it.type && broken(x)),
          demo: () => (open ? (mod() && mod().demo ? mod().demo() : null) : demo.tap(it.spot.x, it.spot.y)),
          ring: () => (open ? null : { x: it.spot.x, y: it.spot.y, r: it.spot.r + 20 }),
          offset: () => (mod() && mod().offset ? mod().offset() : [0, 0]),
          carry: (c, x, y, p) => { const m = mod(); if (m && m.carry) m.carry(c, x, y, p); },
        });
      }
      return out;
    },

    // Toucher une pièce en panne sur la carte : le panneau s'ouvre.
    tapAt(x, y) {
      for (const it of items) {
        if (!broken(it) || isHidden(rep, it.fault)) continue;
        if (Math.hypot(x - it.spot.x, y - it.spot.y) <= it.spot.r + 30) { openItem(it); return true; }
      }
      return false;
    },

    down(x, y) {
      if (!ready()) return;
      if (Math.hypot(x - CLOSE.x, y - CLOSE.y) <= CLOSE.r + 20) { close(); return; }
      open.item.mod.down(x, y);
    },
    move(x, y) { if (ready()) open.item.mod.move(x, y); },
    up() { if (open && open.item.mod) open.item.mod.up(); toneStop(); },

    update(dt) {
      if (!open) return;
      const m = open.item.mod;
      if (open.closing) {
        open.k = Math.max(0, open.k - dt / 0.25);
        if (open.k <= 0) {
          const it = open.item;
          open = null;
          if (it.mod.done && broken(it)) hooks.fixed(it.fault);
        }
        return;
      }
      open.k = Math.min(1, open.k + dt / 0.25);
      m.update(dt);
      if (m.done && !open.success) { open.success = 1.0; m.up(); toneStop(); }
      if (open.success) {
        open.success = Math.max(0, open.success - dt);
        if (open.success <= 0) { open.success = 0; open.closing = true; }
      }
    },

    hint() {
      return open ? open.item.mod.hint() : null;
    },

    sub() {
      const m = open && open.item.mod;
      return m && m.sub ? m.sub(t) : null;
    },

    // Icônes sur la carte (à dessiner avec l'intérieur du patient).
    drawBoard(ctx, time) {
      for (const it of items) {
        const b = broken(it) && !isHidden(rep, it.fault);
        drawIcon(ctx, it.type, it.spot.x, it.spot.y, b, time);
        if (b && !open) {
          const a = 0.5 + 0.5 * Math.sin(time * 5);
          ctx.strokeStyle = `rgba(255, 138, 61, ${0.35 + 0.5 * a})`;
          ctx.lineWidth = 7;
          ctx.beginPath(); ctx.arc(it.spot.x, it.spot.y, it.spot.r - 6 + a * 8, 0, TAU); ctx.stroke();
        }
      }
    },

    // Le panneau, par-dessus tout le reste.
    drawPanel(ctx, time) {
      if (!open) return;
      const e = easeInOut(open.k);
      const sp = open.item.spot;
      ctx.save();
      ctx.fillStyle = `rgba(30, 22, 16, ${0.55 * e})`;
      ctx.fillRect(0, 0, W, H);
      const s = 0.15 + 0.85 * e;
      ctx.translate(sp.x + (PANEL.cx - sp.x) * e, sp.y + (PANEL.cy - sp.y) * e);
      ctx.scale(s, s);
      ctx.translate(-PANEL.cx, -PANEL.cy);
      ctx.globalAlpha = Math.min(1, e * 2);
      ctx.fillStyle = '#d9c3a3';
      roundRect(ctx, PANEL.x, PANEL.y + 12, PANEL.w, PANEL.h, 44); ctx.fill();
      ctx.fillStyle = C.paper;
      roundRect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 44); ctx.fill();
      ctx.strokeStyle = C.copper;
      ctx.lineWidth = 6;
      ctx.stroke();
      fitText(ctx, t('sec.title.' + open.item.type), PANEL.cx, PANEL.y + 56, PANEL.w - 220, 46, C.copperDark, 900);
      // croix pour refermer
      ctx.fillStyle = '#ead9c0';
      ctx.beginPath(); ctx.arc(CLOSE.x, CLOSE.y, CLOSE.r, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(CLOSE.x - 15, CLOSE.y - 15); ctx.lineTo(CLOSE.x + 15, CLOSE.y + 15); ctx.moveTo(CLOSE.x + 15, CLOSE.y - 15); ctx.lineTo(CLOSE.x - 15, CLOSE.y + 15); ctx.stroke();
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, PANEL.x + 6, PANEL.y + 96, PANEL.w - 12, PANEL.h - 102, 38);
      ctx.clip();
      open.item.mod.draw(ctx, time);
      ctx.restore();
      // réussite : grosse coche verte
      if (open.success) {
        const k = 1 - open.success;
        const pop = 1 + 0.3 * Math.sin(Math.min(1, k * 3) * Math.PI);
        ctx.save();
        ctx.translate(PANEL.cx, PANEL.cy);
        ctx.scale(pop, pop);
        ctx.fillStyle = 'rgba(60, 191, 106, 0.92)';
        ctx.beginPath(); ctx.arc(0, 0, 110, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 24;
        ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-12, 40); ctx.lineTo(54, -36); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    },
  };
}
