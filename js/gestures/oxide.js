// Circuit oxydé — vue rapprochée.
// Nettoyage fin au pinceau d'une zone dense en petits composants fragiles : le pinceau flotte
// au-dessus du doigt. Chaque contact avec un composant coûte cost points de propreté (et encore
// toutes les repeat s si on reste dessus) ; au break_hits-ième, il se fêle : adieu l'étoile Propre.
// Fini à clean_min.
import { C, roundRect } from '../ui.js';
import { demo } from '../tutorial.js';

const TAU = Math.PI * 2;
const COMPS = [];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 5; c++) {
    COMPS.push({ x: 260 + c * 140 + (r % 2 ? 40 : 0), y: 520 + r * 165, w: r % 2 ? 30 : 74, h: r % 2 ? 74 : 30 });
  }
}
const BLOBS = [[330, 600, 95], [620, 760, 115], [460, 930, 95], [770, 590, 85], [740, 1010, 85]];
const BANDS = ['#d64545', '#3a2a1e', '#ff8a3d', '#3f7fd6'];

function hash(a, b) {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

export function createOxide(params, fx) {
  const comps = COMPS.filter((c) => c.x < 900).map((c) => ({ ...c, inside: false, t: 0, hits: 0, cracked: false, hurt: 0 }));
  const near = (x, y) => comps.some((c) => Math.abs(x - c.x) < c.w / 2 + 12 && Math.abs(y - c.y) < c.h / 2 + 12);
  const cells = [];
  const cs = params.cell;
  for (const [bx, by, br] of BLOBS) {
    for (let y = by - br; y <= by + br; y += cs) {
      for (let x = bx - br; x <= bx + br; x += cs) {
        const d = Math.hypot(x - bx, y - by);
        if (d > br * (0.7 + 0.3 * hash(x, y)) || near(x, y)) continue;
        if (cells.some((c) => c.x === x && c.y === y)) continue;
        const a = 0.6 + 0.4 * hash(y, x);
        cells.push({ x, y, a, a0: a });
      }
    }
  }
  const total = cells.reduce((s, c) => s + c.a0, 0);
  let drag = null;   // { fx, fy, last }
  let speed = 0;
  let done = false;
  const pos = { x: 0, y: 0 };

  const cleaned = () => 1 - cells.reduce((s, c) => s + c.a, 0) / total;

  function overlaps(x, y, r, c) {
    const nx = Math.max(c.x - c.w / 2, Math.min(x, c.x + c.w / 2));
    const ny = Math.max(c.y - c.h / 2, Math.min(y, c.y + c.h / 2));
    return Math.hypot(x - nx, y - ny) <= r;
  }

  return {
    get done() { return done; },

    down(x, y) {
      if (done) return false;
      drag = { fx: x, fy: y, last: { x, y: y - params.offset_y } };
      pos.x = x; pos.y = y - params.offset_y;
      return true;
    },

    move(x, y) {
      if (drag) { drag.fx = x; drag.fy = y; }
    },

    up() {
      drag = null;
    },

    update(dt) {
      for (const c of comps) c.hurt = Math.max(0, c.hurt - dt * 2);
      if (!drag || done || dt <= 0) return;
      pos.x = drag.fx;
      pos.y = drag.fy - params.offset_y;
      const dd = Math.hypot(pos.x - drag.last.x, pos.y - drag.last.y);
      speed += (dd / dt - speed) * Math.min(1, dt * 10);
      drag.last = { x: pos.x, y: pos.y };
      const r = params.radius;
      // composants touchés : chaque contact coûte de la propreté, le 3e fêle le composant
      for (const c of comps) {
        if (c.cracked || !overlaps(pos.x, pos.y, r * 0.8, c)) { c.inside = false; continue; }
        if (c.inside) { c.t += dt; if (c.t < params.repeat) continue; }
        c.inside = true;
        c.t = 0;
        c.hits++;
        c.hurt = 1;
        fx.care(params.cost);
        fx.vibrate([50, 30, 50]);
        fx.spawn(c.x, c.y, { count: 8, color: '#fff3a6', speed: 260, life: 0.35, size: 5 });
        if (c.hits >= params.break_hits) {
          c.cracked = true;
          fx.damage();
          fx.bad('sec.oxide.broken');
          fx.spawn(c.x, c.y - 10, { count: 4, color: '#6b6f75', speed: 70, life: 1.0, size: 12, gravity: -120, kind: 'smoke', dir: -Math.PI / 2, spread: 1 });
        } else fx.bad('sec.oxide.hit', { n: params.cost, left: params.break_hits - c.hits });
      }
      if (speed < params.min_speed) return;
      for (const c of cells) {
        if (c.a <= 0) continue;
        const d = Math.hypot(c.x - pos.x, c.y - pos.y);
        if (d > r + cs / 2) continue;
        c.a = Math.max(0, c.a - dd * params.rate * (d < r * 0.6 ? 1 : 0.5));
        if (c.a < 0.06) c.a = 0;
      }
      if (cleaned() >= params.clean_min) {
        for (const c of cells) c.a = 0;
        done = true;
        drag = null;
        fx.vibrate([10, 20, 40]);
        fx.spawn(540, 780, { count: 24, color: '#5fe08b', speed: 460, size: 8 });
        fx.ok('sec.oxide.ok');
      }
    },

    hint() {
      return 'sec.oxide';
    },

    sub(t) {
      return t('sec.oxide.left', { p: Math.round(cleaned() * 100) });
    },

    offset() { return [0, -params.offset_y]; },
    carry(ctx, x, y) { drawBrush(ctx, x, y, params.radius, params.offset_y); },
    demo() {
      if (done) return null;
      const c = cells.find((q) => q.a > 0) || cells[0];
      return demo.sweep(c.x, c.y + params.offset_y, 120, 80);
    },

    draw(ctx, time) {
      // carte
      ctx.fillStyle = '#2f8a5b';
      roundRect(ctx, 150, 420, 780, 760, 30); ctx.fill();
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 7;
      for (const c of comps) {
        ctx.beginPath();
        if (c.w > c.h) { ctx.moveTo(c.x - c.w / 2 - 22, c.y); ctx.lineTo(c.x + c.w / 2 + 22, c.y); } else { ctx.moveTo(c.x, c.y - c.h / 2 - 22); ctx.lineTo(c.x, c.y + c.h / 2 + 22); }
        ctx.stroke();
      }
      // oxydation vert-de-gris
      for (const c of cells) {
        if (c.a <= 0) continue;
        ctx.fillStyle = `rgba(110, 196, 170, ${c.a * 0.9})`;
        ctx.beginPath(); ctx.arc(c.x, c.y, cs * 0.7, 0, TAU); ctx.fill();
      }
      // petits composants fragiles (rouges quand on les touche, gris et fêlés au 3e contact)
      for (const c of comps) {
        ctx.fillStyle = c.cracked ? '#8d8a84' : c.hurt > 0 ? `rgb(230, ${Math.round(120 + 80 * (1 - c.hurt))}, 100)` : '#e8d6b0';
        roundRect(ctx, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 10); ctx.fill();
        ctx.strokeStyle = '#8f6a1e';
        ctx.lineWidth = 3;
        ctx.stroke();
        for (let k = 0; k < 3; k++) {
          ctx.fillStyle = BANDS[(k + Math.round(c.x / 140)) % BANDS.length];
          if (c.w > c.h) ctx.fillRect(c.x - 20 + k * 16, c.y - c.h / 2 + 3, 7, c.h - 6);
          else ctx.fillRect(c.x - c.w / 2 + 3, c.y - 20 + k * 16, c.w - 6, 7);
        }
        if (c.cracked) {
          ctx.strokeStyle = '#2b2f33';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(c.x - c.w / 2 + 4, c.y - c.h / 2 + 4); ctx.lineTo(c.x - 4, c.y + 3); ctx.lineTo(c.x + 6, c.y - 4); ctx.lineTo(c.x + c.w / 2 - 4, c.y + c.h / 2 - 4);
          ctx.stroke();
        } else if (c.hits > 0) {
          // points rouges : contacts déjà subis
          for (let k = 0; k < c.hits; k++) {
            ctx.fillStyle = C.red;
            ctx.beginPath(); ctx.arc(c.x - 10 + k * 20, c.y - c.h / 2 - 14, 7, 0, TAU); ctx.fill();
          }
        }
        if (c.inside && !c.cracked) {
          const a = 0.5 + 0.5 * Math.sin(time * 14);
          ctx.strokeStyle = `rgba(214, 69, 69, ${0.5 + 0.5 * a})`;
          ctx.lineWidth = 5;
          roundRect(ctx, c.x - c.w / 2 - 8, c.y - c.h / 2 - 8, c.w + 16, c.h + 16, 12); ctx.stroke();
        }
      }
      if (drag) drawBrush(ctx, pos.x, pos.y, params.radius, params.offset_y, true);
    },
  };
}

// Pinceau fin : la pointe en (x, y), le manche descend jusqu'au doigt.
function drawBrush(ctx, x, y, r, off, active = false) {
  ctx.save();
  ctx.strokeStyle = '#8f5426';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y + r + 26); ctx.lineTo(x, y + off + 20); ctx.stroke();
  ctx.fillStyle = '#c9ced4';
  ctx.fillRect(x - 11, y + r - 4, 22, 34);
  ctx.fillStyle = '#f4e9d8';
  ctx.beginPath(); ctx.moveTo(x - 12, y + r); ctx.quadraticCurveTo(x - 14, y - r * 0.6, x, y - r); ctx.quadraticCurveTo(x + 14, y - r * 0.6, x + 12, y + r); ctx.closePath(); ctx.fill();
  if (active) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = C.ink;
}
