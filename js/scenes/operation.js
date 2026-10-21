// Écran opération : dévisser le capot, diagnostic à la loupe, puis réparer
// (connecteur, puce, soudure, rouille à l'aspirateur) et démarrer.
// Première fois : Gribouille montre chaque nouveau geste (js/tutorial.js).
import { W, H } from '../canvas.js';
import { t } from '../i18n.js';
import { Buttons, C, drawMatBackground, drawPanel, drawText, drawToast, fitText, easeInOut, roundRect } from '../ui.js';
import { D, SOLDER, drawFrame, drawInterior, drawCover, drawScrew, drawTray, trayPos, drawChip, drawPartBox, drawIron, faultSpot, drawVacuum, drawLens, isHidden, drawCapacitor } from '../drone.js';
import { createCapacitor, SPARE } from '../gestures/capacitor.js';
import { createVacuum } from '../gestures/vacuum.js';
import { createMagnifier } from '../gestures/magnifier.js';
import { cleanliness } from '../score.js';
import { createUnscrew } from '../gestures/unscrew.js';
import { createConnector } from '../gestures/connector.js';
import { createChip } from '../gestures/chip.js';
import { createSolder } from '../gestures/solder.js';
import { game, newRepair } from '../state.js';
import { vibrate } from '../feedback.js';
import * as fx from '../particles.js';
import { go } from '../scenes.js';
import { save } from '../save.js';
import { createCoach, demo, drawGribBox } from '../tutorial.js';

const TAU = Math.PI * 2;

let rep, unscrew, connector, chip, solder, vacuum, lens, cap, buttons, startBtn;
let finger = { x: 0, y: 0 };
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
let coach;
let intro = 1;        // < 1 : le drone est encore posé de loin (tutoriel : toucher pour zoomer)
let zooming = false;
let swipe = null;     // glissement de la plaque une fois les 4 vis sorties
let swipeDy = 0;

// Inverse de easeInOut (pour reprendre l'animation de la plaque là où le doigt l'a laissée).
function unease(v) {
  let a = 0, b = 1;
  for (let i = 0; i < 20; i++) { const m = (a + b) / 2; if (easeInOut(m) < v) a = m; else b = m; }
  return (a + b) / 2;
}

function showToast(key, color = C.ink, vars) {
  toast = { key, color, vars, t: 1.4, max: 1.4 };
}

function pct(v) {
  return Math.round(v * 100);
}

