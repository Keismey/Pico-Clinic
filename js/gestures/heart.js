// Cœur-batterie d'une peluche (faible, fragile) — vue rapprochée. Un geste à lui :
// 1) ouvrir la fermeture éclair du ventre en suivant les pointillés ;
// 2) recharger le cœur en le touchant au rythme de ses battements (le cercle qui se resserre
//    doit arriver sur le cœur) : beats bons battements. Taper trop vite = il est fragile (-soin) ;
// 3) refermer la fermeture éclair.
// Précision = part des touches en rythme.
import { C, roundRect, fitText } from '../ui.js';
import { demo } from '../tutorial.js';
import { t } from '../i18n.js';

const TAU = Math.PI * 2;
const HX = 540, HY = 830, HR = 105;
// fermeture éclair : de gauche à droite, légèrement courbée
const ZIP = [];
for (let i = 0; i <= 40; i++) {
  const f = i / 40;
  ZIP.push({ x: 230 + f * 620, y: 520 - Math.sin(f * Math.PI) * 40 });
}
const ZIP_LEN = ZIP.reduce((s, p, i) => (i ? s + Math.hypot(p.x - ZIP[i - 1].x, p.y - ZIP[i - 1].y) : 0), 0);

function zipAt(f) {
  const k = Math.max(0, Math.min(1, f)) * (ZIP.length - 1);
  const i = Math.min(ZIP.length - 2, Math.floor(k));
  const g = k - i;
  return { x: ZIP[i].x + (ZIP[i + 1].x - ZIP[i].x) * g, y: ZIP[i].y + (ZIP[i + 1].y - ZIP[i].y) * g };
}

// Avancement 0..1 du point le plus proche de (x, y) sur la fermeture, et sa distance.
function zipProject(x, y) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < ZIP.length; i++) {
    const d = Math.hypot(x - ZIP[i].x, y - ZIP[i].y);
    if (d < bd) { bd = d; best = i / (ZIP.length - 1); }
  }
  return { f: best, d: bd };
}

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.5, y + s * 0.1, x - s * 1.1, y - s * 1.1, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 1.1, y - s * 1.1, x + s * 1.5, y + s * 0.1, x, y + s * 0.9);
  ctx.closePath();
}

