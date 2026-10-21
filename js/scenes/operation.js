// Écran opération : dévisser le capot, puis réparer (connecteur, puce, soudure) et démarrer.
import { W, H } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawMatBackground, drawPanel, drawText, drawToast, fitText, easeInOut, roundRect } from '../ui.js';
import { D, SOLDER, drawFrame, drawInterior, drawCover, drawScrew, drawTray, trayPos, drawChip, drawPartBox, drawIron, faultSpot } from '../drone.js';
import { createUnscrew } from '../gestures/unscrew.js';
import { createConnector } from '../gestures/connector.js';
import { createChip } from '../gestures/chip.js';
import { createSolder } from '../gestures/solder.js';
import { game, newRepair } from '../state.js';
import { vibrate } from '../feedback.js';
import * as fx from '../particles.js';
import { go } from '../scenes.js';

const TAU = Math.PI * 2;
const PATIENT = 'drone_jouet_v0';

let rep, unscrew, connector, chip, solder, buttons, startBtn;
let closing = false;
let toast = null;
let flash = 0;
let time = 0;
let trayCount = 0;
let shake = 0;        // secousse de l'écran (court-circuit)
let white = 0;        // éclair blanc
let smokeT = 0;
let buzzT = 0;
let paceWarnT = 0;

function showToast(key, color = C.ink, vars) {
  toast = { key, color, vars, t: 1.4, max: 1.4 };
}

function pct(v) {
  return Math.round(v * 100);
}