export default {
  init(params = {}) {
    if (!params.resume || !game.repair) newRepair(params.order || game.lastOrder);
    rep = game.repair;
    const g = rep.g; // réglages modifiés par les outils achetés
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
          rep.coverLoose = true;
          vibrate([20, 40, 20]);
          showToast('op.cover_loose', C.turquoiseDark);
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
    const tol = g.solder.tolerance_by_rank[Math.min(rank, 5) - 1] + (g.solder.tolerance_bonus || 0);
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

    vacuum = createVacuum(rep, g.vacuum, {
      onStart: () => vibrate(6),
      onCellClean: (c) => {
        if (Math.random() < 0.35) fx.spawn(c.x, c.y, { count: 2, color: '#a8562a', speed: 120, life: 0.35, size: 5, gravity: 0 });
      },
      onFragileTouch: () => { vibrate([25, 25, 25]); showToast('op.fragile', C.orangeDark); },
      onFragileBreak: (c) => {
        vibrate([70, 40, 70]);
        fx.spawn(c.x, c.y, { count: 14, color: '#fff3a6', speed: 380, life: 0.4, size: 6 });
        fx.spawn(c.x, c.y - 20, { count: 4, color: '#6b6f75', speed: 70, life: 1.1, size: 14, gravity: -120, kind: 'smoke', dir: -Math.PI / 2, spread: 1 });
        showToast('op.fragile_broken', C.red);
      },
    });

    cap = createCapacitor(rep, g.capacitor, {
      onGrab: () => vibrate(8),
      onRemove: (c) => {
        vibrate([15, 30, 15]);
        fx.spawn(c.x, c.y, { count: 4, color: '#6b6f75', speed: 70, life: 0.9, size: 12, gravity: -120, kind: 'smoke', dir: -Math.PI / 2, spread: 1 });
        showToast('op.cap_out', C.turquoiseDark);
      },
      onStay: () => showToast('op.chip_off_board', C.inkSoft),
      onMiss: () => { vibrate(12); showToast('op.cap_miss', C.inkSoft); },
      onPlace: (c) => {
        rep.faults.delete('capacitor_' + c.i);
        vibrate([10, 20, 35]);
        fx.spawn(c.x, c.y, { count: 18, color: C.turquoise, speed: 380, size: 7 });
        showToast('op.cap_in', C.green, { n: g.scoring.capacitor_cost });
      },
    });

    lens = createMagnifier(rep, rep.diag.targets, g.magnifier, {
      onStart: () => vibrate(6),
      onReveal: (tg) => {
        vibrate([20, 30, 40]);
        fx.spawn(tg.x, tg.y, { count: 18, color: '#ff8a3d', speed: 340, size: 7 });
        showToast('op.found.' + tg.id, C.red);
        if (rep.diag.targets.every((x) => x.kind !== 'fault' || x.done)) {
          rep.phase = 'repair';
          lens.up();
          showToast('op.diag_done', C.turquoiseDark);
        }
      },
      onNothing: (tg) => {
        vibrate(12);
        rep.elapsed += g.magnifier.wrong_penalty;
        rep.diag.penalty += g.magnifier.wrong_penalty;
        showToast('op.nothing', C.inkSoft, { s: g.magnifier.wrong_penalty });
      },
    });

    if (rep.scanned && !params.resume) showToast('op.scanned', C.turquoiseDark);

    swipe = null;
    swipeDy = 0;
    zooming = false;
    const firstTime = !(save.orders[rep.patient.id] && save.orders[rep.patient.id].paid);
    coach = createCoach(this.lessons(rep.patient.order.n), { enabled: firstTime });
    intro = coach.has('open') && !params.resume ? 0 : 1;

    buttons = new Buttons();
    startBtn = buttons.add({
      x: 190, y: 1660, w: 700, h: 170, size: 68,
      label: () => t('op.start'),
      onTap: () => { closing = true; this.release(); },
    });
  },

  // Leçons de Gribouille, par commande (GDD : un indice la première fois seulement).
  lessons(n) {
    const g = rep.g;
    const opened = () => rep.coverAnim >= 1 && !closing;
    const firstScrew = () => rep.screws.find((s) => !s.out) || rep.screws[0];
    const lensY = g.magnifier.offset_y;
    const grip = g.solder.grip;
    // outils fantômes portés par la main de démonstration
    const ghostPlug = (c, x, y) => {
      c.fillStyle = '#ffffff'; c.strokeStyle = '#3a2a1e'; c.lineWidth = 4;
      roundRect(c, x - D.plugW / 2, y - D.plugH / 2, D.plugW, D.plugH, 10); c.fill(); c.stroke();
    };
    const ghostLens = (c, x, y) => {
      c.strokeStyle = '#3a2a1e'; c.lineWidth = 10;
      c.fillStyle = 'rgba(191, 233, 255, 0.5)';
      c.beginPath(); c.arc(x, y, g.magnifier.radius * 0.8, 0, TAU); c.fill(); c.stroke();
    };
    const solderLesson = {
      offset: () => [-grip[0], -grip[1]],
      carry: (c, x, y, p) => drawIron(c, x, y, 1),
      demo: () => demo.path(SOLDER.pts.filter((_, i) => i % 6 === 0).concat([SOLDER.b]).map((p) => [p.x + grip[0], p.y + grip[1]]), 1.4, 150),
    };
    const L = {
      1: [
        { id: 'open', key: 'tuto.open', start: () => true, done: () => intro >= 1,
          demo: () => demo.tap(D.cx, D.cy) },
        { id: 'screw1', key: 'gribouille.hint1', praise: 'tuto.click', start: () => intro >= 1,
          done: () => rep.screws.some((s) => s.out),
          demo: () => { const s = firstScrew(); return demo.circle(s.x, s.y, s.r * 1.25); },
          ring: () => { const s = firstScrew(); return { x: s.x, y: s.y, r: s.r * 1.9 }; } },
        { id: 'screws', key: 'tuto.screws', start: () => true, done: () => rep.screws.every((s) => s.out) },
        { id: 'cover', key: 'tuto.cover', start: () => rep.coverLoose, done: () => rep.coverOpen,
          demo: () => demo.drag(D.cx, D.cy + 120, D.cx, D.cy - 260, 0.1, 0.6) },
        { id: 'connector', key: 'tuto.connector', praise: 'tuto.bravo', start: opened,
          done: () => rep.plug.connected,
          demo: () => demo.drag(D.plugStart.x, D.plugStart.y, D.socket.x, D.socket.y + g.connector.lift_offset),
          offset: () => [0, -g.connector.lift_offset], carry: ghostPlug,
          ring: () => (connector.dragging ? null : { x: rep.plug.x, y: rep.plug.y, r: 70 }) },
        { id: 'start', key: 'tuto.start', start: () => startBtn.visible && rep.faults.size === 0, done: () => closing,
          demo: () => demo.tap(540, 1735) },
      ],
      2: [
        { id: 'rusty', key: 'tuto.rusty', start: () => intro >= 1 && rep.screws.some((s) => s.rusty && !s.out),
          done: () => rep.screws.every((s) => !s.rusty || s.out),
          ring: () => { const s = rep.screws.find((x) => x.rusty && !x.out); return s ? { x: s.x, y: s.y, r: s.r * 1.9 } : null; } },
        { id: 'vacuum', key: () => (rep.vacuumUsed ? 'tuto.vacuum2' : 'tuto.vacuum'), praise: 'tuto.clean',
          start: () => opened() && rep.rust.cells.length > 0,
          done: () => cleanliness(rep) >= g.scoring.clean_min,
          demo: () => { const [x, y, r] = rep.patient.rust[0]; return demo.sweep(x, y + g.vacuum.offset_y, r * 1.6, r * 1.2); },
          offset: () => [0, -g.vacuum.offset_y],
          carry: (c, x, y) => drawVacuum(c, x, y, g.vacuum.radius, true, time, { x, y: y + g.vacuum.offset_y }) },
      ],
      3: [
        { id: 'solder', key: () => (solder.hot ? 'gribouille.hint2' : 'tuto.solder'), praise: 'tuto.bravo',
          start: () => opened() && rep.phase === 'repair' && rep.faults.has('trace_cut'),
          done: () => rep.weld.done,
          ...solderLesson,
          ring: () => (solder.active ? null : { x: solder.grip.x, y: solder.grip.y, r: 60 }) },
      ],
      4: [
        { id: 'chip_out', key: 'tuto.chip_out', start: () => opened() && rep.faults.has('chip_burnt'),
          done: () => rep.chip.old.state === 'tray' || rep.chip.old.state === 'gone',
          demo: () => demo.drag(D.slot.x, D.slot.y, 230, 560),
          offset: () => [0, -g.chip.lift_offset], carry: (c, x, y) => drawChip(c, x, y, 1, true) },
        { id: 'chip_in', key: 'tuto.chip_in', praise: 'tuto.bravo', start: () => opened(),
          done: () => !rep.faults.has('chip_burnt'),
          demo: () => demo.drag(D.box.x, D.box.y, D.slot.x, D.slot.y + g.chip.lift_offset),
          offset: () => [0, -g.chip.lift_offset], carry: (c, x, y) => drawChip(c, x, y, 1, false),
          ring: () => (chip.dragging ? null : { x: D.box.x, y: D.box.y, r: 70 }) },
      ],
      5: [
        { id: 'diag', key: () => (lens.active ? 'tuto.diag2' : 'tuto.diag'), praise: 'tuto.diag_done',
          start: () => opened() && rep.phase === 'diag', done: () => rep.phase === 'repair',
          demo: () => demo.path([[D.cx - 170, D.cy - 150 + lensY], [D.cx + 170, D.cy - 150 + lensY], [D.cx + 170, D.cy + 60 + lensY], [D.cx - 170, D.cy + 60 + lensY], [D.cx - 170, D.cy + 200 + lensY], [D.cx + 170, D.cy + 200 + lensY]], 0.3, 260),
          offset: () => [0, -lensY], carry: ghostLens },
      ],
      6: [
        { id: 'curve', key: 'tuto.curve', praise: 'tuto.bravo',
          start: () => opened() && rep.phase === 'repair' && rep.faults.has('trace_cut'),
          done: () => rep.weld.done,
          ...solderLesson },
      ],
    };
    return L[n] || [];
  },

  release() {
    unscrew.up(); connector.up(); chip.up(); solder.up(); vacuum.up(); lens.up(); cap.up();
  },

  update(dt) {
    time += dt;
    coach.update(dt);
    if (intro < 1) {
      if (zooming) intro = Math.min(1, intro + dt / 0.7);
      return; // le chrono attend que le drone soit sur l'établi
    }
    if (!closing) rep.elapsed += dt;
    // la plaque retombe si on la lâche trop tôt
    if (!swipe && !rep.coverOpen) swipeDy *= Math.max(0, 1 - dt * 12);

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
    vacuum.update(dt);
    lens.update(dt);
    cap.update(dt);
    if (vacuum.active) rep.vacuumUsed = true;
    if (rep.phase === 'diag' && rep.coverAnim >= 1) rep.diag.time += dt;
    if (vacuum.active && vacuum.sucking) vibrate(3);

    // fumée de la puce grillée
    smokeT -= dt;
    if (smokeT <= 0 && rep.coverAnim >= 1) {
      smokeT = 0.45;
      const o = rep.chip.old;
      if ((o.state === 'slot' && !isHidden(rep, 'chip_burnt')) || o.state === 'drag') {
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
    startBtn.visible = rep.coverOpen && rep.coverAnim >= 1 && !closing && rep.phase === 'repair' && !vacuum.active;
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
    fitText(ctx, t(rep.patient.name), W / 2, 110, 480, 54, C.ink, 800);

    if (intro < 1) {
      // tutoriel : le drone attend sur l'établi, on le touche pour zoomer
      const z = 0.55 + 0.45 * easeInOut(intro);
      ctx.save();
      ctx.translate(D.cx, D.cy);
      ctx.scale(z, z);
      ctx.translate(-D.cx, -D.cy);
      drawFrame(ctx);
      drawCover(ctx, {});
      for (const s of rep.screws) drawScrew(ctx, s.x, s.y, s.r, s);
      ctx.restore();
      ctx.restore();
      coach.draw(ctx);
      this.drawHint(ctx);
      return;
    }
    drawFrame(ctx);
    if (rep.coverAnim > 0 || swipeDy > 0) drawInterior(ctx, rep, { glow: connector.glow, slotGlow: chip.slotGlow, time, warn: vacuum.active });

    const k = Math.max(easeInOut(rep.coverAnim), closing ? 0 : swipeDy / 1150);
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
      if (rep.coverLoose && !swipe) this.drawLiftArrows(ctx);
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
    if (rep.coverAnim >= 1) this.drawDiag(ctx);
    this.drawCapacitors(ctx);
    if (vacuum.active) drawVacuum(ctx, vacuum.pos.x, vacuum.pos.y, rep.g.vacuum.radius, vacuum.sucking, time, finger);

    // fer à souder : posé sur la pastille en attendant, un rond clignote sur le manche
    if (solder.active) drawIron(ctx, solder.tip.x, solder.tip.y, solder.heat);
    else if (rep.coverAnim >= 1 && rep.phase !== 'diag' && rep.faults.has('trace_cut') && !isHidden(rep, 'trace_cut') && !vacuum.active) {
      drawIron(ctx, SOLDER.a.x, SOLDER.a.y, 0, 0.55);
      const p = 0.5 + 0.5 * Math.sin(time * 6);
      ctx.strokeStyle = `rgba(255, 138, 61, ${0.5 + 0.5 * p})`;
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(solder.grip.x, solder.grip.y, 44 + 10 * p, 0, Math.PI * 2); ctx.stroke();
    }
    if (lens.active) drawLens(ctx, rep, lens.lens, rep.g.magnifier, { time, progress: lens.progress, finger });

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
    // la main de Gribouille passe au-dessus de tout, boutons compris
    coach.draw(ctx);

    if (white > 0) {
      ctx.fillStyle = `rgba(255, 255, 240, ${white})`;
      ctx.fillRect(0, 0, W, H);
    }
  },

  // Chevrons qui montent sur la plaque : « glisse vers le haut ».
  drawLiftArrows(ctx) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 16;
    for (let i = 0; i < 3; i++) {
      const o = ((time * 1.2 + i / 3) % 1);
      const y = D.cy + 130 - o * 260;
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.sin(o * Math.PI) * 0.95})`;
      ctx.beginPath(); ctx.moveTo(D.cx - 60, y + 34); ctx.lineTo(D.cx, y - 26); ctx.lineTo(D.cx + 60, y + 34); ctx.stroke();
    }
    ctx.restore();
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

  // Condensateur neuf qui attend (à côté de la boîte), et pièce tenue à la pince.
  drawCapacitors(ctx) {
    const sp = cap.spare;
    const held = cap.held;
    if (sp && !(held && held.what === 'new')) {
      const a = 0.5 + 0.5 * Math.sin(time * 6);
      ctx.fillStyle = `rgba(63, 208, 187, ${0.2 + 0.25 * a})`;
      ctx.beginPath(); ctx.arc(SPARE.x, SPARE.y, 55, 0, TAU); ctx.fill();
      drawCapacitor(ctx, SPARE.x, SPARE.y, sp.w, sp.h, false);
    }
    if (held) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 10;
      drawCapacitor(ctx, held.x, held.y, held.comp.w * 1.1, held.comp.h * 1.1, held.what === 'old');
      ctx.restore();
    }
  },

  // Pièces déjà vérifiées (coche verte) et, après 20 s de recherche, un indice qui pulse.
  drawDiag(ctx) {
    const m = rep.g.magnifier;
    for (const tg of rep.diag.targets) {
      if (tg.kind === 'decoy' && tg.done && rep.phase === 'diag') {
        ctx.fillStyle = 'rgba(60, 191, 106, 0.9)';
        ctx.beginPath(); ctx.arc(tg.x + 34, tg.y - 34, 24, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(tg.x + 23, tg.y - 34); ctx.lineTo(tg.x + 32, tg.y - 25); ctx.lineTo(tg.x + 46, tg.y - 44); ctx.stroke();
      }
    }
    if (rep.phase === 'diag' && rep.diag.time > m.hint_after && !lens.active) {
      const tg = rep.diag.targets.find((x) => x.kind === 'fault' && !x.done);
      if (tg) {
        const a = 0.5 + 0.5 * Math.sin(time * 4);
        ctx.strokeStyle = `rgba(63, 208, 187, ${0.25 + 0.45 * a})`;
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(tg.x, tg.y, 90 + a * 20, 0, TAU); ctx.stroke();
      }
    }
  },

  hintKey() {
    if (!rep.coverOpen && rep.coverLoose) return 'op.hint.lift';
    if (!rep.coverOpen) return unscrew.active && unscrew.active.rusty ? 'op.hint.rusty' : 'op.hint.unscrew';
    if (rep.coverAnim < 1) return 'op.hint.cover';
    if (rep.phase === 'diag') {
      if (lens.active) return lens.target ? 'op.hint.diag_hold' : 'op.hint.diag_move';
      return 'op.hint.diag';
    }
    if (vacuum.active) return 'op.hint.vacuum';
    if (cap.held) return cap.held.what === 'old' ? 'op.hint.cap_drag_old' : 'op.hint.cap_drag_new';
    const clean = cleanliness(rep) >= rep.g.scoring.clean_min;
    // la rouille est présentée dès l'ouverture, tant que le joueur n'a pas essayé l'aspirateur
    if (!clean && !rep.vacuumUsed && flash <= 0) return 'op.hint.rust';
    if (solder.active) return solder.hot ? 'op.hint.trace' : 'op.hint.heating';
    if (chip.dragOld) return 'op.hint.chip_drag_old';
    if (chip.dragNew) return rep.chip.old.state === 'tray' ? 'op.hint.chip_drag_new' : 'op.hint.chip_remove';
    if (flash > 0 && rep.faults.size > 0) return 'op.fault_here';
    for (const f of rep.faults) {
      if (f === 'connector_unplugged') return 'op.hint.connector';
      if (f === 'chip_burnt') return rep.chip.old.state === 'slot' ? 'op.hint.chip_remove' : 'op.hint.chip_place';
      if (f === 'trace_cut') return 'op.hint.solder';
      if (f.startsWith('capacitor_')) {
        const c = rep.fragile[+f.split('_')[1]];
        return c && c.removed ? 'op.hint.cap_place' : 'op.hint.cap_remove';
      }
    }
    if (!clean) return 'op.hint.rust_left';
    return 'op.hint.ready';
  },

  drawHint(ctx) {
    const key = this.hintKey();
    let sub = null;
    if (!rep.coverOpen) sub = t('op.screws', { n: rep.screws.filter((s) => s.out).length, total: rep.screws.length });
    else if (rep.phase === 'diag') sub = t('op.found', { n: rep.diag.revealed.size, total: rep.diag.hidden.size });
    else if (rep.coverAnim >= 1) {
      const total = rep.patient.faults.length + rep.fragile.filter((c) => c.breaks > 0).length;
      sub = t('op.repairs', { n: total - rep.faults.size, total })
        + '   ·   ' + t('op.clean', { p: cleanliness(rep) });
    }

    // Gribouille parle à la place du panneau d'aide (tutoriel)
    const said = coach.text();
    if (said) {
      drawGribBox(ctx, { x: 60, y: 1380, w: W - 120, h: 250 }, said, coach.shown, coach.time, { sub: solder.active ? null : sub, size: 40, reserve: solder.active ? 110 : 0 });
      if (solder.active) this.drawGauge(ctx);
      return;
    }
    drawPanel(ctx, 70, 1370, W - 140, 262);
    const gauge = solder.active;
    drawText(ctx, t(key), W / 2, sub || gauge ? 1460 : 1501, W - 220, 44, { color: key === 'op.fault_here' ? C.red : C.ink });
    if (gauge) this.drawGauge(ctx);
    else if (sub) fitText(ctx, sub, W / 2, 1592, W - 220, 38, C.inkSoft, 700);
  },

  // Jauge de chaleur puis de vitesse pendant la soudure.
  drawGauge(ctx) {
    const x = 190, y = 1560, w = W - 380, h = 34;
    const p = rep.g.solder;
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

  // Quel outil prend le doigt ? Diagnostic : la loupe (le connecteur visible reste branchable).
  // Ensuite : puce, fiche (si on la touche vraiment), rouille, fer, et l'aspirateur partout sur la carte.
  routeDown(x, y) {
    const onPlug = !rep.plug.connected && Math.abs(x - rep.plug.x) < 70 && Math.abs(y - rep.plug.y) < 55;
    if (rep.phase === 'diag') {
      if (onPlug && connector.down(x, y)) return;
      lens.down(x, y);
      return;
    }
    if (cap.down(x, y)) return;
    if (chip.down(x, y)) return;
    if (onPlug && connector.down(x, y)) return;
    if (vacuum.covers(x, y)) { vacuum.down(x, y); return; }
    if (connector.down(x, y) || solder.down(x, y)) return;
    const b = D.board + 40;
    const ny = y - rep.g.vacuum.offset_y;
    if (Math.abs(x - D.cx) < b && Math.abs(ny - D.cy) < b) vacuum.down(x, y);
  },

  pointer(type, x, y) {
    if (closing) return;
    coach.touch(type);
    if (intro < 1) {
      if (type === 'up' && !zooming && Math.hypot(x - D.cx, y - D.cy) < 420) { zooming = true; vibrate(15); }
      return;
    }
    if (buttons.pointer(type, x, y)) return;
    finger.x = x; finger.y = y;
    if (type === 'down') {
      if (rep.coverLoose && !rep.coverOpen) {
        if (Math.abs(x - D.cx) < D.half + 80 && Math.abs(y - D.cy) < D.half + 80) swipe = { y0: y + swipeDy };
      } else if (!rep.coverOpen) unscrew.down(x, y);
      else if (rep.coverAnim >= 1) this.routeDown(x, y);
    } else if (type === 'move') {
      if (swipe) swipeDy = Math.max(0, Math.min(700, swipe.y0 - y));
      unscrew.move(x, y);
      connector.move(x, y);
      chip.move(x, y);
      solder.move(x, y);
      vacuum.move(x, y);
      lens.move(x, y);
      cap.move(x, y);
    } else {
      if (swipe) {
        swipe = null;
        // plaque assez soulevée : elle s'envole, sinon elle retombe
        if (swipeDy > 160 && type === 'up') {
          rep.coverOpen = true;
          rep.coverAnim = unease(Math.min(0.99, swipeDy / 1150));
          swipeDy = 0;
          vibrate([15, 30, 15]);
          showToast('op.cover_off', C.turquoiseDark);
        }
      }
      this.release();
    }
  },
};