export function createHeart(params, fx) {
  let step = 'open';      // open → beat → close → done
  let zip = 0;            // 0 = fermée, 1 = ouverte
  let zipDrag = false;
  let clock = 0;          // temps du battement
  let charge = 0;
  let good = 0, miss = 0;
  let lastTap = -9;
  let pop = 0;
  let flap = 0;           // ouverture du ventre (animation)
  let time = 0;

  const period = params.period;
  // temps jusqu'au prochain battement (le cercle arrive sur le cœur à chaque multiple de period)
  const phase = () => (clock % period) / period;

  return {
    get done() { return step === 'done'; },
    get info() { return { step, phase: phase(), charge, zip }; },  // pour les tests automatiques

    down(x, y) {
      if (step === 'open' || step === 'close') {
        const p = zipAt(zip);
        if (Math.hypot(x - p.x, y - p.y) > params.zip_grab) return false;
        zipDrag = true;
        fx.vibrate(8);
        return true;
      }
      if (step !== 'beat' || Math.hypot(x - HX, y - HY) > HR * 1.9) return false;
      // touche : en rythme si le cercle est (presque) sur le cœur
      const ph = phase();
      const off = Math.min(ph, 1 - ph) * period;
      if (time - lastTap < params.spam) {
        fx.care(params.spam_cost);
        fx.bad('sec.heart.soft', { n: params.spam_cost });
        fx.vibrate([40, 30, 40]);
        lastTap = time;
        return true;
      }
      lastTap = time;
      if (off <= params.window) {
        good++;
        charge++;
        pop = 1;
        fx.vibrate(30);
        fx.spawn(HX, HY - HR * 0.4, { count: 10, color: '#ff8fb1', speed: 300, size: 7 });
        if (charge >= params.beats) {
          step = 'close';
          fx.ok('sec.heart.full');
        }
      } else {
        miss++;
        fx.info('sec.heart.miss');
        fx.vibrate(10);
      }
      return true;
    },

    move(x, y) {
      if (!zipDrag) return;
      const p = zipProject(x, y);
      if (p.d > params.zip_tol) { zipDrag = false; fx.info('sec.heart.zip_off'); return; }
      // la tirette ne suit le doigt que dans le bon sens, et pas trop d'un coup
      if (step === 'open' && p.f > zip) zip = Math.min(p.f, zip + 0.15);
      if (step === 'close' && p.f < zip) zip = Math.max(p.f, zip - 0.15);
    },

    up() {
      zipDrag = false;
    },

    update(dt) {
      time += dt;
      pop = Math.max(0, pop - dt * 3);
      flap += ((step === 'beat' || (step === 'close' && zip > 0.05) ? 1 : zip) - flap) * Math.min(1, dt * 8);
      if (step === 'open' && zip >= 0.97) {
        zip = 1;
        zipDrag = false;
        step = 'beat';
        clock = period * 0.1;
        fx.vibrate([10, 20, 10]);
        fx.ok('sec.heart.opened');
      }
      if (step === 'beat') clock += dt;
      if (step === 'close' && zip <= 0.03) {
        zip = 0;
        zipDrag = false;
        step = 'done';
        fx.score(good + miss ? Math.max(0.5, good / (good + miss)) : 1);
        fx.vibrate([10, 20, 40]);
        fx.ok('sec.heart.in');
      }
    },

    hint() {
      return { open: 'sec.heart.open', beat: 'sec.heart.beat', close: 'sec.heart.close', done: 'sec.heart.close' }[step];
    },

    tutoKey() {
      return step === 'beat' ? 'tuto.sec.heart3' : step === 'open' ? 'tuto.sec.heart2' : 'tuto.sec.heart4';
    },

    sub(tr) {
      return step === 'beat' ? tr('sec.heart.charge', { n: charge, total: params.beats }) : null;
    },

    demo() {
      if (step === 'open') {
        const pts = [];
        for (let f = zip; f <= 1.0001; f += 0.1) { const p = zipAt(f); pts.push([p.x, p.y]); }
        return demo.path(pts.length > 1 ? pts : [[zipAt(zip).x, zipAt(zip).y], [ZIP[40].x, ZIP[40].y]], 0.2, 300);
      }
      if (step === 'close') {
        const pts = [];
        for (let f = zip; f >= -0.0001; f -= 0.1) { const p = zipAt(f); pts.push([p.x, p.y]); }
        return demo.path(pts.length > 1 ? pts : [[ZIP[40].x, ZIP[40].y], [ZIP[0].x, ZIP[0].y]], 0.2, 300);
      }
      if (step === 'beat') return demo.tap(HX, HY);
      return null;
    },

    draw(ctx) {
      // ventre de la peluche (tissu)
      ctx.fillStyle = '#f2c7a5';
      roundRect(ctx, 130, 430, 820, 780, 120); ctx.fill();
      ctx.strokeStyle = '#d49a72';
      ctx.lineWidth = 6;
      ctx.stroke();
      // ouverture : poche sombre où se trouve le cœur
      if (flap > 0.02) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, flap * 1.4);
        ctx.fillStyle = '#7a4a3a';
        ctx.beginPath();
        ctx.ellipse(HX, HY - 20, 330 * flap, 290 * flap, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      // le cœur
      if (flap > 0.3) {
        const ph = step === 'beat' ? phase() : 0.5;
        const beatPop = step === 'beat' ? Math.max(0, 1 - Math.min(ph, 1 - ph) * 8) * 0.06 : 0;
        const sc = 1 + beatPop + pop * 0.12;
        const lv = charge / params.beats;
        heartPath(ctx, HX, HY, HR * sc);
        ctx.fillStyle = step === 'done' || step === 'close' ? '#ff5c8a' : `rgb(${200 + 55 * lv}, ${138 - 46 * lv}, ${160 - 22 * lv})`;
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#b8264f';
        ctx.stroke();
        // cercle qui se resserre : toucher quand il arrive sur le cœur
        if (step === 'beat') {
          const r = HR * 1.05 + (1 - ph) * 190;
          const near = Math.min(ph, 1 - ph) * period <= params.window;
          ctx.strokeStyle = near ? 'rgba(60, 191, 106, 0.95)' : 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = near ? 12 : 8;
          ctx.beginPath(); ctx.arc(HX, HY - 6, r, 0, TAU); ctx.stroke();
        }
        // jauge de charge
        const w = 360, h = 30, x = HX - w / 2, y = HY + HR + 110;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        roundRect(ctx, x, y, w, h, h / 2); ctx.fill();
        ctx.fillStyle = C.green;
        if (lv > 0) { roundRect(ctx, x, y, Math.max(h, w * lv), h, h / 2); ctx.fill(); }
      }
      // fermeture éclair : dents, puis tirette
      ctx.strokeStyle = '#8a6a50';
      ctx.lineWidth = 5;
      ctx.save();
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ZIP.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = '#c9ced4';
      ctx.lineWidth = 14;
      ctx.beginPath();
      let first = true;
      for (let f = zip; f <= 1.0001; f += 0.025) {
        const p = zipAt(f);
        if (first) { ctx.moveTo(p.x, p.y); first = false; } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      const tp = zipAt(zip);
      ctx.fillStyle = '#9aa3ad';
      roundRect(ctx, tp.x - 22, tp.y - 10, 44, 70, 12); ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.stroke();
      if ((step === 'open' || step === 'close') && !zipDrag) {
        const a = 0.5 + 0.5 * Math.sin(time * 6);
        ctx.strokeStyle = `rgba(255, 138, 61, ${0.35 + 0.5 * a})`;
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(tp.x, tp.y + 24, 58 + 6 * a, 0, TAU); ctx.stroke();
      }
      if (step === 'beat' && good + miss === 0) fitText(ctx, t('sec.heart.listen'), HX, HY + HR + 70, 600, 34, C.paper, 800);
    },
  };
}
