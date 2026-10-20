// Écran opération : dévisser le capot, rebrancher le connecteur, puis démarrer.
import { W } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawMatBackground, drawPanel, drawText, drawToast, fitText, easeInOut } from '../ui.js';
import { D, drawFrame, drawInterior, drawCover, drawScrew, drawTray, trayPos } from '../drone.js';
import { createUnscrew } from '../gestures/unscrew.js';
import { createConnector } from '../gestures/connector.js';
import { game, newRepair } from '../state.js';
import { vibrate } from '../feedback.js';
import * as fx from '../particles.js';
import { go } from '../scenes.js';

const TAU = Math.PI * 2;
const PATIENT = 'drone_jouet_v0';

let rep, unscrew, connector, buttons, startBtn;
let closing = false;
let toast = null;
let flash = 0;
let time = 0;
let trayCount = 0;

function showToast(key, color = C.ink) {
  toast = { key, color, t: 1.3, max: 1.3 };
}

export default {
  init(params = {}) {
    if (!params.resume || !game.repair) newRepair(PATIENT);
    rep = game.repair;
    const g = game.data.gestures;
    closing = false;
    toast = null;
    time = 0;
    flash = params.flash ? 3.5 : 0;
    trayCount = rep.screws.filter((s) => s.out).length;
    for (const s of rep.screws) if (s.out) { s.fly = null; s.inTray = true; }
    if (rep.coverOpen) rep.coverAnim = 1;

    unscrew = createUnscrew(rep.screws, g.unscrew, {
      onTick: (s) => vibrate(s.rusty ? 12 : 7),
      onSlip: (s) => {
        s.damaged++;
        rep.slips++;
        rep.cleanliness = Math.max(0, rep.cleanliness - g.unscrew.slip_cleanliness);
        vibrate([30, 40, 30]);
        fx.spawn(s.x, s.y, { count: 8, color: '#9aa3ad', speed: 260, size: 6 });
        showToast('op.slip', C.red);
      },
      onOut: (s) => {
        s.slot = trayCount++;
        const to = trayPos(s.slot);
        s.fly = { t: 0, fromX: s.x, fromY: s.y, toX: to.x, toY: to.y };
        vibrate(30);
        fx.spawn(s.x, s.y, { count: 14, color: '#ffd36b', speed: 380, size: 7 });
        if (rep.screws.every((sc) => sc.out)) {
          rep.coverOpen = true;
          vibrate([20, 40, 20]);
          showToast('op.cover_off', C.turquoiseDark);
        }
      },
    });

    connector = createConnector(rep.plug, g.connector, {
      onGrab: () => vibrate(8),
      onConnect: () => {
        rep.faults.delete('connector_unplugged');
        vibrate(25);
        fx.spawn(D.socket.x, D.socket.y, { count: 16, color: '#5fe08b', speed: 360, size: 7 });
        showToast('op.connected', C.green);
      },
    });

    buttons = new Buttons();
    startBtn = buttons.add({
      x: 190, y: 1660, w: 700, h: 170, size: 68,
      label: () => t('op.start'),
      onTap: () => { closing = true; unscrew.up(); connector.up(); },
    });
  },

  update(dt) {
    time += dt;
    if (!closing) rep.elapsed += dt;

    if (rep.coverOpen && !closing && rep.coverAnim < 1) rep.coverAnim = Math.min(1, rep.coverAnim + dt / 0.7);
    if (closing) {
      rep.coverAnim = Math.max(0, rep.coverAnim - dt / 0.55);
      if (rep.coverAnim === 0) { go('reactivation'); return; }
    }

    for (const s of rep.screws) {
      if (!s.fly) continue;
      s.fly.t += dt / 0.5;
      if (s.fly.t >= 1) { s.fly = null; s.inTray = true; vibrate(6); }
    }

    connector.update(dt);
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
    if (flash > 0) flash -= dt;

    const ready = rep.faults.size === 0;
    startBtn.visible = rep.coverOpen && rep.coverAnim >= 1 && !closing;
    startBtn.style = ready ? 'primary' : 'secondary';
    startBtn.pulse = ready;
  },

  draw(ctx) {
    drawMatBackground(ctx);
    drawTray(ctx);
    fitText(ctx, t('patient.' + rep.patient.id), W / 2, 110, 480, 54, C.ink, 800);

    drawFrame(ctx);
    if (rep.coverAnim > 0) drawInterior(ctx, rep, { glow: connector.glow });

    const k = easeInOut(rep.coverAnim);
    drawCover(ctx, {
      offsetY: -k * 1150,
      rot: -k * 0.35,
      alpha: 1 - k,
      screws: closing ? rep.screws : null,
    });

    if (!rep.coverOpen) {
      unscrew.drawGuides(ctx, time);
      for (const s of rep.screws) {
        if (!s.out) drawScrew(ctx, s.x, s.y, s.r, s);
      }
    }

    // vis qui volent vers la coupelle, puis vis rangées
    rep.screws.forEach((s) => {
      if (closing) return;
      if (s.fly) {
        const f = s.fly;
        const e = easeInOut(Math.min(1, f.t));
        const x = f.fromX + (f.toX - f.fromX) * e;
        const y = f.fromY + (f.toY - f.fromY) * e - Math.sin(Math.PI * e) * 260;
        drawScrew(ctx, x, y, s.r * (1 - 0.4 * e), { ...s, progress: 1 - e });
      } else if (s.inTray) {
        const p = trayPos(s.slot);
        drawScrew(ctx, p.x, p.y, s.r * 0.6, s);
      }
    });

    // zone fautive qui clignote après un démarrage raté
    if (flash > 0 && rep.coverAnim >= 1) {
      const a = 0.5 + 0.5 * Math.sin(time * 12);
      ctx.strokeStyle = `rgba(214, 69, 69, ${0.4 + a * 0.6})`;
      ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(D.socket.x, D.socket.y, 110 + a * 15, 0, TAU); ctx.stroke();
    }

    this.drawHint(ctx);

    if (toast) drawToast(ctx, t(toast.key), W / 2, 1260, toast.t / toast.max, toast.color);
    buttons.draw(ctx);
  },

  drawHint(ctx) {
    let key;
    let sub = null;
    if (!rep.coverOpen) {
      const a = unscrew.active;
      key = a && a.rusty ? 'op.hint.rusty' : 'op.hint.unscrew';
      sub = t('op.screws', { n: rep.screws.filter((s) => s.out).length, total: rep.screws.length });
    } else if (rep.coverAnim < 1) {
      key = 'op.hint.cover';
    } else if (flash > 0 && rep.faults.size > 0) {
      key = 'op.fault_here';
    } else if (rep.faults.has('connector_unplugged')) {
      key = 'op.hint.connector';
    } else {
      key = 'op.hint.ready';
    }
    drawPanel(ctx, 70, 1370, W - 140, 262);
    drawText(ctx, t(key), W / 2, sub ? 1465 : 1501, W - 220, 46, { color: key === 'op.fault_here' ? C.red : C.ink });
    if (sub) fitText(ctx, sub, W / 2, 1592, W - 220, 38, C.inkSoft, 700);
  },

  pointer(type, x, y) {
    if (closing) return;
    if (buttons.pointer(type, x, y)) return;
    if (type === 'down') {
      if (!rep.coverOpen) unscrew.down(x, y);
      else if (rep.coverAnim >= 1) connector.down(x, y);
    } else if (type === 'move') {
      unscrew.move(x, y);
      connector.move(x, y);
    } else {
      unscrew.up();
      connector.up();
    }
  },
};