export default {
  init(params = {}) {
    if (!params.resume || !game.repair) newRepair(PATIENT);
    rep = game.repair;
    const g = game.data.gestures;
    closing = false;
    toast = null;
    time = 0;
    shake = 0;
    white = 0;
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

    chip = createChip(rep.chip, g.chip, {
      onGrab: () => vibrate(8),
      onRemove: () => {
        vibrate([15, 30, 15]);
        fx.spawn(D.slot.x, D.slot.y, { count: 6, color: '#6b6f75', speed: 90, life: 1.1, size: 22, gravity: -120, kind: 'smoke', dir: -Math.PI / 2, spread: 1.4 });
        showToast('op.chip_out', C.turquoiseDark);
      },
      onStay: () => showToast('op.chip_off_board', C.inkSoft),
      onSnapEnter: () => vibrate(10),
      onBlocked: () => { vibrate([20, 30, 20]); showToast('op.chip_blocked', C.red); },
      onMiss: () => { vibrate(12); showToast('op.chip_miss', C.inkSoft); },
      onPlace: (score) => {
        rep.faults.delete('chip_burnt');
        vibrate([10, 20, 35]);
        fx.spawn(D.slot.x, D.slot.y, { count: 22, color: C.turquoise, speed: 420, size: 8 });
        showToast('op.chip_in', C.green, { p: pct(score) });
      },
    });

    const rank = rep.patient.rank || 1;
    const tol = g.solder.tolerance_by_rank[Math.min(rank, 5) - 1];
    solder = createSolder(rep.weld, g.solder, tol, {
      onGrab: () => vibrate(8),
      onHot: () => { vibrate(18); showToast('op.solder_hot', C.orangeDark); },
      onTooEarly: () => { vibrate([15, 25, 15]); showToast('op.too_early', C.inkSoft); },
      onBurn: (p) => {
        vibrate(45);
        fx.spawn(p.x, p.y, { count: 5, color: '#3b2a1e', speed: 80, life: 1.2, size: 20, gravity: -150, kind: 'smoke', dir: -Math.PI / 2, spread: 1 });
        showToast('op.too_slow', C.red);
      },
      onShort: (p) => {
        vibrate([60, 30, 60, 30, 60]);
        shake = 0.35;
        white = 0.5;
        fx.spawn(p.x, p.y, { count: 28, color: '#fff3a6', speed: 650, life: 0.5, size: 7, gravity: 300 });
        fx.spawn(p.x, p.y, { count: 14, color: '#5fd3ff', speed: 520, life: 0.4, size: 6, gravity: 300 });
        showToast('op.short', C.red);
      },
      onBreak: () => { vibrate(20); showToast('op.break', C.inkSoft); },
      onDone: (score) => {
        rep.faults.delete('trace_cut');
        vibrate([20, 40, 60]);
        fx.spawn(SOLDER.b.x, SOLDER.b.y, { count: 24, color: '#eef2f6', speed: 420, size: 7 });
        fx.spawn(D.led.x, D.led.y, { count: 10, color: '#5fe08b', speed: 300, size: 6 });
        showToast('op.solder_done', C.green, { p: pct(score) });
      },
    });

    buttons = new Buttons();
    startBtn = buttons.add({
      x: 190, y: 1660, w: 700, h: 170, size: 68,
      label: () => t('op.start'),
      onTap: () => { closing = true; this.release(); },
    });
  },

  release() {
    unscrew.up(); connector.up(); chip.up(); solder.up();
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
    chip.update(dt);
    solder.update(dt);

    // fumée de la puce grillée
    smokeT -= dt;
    if (smokeT <= 0 && rep.coverAnim >= 1) {
      smokeT = 0.45;
      const o = rep.chip.old;
      if (o.state === 'slot' || o.state === 'drag') {
        fx.spawn(o.x + (Math.random() - 0.5) * 60, o.y - 20, { count: 1, color: '#7d8188', speed: 50, life: 1.4, size: 14, gravity: -90, kind: 'smoke', dir: -Math.PI / 2, spread: 0.8 });
      }
    }

    // fer en action : petite fumée d'étain et vibration régulière
    if (solder.hot) {
      buzzT -= dt;
      if (buzzT <= 0) {
        buzzT = 0.12;
        vibrate(4);
        fx.spawn(solder.tip.x, solder.tip.y - 10, { count: 1, color: '#d9dde2', speed: 60, life: 0.9, size: 9, gravity: -160, kind: 'smoke', dir: -Math.PI / 2, spread: 0.9 });
      }
      paceWarnT -= dt;
      if (solder.pace === 'fast' && paceWarnT <= 0) {
        paceWarnT = 1.5;
        vibrate(10);
        showToast('op.too_fast', C.turquoiseDark);
      }
    }

    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
    if (flash > 0) flash -= dt;
    if (shake > 0) shake = Math.max(0, shake - dt);
    if (white > 0) white = Math.max(0, white - dt * 2.5);

    const ready = rep.faults.size === 0;
    startBtn.visible = rep.coverOpen && rep.coverAnim >= 1 && !closing;
    startBtn.style = ready ? 'primary' : 'secondary';
    startBtn.pulse = ready;
  },

  draw(ctx) {
    drawMatBackground(ctx);
    ctx.save();
    if (shake > 0) {
      const a = 18 * (shake / 0.35);
      ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a);
    }
    drawTray(ctx);
    drawPartBox(ctx);
    fitText(ctx, t('patient.' + rep.patient.id), W / 2, 110, 480, 54, C.ink, 800);

    drawFrame(ctx);
    if (rep.coverAnim > 0) drawInterior(ctx, rep, { glow: connector.glow, slotGlow: chip.slotGlow, time });

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

    this.drawLoosePieces(ctx);

    // fer à souder
    if (solder.active) drawIron(ctx, solder.tip.x, solder.tip.y, solder.heat);

    // zone fautive qui clignote après un démarrage raté
    if (flash > 0 && rep.coverAnim >= 1 && rep.faults.size > 0) {
      const spot = faultSpot(rep.faults.values().next().value);
      const a = 0.5 + 0.5 * Math.sin(time * 12);
      ctx.strokeStyle = `rgba(214, 69, 69, ${0.4 + a * 0.6})`;
      ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r + a * 15, 0, TAU); ctx.stroke();
    }
    ctx.restore();

    this.drawHint(ctx);

    if (toast) drawToast(ctx, t(toast.key, toast.vars), W / 2, 1260, toast.t / toast.max, toast.color);
    buttons.draw(ctx);

    if (white > 0) {
      ctx.fillStyle = `rgba(255, 255, 240, ${white})`;
      ctx.fillRect(0, 0, W, H);
    }
  },

  // Puces hors de l'emplacement : dans la boîte, dans la coupelle, posées, en vol ou tenues.
  drawLoosePieces(ctx) {
    const ch = rep.chip;
    if (ch.old.state === 'tray') drawChip(ctx, ch.old.x, ch.old.y, chip.scaleOf(ch.old), true);
    if (ch.neu.state === 'box') drawChip(ctx, ch.neu.x, ch.neu.y, chip.scaleOf(ch.neu), false);
    for (const [p, burnt] of [[ch.neu, false], [ch.old, true]]) {
      if (p.state === 'loose') drawChip(ctx, p.x, p.y, 1, burnt, { shadow: 0.5 });
      else if (p.state === 'fly') drawChip(ctx, p.x, p.y, chip.scaleOf(p), burnt, { shadow: 0.6 });
    }
    const held = chip.dragging;
    if (held) {
      const burnt = held === ch.old;
      drawChip(ctx, held.x, held.y, 1.06, burnt, { shadow: 1 });
      // pince
      ctx.save();
      ctx.strokeStyle = '#aeb6c0';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      const h = D.chip.s / 2;
      const fy = held.y + 120;
      ctx.beginPath(); ctx.moveTo(held.x - h - 6, held.y); ctx.lineTo(held.x - 14, fy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(held.x + h + 6, held.y); ctx.lineTo(held.x + 14, fy); ctx.stroke();
      ctx.fillStyle = '#7b8592';
      ctx.beginPath(); ctx.arc(held.x, fy + 8, 20, 0, TAU); ctx.fill();
      ctx.restore();
    }
  },

  hintKey() {
    if (!rep.coverOpen) return unscrew.active && unscrew.active.rusty ? 'op.hint.rusty' : 'op.hint.unscrew';
    if (rep.coverAnim < 1) return 'op.hint.cover';
    if (solder.active) return solder.hot ? 'op.hint.trace' : 'op.hint.heating';
    if (chip.dragOld) return 'op.hint.chip_drag_old';
    if (chip.dragNew) return rep.chip.old.state === 'tray' ? 'op.hint.chip_drag_new' : 'op.hint.chip_remove';
    if (flash > 0 && rep.faults.size > 0) return 'op.fault_here';
    for (const f of rep.faults) {
      if (f === 'connector_unplugged') return 'op.hint.connector';
      if (f === 'chip_burnt') return rep.chip.old.state === 'slot' ? 'op.hint.chip_remove' : 'op.hint.chip_place';
      if (f === 'trace_cut') return 'op.hint.solder';
    }
    return 'op.hint.ready';
  },

  drawHint(ctx) {
    const key = this.hintKey();
    let sub = null;
    if (!rep.coverOpen) sub = t('op.screws', { n: rep.screws.filter((s) => s.out).length, total: rep.screws.length });
    else if (rep.coverAnim >= 1) sub = t('op.repairs', { n: rep.patient.faults.length - rep.faults.size, total: rep.patient.faults.length });

    drawPanel(ctx, 70, 1370, W - 140, 262);
    const gauge = solder.active;
    drawText(ctx, t(key), W / 2, sub || gauge ? 1460 : 1501, W - 220, 44, { color: key === 'op.fault_here' ? C.red : C.ink });
    if (gauge) this.drawGauge(ctx);
    else if (sub) fitText(ctx, sub, W / 2, 1592, W - 220, 38, C.inkSoft, 700);
  },

  // Jauge de chaleur puis de vitesse pendant la soudure.
  drawGauge(ctx) {
    const x = 190, y = 1560, w = W - 380, h = 34;
    const p = game.data.gestures.solder;
    if (!solder.hot) {
      ctx.fillStyle = 'rgba(58, 42, 30, 0.12)';
      roundRect(ctx, x, y, w, h, h / 2); ctx.fill();
      ctx.fillStyle = C.orange;
      roundRect(ctx, x, y, Math.max(h, w * solder.heat), h, h / 2); ctx.fill();
      return;
    }
    const maxV = p.speed_max * 1.6;
    const zx = (v) => x + w * Math.min(1, v / maxV);
    ctx.fillStyle = '#e9b38a';
    roundRect(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = '#9fe0b4';
    ctx.fillRect(zx(p.speed_min), y, zx(p.speed_max) - zx(p.speed_min), h);
    ctx.fillStyle = '#a9d8f0';
    ctx.fillRect(zx(p.speed_max), y, x + w - h / 2 - zx(p.speed_max), h);
    ctx.fillStyle = C.ink;
    const nx = zx(solder.speed);
    ctx.beginPath(); ctx.moveTo(nx, y - 6); ctx.lineTo(nx - 14, y - 26); ctx.lineTo(nx + 14, y - 26); ctx.closePath(); ctx.fill();
    ctx.fillRect(nx - 3, y - 6, 6, h + 12);
    fitText(ctx, t('op.speed.slow'), x + 60, y + h + 34, 200, 30, C.inkSoft, 700);
    fitText(ctx, t('op.speed.fast'), x + w - 60, y + h + 34, 200, 30, C.inkSoft, 700);
  },

  pointer(type, x, y) {
    if (closing) return;
    if (buttons.pointer(type, x, y)) return;
    if (type === 'down') {
      if (!rep.coverOpen) unscrew.down(x, y);
      else if (rep.coverAnim >= 1) {
        if (!chip.down(x, y) && !connector.down(x, y)) solder.down(x, y);
      }
    } else if (type === 'move') {
      unscrew.move(x, y);
      connector.move(x, y);
      chip.move(x, y);
      solder.move(x, y);
    } else {
      this.release();
    }
  },
};
