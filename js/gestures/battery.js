// Batterie gonflée (ou cœur-batterie d'une peluche) — vue rapprochée.
// 1) Glisser la vieille batterie hors de son logement le long du rail, lentement :
//    au-delà de speed_max une jauge de risque monte (pleine = elle chauffe et revient, -soin) ;
//    toucher un bord rouge = -soin. 2) Pousser la batterie neuve dans le logement.
import { C, roundRect, easeInOut } from '../ui.js';
import { demo } from '../tutorial.js';

const RAIL_Y = 800;
const X0 = 330;       // centre de la batterie dans son logement
const X_OUT = 760;    // au-delà : la vieille batterie est sortie
const X_NEW = 820;    // la neuve attend ici
const X_MAX = 880;
const BW = 260, BH = 200;

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.5, y + s * 0.1, x - s * 1.1, y - s * 1.1, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 1.1, y - s * 1.1, x + s * 1.5, y + s * 0.1, x, y + s * 0.9);
  ctx.closePath();
}

// Batterie dessinée : gonflée (vieille) ou neuve ; en cœur pour les peluches.
export function drawBatteryPiece(ctx, x, y, { old = true, heart = false, scale = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (heart) {
    heartPath(ctx, 0, 6, 100);
    ctx.fillStyle = old ? '#c98aa0' : '#ff5c8a';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = old ? '#8a5466' : '#b8264f';
    ctx.stroke();
    // jauge de charge dans le cœur
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    roundRect(ctx, -48, -12, 96, 40, 10); ctx.fill();
    ctx.fillStyle = old ? C.red : C.green;
    roundRect(ctx, -42, -6, old ? 20 : 84, 28, 7); ctx.fill();
    if (!old) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath(); ctx.ellipse(-46, -42, 22, 12, -0.6, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    const w = BW, h = BH;
    ctx.beginPath();
    if (old) {
      // corps bombé
      ctx.moveTo(-w / 2 + 30, -h / 2);
      ctx.quadraticCurveTo(0, -h / 2 - 44, w / 2 - 30, -h / 2);
      ctx.quadraticCurveTo(w / 2 + 10, -h / 2, w / 2, -h / 2 + 30);
      ctx.quadraticCurveTo(w / 2 + 34, 0, w / 2, h / 2 - 30);
      ctx.quadraticCurveTo(w / 2 + 10, h / 2, w / 2 - 30, h / 2);
      ctx.quadraticCurveTo(0, h / 2 + 44, -w / 2 + 30, h / 2);
      ctx.quadraticCurveTo(-w / 2 - 10, h / 2, -w / 2, h / 2 - 30);
      ctx.quadraticCurveTo(-w / 2 - 34, 0, -w / 2, -h / 2 + 30);
      ctx.quadraticCurveTo(-w / 2 - 10, -h / 2, -w / 2 + 30, -h / 2);
    } else {
      roundRect(ctx, -w / 2, -h / 2, w, h, 26);
    }
    ctx.fillStyle = old ? '#e8b84a' : '#f2c14e';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = old ? '#a8781f' : '#c7962c';
    ctx.stroke();
    // bornes
    ctx.fillStyle = '#8a6418';
    ctx.fillRect(-w / 2 - 18, -26, 18, 52);
    // bande : rouge (vieille) ou verte (neuve)
    ctx.fillStyle = old ? C.red : C.green;
    roundRect(ctx, -w / 2 + 40, -18, w - 80, 36, 12); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(old ? '!' : '+', 0, 2);
  }
  ctx.restore();
}

export function createBattery(params, fx, { heart = false } = {}) {
  const speedMax = params.speed_max * (heart ? params.heart_factor : 1);
  const s = { phase: 'out', x: X0, dy: 0, risk: 0, back: null };
  let drag = null;   // { offX, offY, fx, fy, v }
  let edgeT = 0;
  let edgeOn = false;

  function grab(x, y) {
    return Math.abs(x - s.x) < BW / 2 + params.grab_pad && Math.abs(y - (RAIL_Y + s.dy)) < BH / 2 + params.grab_pad;
  }

  return {
    get done() { return s.phase === 'done'; },

    down(x, y) {
      if (s.back || s.phase === 'done' || !grab(x, y)) return false;
      drag = { offX: s.x - x, offY: RAIL_Y + s.dy - y, fx: x, fy: y, v: 0 };
      fx.vibrate(8);
      return true;
    },

    move(x, y) {
      if (drag) { drag.fx = x; drag.fy = y; }
    },

    up() {
      drag = null;
      edgeOn = false;
    },

    update(dt) {
      if (s.back) {
        s.back.t = Math.min(1, s.back.t + dt / 0.5);
        s.x = s.back.from + (X0 - s.back.from) * easeInOut(s.back.t);
        s.dy *= 0.8;
        if (s.back.t >= 1) s.back = null;
      }
      if (!drag || dt <= 0) {
        s.risk = Math.max(0, s.risk - dt * params.risk_fall);
        if (!drag && !s.back) s.dy *= Math.max(0, 1 - dt * 10);
        return;
      }
      const nx = Math.max(X0, Math.min(X_MAX, drag.fx + drag.offX));
      const ny = Math.max(-params.max_dev, Math.min(params.max_dev, drag.fy + drag.offY - RAIL_Y));
      const v = Math.abs(nx - s.x) / dt;
      drag.v += (v - drag.v) * Math.min(1, dt * 10);
      s.x = nx;
      s.dy = ny;
      if (s.phase === 'out') {
        // trop vite : la batterie chauffe
        if (drag.v > speedMax) s.risk += dt * params.risk_rise;
        else s.risk = Math.max(0, s.risk - dt * params.risk_fall);
        if (s.risk >= 1) {
          fx.care(params.risk_cost);
          fx.bad('sec.battery.hot');
          fx.vibrate([60, 30, 60]);
          fx.spawn(s.x, RAIL_Y - 60, { count: 6, color: '#6b6f75', speed: 80, life: 1.1, size: 22, gravity: -120, kind: 'smoke', dir: -Math.PI / 2, spread: 1.2 });
          drag = null;
          s.risk = 0;
          s.back = { t: 0, from: s.x };
          return;
        }
        // bord rouge touché
        const touching = Math.abs(s.dy) > params.edge_tol;
        edgeT -= dt;
        if (touching && (!edgeOn || edgeT <= 0)) {
          edgeT = params.edge_cooldown;
          fx.care(params.edge_cost);
          fx.bad('sec.battery.edge');
          fx.vibrate([25, 25, 25]);
          const ey = RAIL_Y + Math.sign(s.dy) * (BH / 2 + params.edge_tol);
          fx.spawn(s.x, ey, { count: 10, color: '#fff3a6', speed: 300, life: 0.35, size: 6 });
        }
        edgeOn = touching;
        if (s.x >= X_OUT) {
          fx.spawn(s.x, RAIL_Y, { count: 16, color: '#ffd36b', speed: 380, size: 7 });
          fx.vibrate([15, 30, 15]);
          fx.ok('sec.battery.out');
          drag = null;
          s.phase = 'in';
          s.x = X_NEW;
          s.dy = 0;
          s.risk = 0;
        }
      } else if (s.phase === 'in' && s.x <= X0 + 10) {
        s.x = X0;
        s.dy = 0;
        drag = null;
        s.phase = 'done';
        fx.vibrate([10, 20, 35]);
        fx.spawn(X0, RAIL_Y, { count: 22, color: C.turquoise, speed: 420, size: 8 });
        fx.ok(heart ? 'sec.heart.in' : 'sec.battery.in');
      }
    },

    hint() {
      if (s.phase === 'out') return s.risk > 0.25 ? 'sec.battery.slow' : heart ? 'sec.heart.out_hint' : 'sec.battery.out_hint';
      return 'sec.battery.new';
    },

    demo() {
      if (s.phase === 'out') return demo.drag(X0, RAIL_Y, X_OUT + 40, RAIL_Y, 0.25, 2.2);
      if (s.phase === 'in') return demo.drag(X_NEW, RAIL_Y, X0, RAIL_Y, 0.25, 1.0);
      return null;
    },

    draw(ctx, time) {
      const top = RAIL_Y - BH / 2 - params.edge_tol;
      const bot = RAIL_Y + BH / 2 + params.edge_tol;
      // logement et rail
      ctx.fillStyle = '#2f8a5b';
      roundRect(ctx, 140, top - 40, 780, bot - top + 80, 30); ctx.fill();
      ctx.fillStyle = '#1f3d2e';
      roundRect(ctx, X0 - BW / 2 - 30, top, BW + 60, bot - top, 24); ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(X0 + BW / 2 + 30, top + 20, X_MAX - X0 - BW / 2, bot - top - 40);
      // bords rouges
      ctx.fillStyle = '#d64545';
      roundRect(ctx, 150, top - 18, 760, 16, 8); ctx.fill();
      roundRect(ctx, 150, bot + 2, 760, 16, 8); ctx.fill();
      // flèches : vers la droite pour sortir, vers la gauche pour rentrer
      if (!drag && s.phase !== 'done') {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 14;
        for (let i = 0; i < 3; i++) {
          const o = (time * 0.8 + i / 3) % 1;
          const dir = s.phase === 'out' ? 1 : -1;
          const ax = s.phase === 'out' ? 520 + o * 300 : 760 - o * 300;
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.sin(o * Math.PI) * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(ax - dir * 24, RAIL_Y + 150 - 30); ctx.lineTo(ax + dir * 16, RAIL_Y + 150); ctx.lineTo(ax - dir * 24, RAIL_Y + 150 + 30);
          ctx.stroke();
        }
        ctx.restore();
      }
      // la batterie
      const shake = s.risk > 0.5 ? (Math.random() - 0.5) * 10 * s.risk : 0;
      drawBatteryPiece(ctx, s.x + shake, RAIL_Y + s.dy, { old: s.phase === 'out', heart, scale: heart ? 0.95 : 1 });
      // jauge de risque (au-dessus de la batterie)
      if (s.phase === 'out' && (drag || s.risk > 0)) {
        const w = 260, h = 26, x = s.x - w / 2, y = top - 80;
        ctx.fillStyle = 'rgba(58, 42, 30, 0.25)';
        roundRect(ctx, x, y, w, h, h / 2); ctx.fill();
        ctx.fillStyle = s.risk > 0.6 ? C.red : C.orange;
        roundRect(ctx, x, y, Math.max(h, w * Math.min(1, s.risk)), h, h / 2); ctx.fill();
      }
    },
  };
}
