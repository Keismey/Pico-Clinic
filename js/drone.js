// Mini-drone jouet dessiné en formes simples (remplacé plus tard par les images Gemini).
import { C, roundRect } from './ui.js';

const TAU = Math.PI * 2;

// Géométrie du drone en vue zoomée (coordonnées logiques).
export const D = {
  cx: 540, cy: 800,
  half: 270,          // demi-côté du capot
  screwOff: 212,      // position des vis par rapport au centre
  rotorOff: 395,
  rotorR: 120,
  board: 250,         // demi-côté de la carte électronique
  socket: { x: 655, y: 940, w: 100, h: 62 },
  anchor: { x: 430, y: 975 },
  plugStart: { x: 385, y: 835 },
  plugW: 84, plugH: 48,
  cableMax: 480,
  led: { x: 760, y: 860 },
  chip: { x: 335, y: 600, s: 140 },   // emplacement de la puce (coin haut gauche)
  slot: { x: 405, y: 670 },            // centre de l'emplacement
  box: { x: 905, y: 222 },             // boîte de pièces neuves
  // piste coupée à souder : de la pastille A à la pastille B
  solderPts: [[610, 600], [715, 600], [735, 675], [650, 705], [640, 775], [760, 800]],
};

// Chemin de soudure échantillonné (Catmull-Rom) : points {x, y, s} avec s = longueur cumulée.
function buildPath(pts) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    for (let k = 0; k < 20; k++) {
      const t = k / 20, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
    }
  }
  out.push({ x: pts[n - 1][0], y: pts[n - 1][1] });
  let s = 0;
  out.forEach((p, i) => { if (i) s += Math.hypot(p.x - out[i - 1].x, p.y - out[i - 1].y); p.s = s; });
  return { pts: out, len: s, a: out[0], b: out[out.length - 1] };
}
export const SOLDER = buildPath(D.solderPts);

// Point du chemin à la longueur s.
export function pathAt(s) {
  const P = SOLDER.pts;
  for (let i = 1; i < P.length; i++) {
    if (P[i].s >= s) {
      const a = P[i - 1], b = P[i];
      const k = (s - a.s) / Math.max(1e-6, b.s - a.s);
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
  }
  return { x: SOLDER.b.x, y: SOLDER.b.y };
}

// Endroit à faire clignoter pour une panne restante.
export function faultSpot(fault) {
  if (fault === 'chip_burnt') return { x: D.slot.x, y: D.slot.y, r: 120 };
  if (fault === 'trace_cut') { const p = pathAt(SOLDER.len / 2); return { x: p.x, y: p.y, r: 140 }; }
  return { x: D.socket.x, y: D.socket.y, r: 110 };
}

const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

// Dessine fn() dans le repère du drone, déplacé en (x, y) et agrandi de s.
export function withDrone(ctx, x, y, s, fn) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(-D.cx, -D.cy);
  fn();
  ctx.restore();
}

export function drawShadow(ctx, lift = 0) {
  ctx.save();
  ctx.globalAlpha = 0.16 * (1 - lift * 0.6);
  ctx.fillStyle = '#5a3d22';
  const s = 1 - lift * 0.25;
  ctx.beginPath();
  ctx.ellipse(D.cx + 20, D.cy + 40, 520 * s, 470 * s, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// Bras, moteurs, hélices, lumières.
export function drawFrame(ctx, { rotorAngle = 0, rotorSpeed = 0, lights = null } = {}) {
  ctx.lineCap = 'round';
  for (const [sx, sy] of CORNERS) {
    const ex = D.cx + sx * D.rotorOff;
    const ey = D.cy + sy * D.rotorOff;
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 74;
    ctx.beginPath(); ctx.moveTo(D.cx, D.cy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = '#6b7684';
    ctx.lineWidth = 30;
    ctx.beginPath(); ctx.moveTo(D.cx, D.cy); ctx.lineTo(ex, ey); ctx.stroke();
  }
  // socle sous le capot
  ctx.fillStyle = '#374151';
  roundRect(ctx, D.cx - D.half - 6, D.cy - D.half - 6, (D.half + 6) * 2, (D.half + 6) * 2, 74);
  ctx.fill();

  CORNERS.forEach(([sx, sy], i) => {
    const rx = D.cx + sx * D.rotorOff;
    const ry = D.cy + sy * D.rotorOff;
    // protection d'hélice
    ctx.strokeStyle = C.copper;
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(rx, ry, D.rotorR + 10, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(rx, ry, D.rotorR + 3, 0, TAU); ctx.fill();
    // flou de rotation
    if (rotorSpeed > 6) {
      ctx.fillStyle = `rgba(255, 138, 61, ${Math.min(0.4, rotorSpeed / 90)})`;
      ctx.beginPath(); ctx.arc(rx, ry, D.rotorR, 0, TAU); ctx.fill();
    }
    // pales
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(rotorAngle * (i % 2 ? 1 : -1) + i);
    ctx.globalAlpha = rotorSpeed > 18 ? 0.35 : 1;
    ctx.fillStyle = C.orange;
    roundRect(ctx, -D.rotorR, -15, D.rotorR * 2, 30, 15);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    // moyeu
    ctx.fillStyle = '#374151';
    ctx.beginPath(); ctx.arc(rx, ry, 32, 0, TAU); ctx.fill();
    ctx.fillStyle = '#aeb6c0';
    ctx.beginPath(); ctx.arc(rx, ry, 12, 0, TAU); ctx.fill();
    // lumière sur le bras
    const lx = D.cx + sx * (D.rotorOff - 105);
    const ly = D.cy + sy * (D.rotorOff - 105);
    const on = lights && lights[i];
    if (on) {
      ctx.fillStyle = 'rgba(63, 208, 187, 0.45)';
      ctx.beginPath(); ctx.arc(lx, ly, 34, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = on ? '#9ff5e7' : '#2b323c';
    ctx.beginPath(); ctx.arc(lx, ly, 17, 0, TAU); ctx.fill();
  });
}

// Intérieur : carte, pistes, soudure, emplacement de puce, batterie, câble, prise et voyant.
export function drawInterior(ctx, rep, { glow = 0, slotGlow = 0, time = 0 } = {}) {
  const b = D.board;
  ctx.fillStyle = '#2f8a5b';
  roundRect(ctx, D.cx - b, D.cy - b, b * 2, b * 2, 40);
  ctx.fill();
  ctx.strokeStyle = '#256e48';
  ctx.lineWidth = 8;
  ctx.stroke();

  // pistes cuivrées
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 9;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const tracks = [
    [[489, 628], [540, 628], [565, 600], [594, 600]],
    [[489, 660], [560, 660], [560, 940], [D.socket.x - 50, 940]],
    [[489, 724], [520, 724], [520, 1010], [D.socket.x, 1010], [D.socket.x, 971]],
    [[321, 660], [300, 660], [300, 905]],
    [[SOLDER.b.x, SOLDER.b.y + 16], [D.led.x, D.led.y - 15]],
  ];
  for (const tr of tracks) {
    ctx.beginPath();
    tr.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }

  drawSolder(ctx, rep.weld, rep.faults.has('trace_cut') || rep.weld.done, time);
  drawSlot(ctx, rep.chip, slotGlow);

  // batterie
  ctx.fillStyle = '#f2c14e';
  roundRect(ctx, 305, 905, 130, 125, 18);
  ctx.fill();
  ctx.strokeStyle = '#c7962c';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = '#8a6418';
  ctx.fillRect(355, 960, 30, 8);
  ctx.fillRect(366, 949, 8, 30);

  // prise
  const so = D.socket;
  if (glow > 0) {
    ctx.fillStyle = `rgba(63, 208, 187, ${0.55 * glow})`;
    ctx.beginPath(); ctx.arc(so.x, so.y, 90, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#1f2937';
  roundRect(ctx, so.x - so.w / 2, so.y - so.h / 2, so.w, so.h, 10);
  ctx.fill();
  ctx.fillStyle = '#0b0f14';
  roundRect(ctx, so.x - so.w / 2 + 10, so.y - so.h / 2 + 10, so.w - 20, so.h - 20, 6);
  ctx.fill();
  ctx.fillStyle = '#d9a441';
  for (let k = -1; k <= 1; k++) ctx.fillRect(so.x + k * 22 - 4, so.y - 6, 8, 12);

  // voyant : vert quand tout est réparé
  const ok = rep.faults.size === 0;
  ctx.fillStyle = ok ? 'rgba(60, 191, 106, 0.4)' : 'rgba(214, 69, 69, 0.3)';
  ctx.beginPath(); ctx.arc(D.led.x, D.led.y, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = ok ? '#5fe08b' : '#e05050';
  ctx.beginPath(); ctx.arc(D.led.x, D.led.y, 15, 0, TAU); ctx.fill();

  drawCableAndPlug(ctx, rep.plug);
}

const CELL_COLORS = { good: ['#eef2f6', '#b9c2cc'], cold: ['#9aa0a6', '#6f757b'], burnt: ['#5a3a22', '#2e1d10'] };

// Piste à souder : pastilles, chemin en pointillés, étain déposé.
function drawSolder(ctx, weld, broken, time) {
  const P = SOLDER.pts;
  if (!broken) {
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 9;
    ctx.beginPath();
    P.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  } else {
    // chemin à suivre
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 247, 236, 0.18)';
    ctx.lineWidth = 34;
    ctx.beginPath();
    P.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.setLineDash([12, 14]);
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.85)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
    // étain déposé, cellule par cellule
    const n = weld.cells.length;
    const step = SOLDER.len / Math.max(1, n);
    for (let i = 0; i < n; i++) {
      const c = weld.cells[i];
      if (!c) continue;
      const p0 = pathAt(i * step), p1 = pathAt((i + 1) * step);
      const [fill, edge] = CELL_COLORS[c];
      ctx.strokeStyle = edge;
      ctx.lineWidth = 22;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      ctx.strokeStyle = fill;
      ctx.lineWidth = c === 'cold' ? 12 + (i % 3) * 4 : 14;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
  }
  // pastilles
  for (const [p, isA] of [[SOLDER.a, true], [SOLDER.b, false]]) {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.arc(p.x, p.y, 17, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f4d58d';
    ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, TAU); ctx.fill();
    if (broken && !weld.done && isA && !weld.active) {
      const a = 0.5 + 0.5 * Math.sin(time * 6);
      ctx.strokeStyle = `rgba(63, 208, 187, ${0.4 + 0.6 * a})`;
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(p.x, p.y, 34 + a * 10, 0, TAU); ctx.stroke();
    }
  }
}

// Emplacement de la puce : pastilles des broches, cadre, et puce si elle est en place.
function drawSlot(ctx, chip, slotGlow) {
  const ch = D.chip;
  ctx.fillStyle = '#d9a441';
  for (let k = 0; k < 4; k++) {
    const o = ch.y + 22 + k * 32;
    ctx.fillRect(ch.x - 18, o - 2, 18, 16);
    ctx.fillRect(ch.x + ch.s, o - 2, 18, 16);
  }
  if (slotGlow > 0) {
    ctx.fillStyle = `rgba(63, 208, 187, ${0.25 + 0.4 * slotGlow})`;
    roundRect(ctx, ch.x - 10, ch.y - 10, ch.s + 20, ch.s + 20, 18);
    ctx.fill();
  }
  ctx.save();
  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = slotGlow > 0.95 ? '#fff' : 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 5;
  roundRect(ctx, ch.x, ch.y, ch.s, ch.s, 12);
  ctx.stroke();
  ctx.restore();
  if (chip.old.state === 'slot') drawChip(ctx, D.slot.x, D.slot.y, 1, true);
  if (chip.neu.state === 'placed') drawChip(ctx, D.slot.x, D.slot.y, 1, false);
}

// Une puce centrée en (x, y). burnt = grillée.
export function drawChip(ctx, x, y, scale = 1, burnt = false, { shadow = 0 } = {}) {
  const s = D.chip.s;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (shadow) {
    ctx.fillStyle = `rgba(0,0,0,${0.25 * shadow})`;
    roundRect(ctx, -s / 2 + 14, -s / 2 + 24, s, s, 12);
    ctx.fill();
  }
  ctx.fillStyle = burnt ? '#8a7f74' : '#c9d0d8';
  for (let k = 0; k < 4; k++) {
    const o = -s / 2 + 22 + k * 32;
    ctx.fillRect(-s / 2 - 14, o, 14, 12);
    ctx.fillRect(s / 2, o, 14, 12);
  }
  ctx.fillStyle = burnt ? '#1a120d' : '#1f2430';
  roundRect(ctx, -s / 2, -s / 2, s, s, 12);
  ctx.fill();
  if (burnt) {
    ctx.fillStyle = 'rgba(150, 82, 30, 0.7)';
    ctx.beginPath(); ctx.arc(12, 8, 40, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(40, 22, 10, 0.9)';
    ctx.beginPath(); ctx.arc(16, 10, 20, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(-10, -5); ctx.lineTo(-22, 20); ctx.lineTo(5, 45); ctx.stroke();
  } else {
    ctx.fillStyle = '#3a4150';
    ctx.beginPath(); ctx.arc(-s / 2 + 26, -s / 2 + 26, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    roundRect(ctx, -40, 10, 80, 10, 5); ctx.fill();
    roundRect(ctx, -40, 30, 50, 10, 5); ctx.fill();
  }
  ctx.restore();
}

// Boîte des pièces neuves (en haut à droite).
export function drawPartBox(ctx) {
  const { x, y } = D.box;
  ctx.fillStyle = '#8f5426';
  roundRect(ctx, x - 112, y - 46, 224, 100, 20);
  ctx.fill();
  ctx.fillStyle = '#e6d4b6';
  roundRect(ctx, x - 104, y - 54, 208, 96, 18);
  ctx.fill();
  ctx.fillStyle = '#d2bc98';
  roundRect(ctx, x - 88, y - 42, 176, 72, 12);
  ctx.fill();
}

// Fer à souder tenu par le doigt : pointe en (x, y), chaleur 0 → 1.
export function drawIron(ctx, x, y, heat) {
  const dx = 0.55, dy = -0.83;
  const at = (d) => [x + dx * d, y + dy * d];
  ctx.save();
  ctx.lineCap = 'round';
  // ombre
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 40;
  ctx.beginPath(); ctx.moveTo(...at(170).map((v, i) => v + (i ? 26 : 18))); ctx.lineTo(...at(330).map((v, i) => v + (i ? 26 : 18))); ctx.stroke();
  // tige et pointe
  ctx.strokeStyle = '#9aa3ad';
  ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(...at(30)); ctx.lineTo(...at(180)); ctx.stroke();
  const hot = Math.min(1, heat);
  ctx.strokeStyle = `rgb(${120 + 135 * hot}, ${120 - 40 * hot}, ${120 - 90 * hot})`;
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(...at(40)); ctx.stroke();
  // poignée
  ctx.strokeStyle = C.orangeDark;
  ctx.lineWidth = 44;
  ctx.beginPath(); ctx.moveTo(...at(185)); ctx.lineTo(...at(330)); ctx.stroke();
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 34;
  ctx.stroke();
  // lueur de chaleur
  if (hot > 0) {
    ctx.fillStyle = `rgba(255, 120, 40, ${0.35 * hot})`;
    ctx.beginPath(); ctx.arc(x, y, 22 + 10 * hot, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawCableAndPlug(ctx, plug) {
  const A = D.anchor;
  const P = plug;
  const d = Math.hypot(P.x - A.x, P.y - A.y);
  const sag = Math.max(0, D.cableMax - d) * 0.45;
  const c1x = A.x + (P.x - A.x) * 0.33;
  const c1y = A.y + (P.y - A.y) * 0.33 + sag;
  const c2x = A.x + (P.x - A.x) * 0.66;
  const c2y = A.y + (P.y - A.y) * 0.66 + sag;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 24;
  ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.bezierCurveTo(c1x, c1y, c2x, c2y, P.x, P.y); ctx.stroke();
  ctx.strokeStyle = '#e0453a';
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.bezierCurveTo(c1x, c1y, c2x, c2y, P.x, P.y); ctx.stroke();

  // fiche
  ctx.save();
  ctx.translate(P.x, P.y);
  if (plug.lift) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, -D.plugW / 2 + 10, -D.plugH / 2 + 16, D.plugW, D.plugH, 10);
    ctx.fill();
  }
  ctx.fillStyle = '#f3f4f6';
  roundRect(ctx, -D.plugW / 2, -D.plugH / 2, D.plugW, D.plugH, 10);
  ctx.fill();
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#e0453a';
  ctx.fillRect(-D.plugW / 2 + 10, -6, 14, 12);
  ctx.restore();
}

// Capot avec un petit visage de jouet. Les vis peuvent être dessinées dessus (refermé).
export function drawCover(ctx, { offsetY = 0, rot = 0, alpha = 1, screws = null } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(D.cx, D.cy + offsetY);
  ctx.rotate(rot);
  const h = D.half;
  ctx.fillStyle = C.turquoise;
  roundRect(ctx, -h, -h, h * 2, h * 2, 70);
  ctx.fill();
  ctx.strokeStyle = C.copper;
  ctx.lineWidth = 14;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 6;
  roundRect(ctx, -h + 50, -h + 50, h * 2 - 100, h * 2 - 100, 40);
  ctx.stroke();
  // visage
  ctx.fillStyle = '#1f2937';
  ctx.beginPath(); ctx.arc(-75, -30, 30, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(75, -30, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-65, -42, 10, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(85, -42, 10, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 30, 60, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.fillStyle = 'rgba(255, 138, 61, 0.5)';
  ctx.beginPath(); ctx.arc(-130, 40, 24, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(130, 40, 24, 0, TAU); ctx.fill();
  if (screws) {
    for (const s of screws) drawScrew(ctx, s.dx, s.dy, s.r, { angle: s.angle, rusty: s.rusty, damaged: s.damaged });
  }
  ctx.restore();
}

// Une vis. progress 0 → 1 : elle monte en se dévissant.
export function drawScrew(ctx, x, y, r, { progress = 0, angle = 0, rusty = false, damaged = 0 } = {}) {
  const sc = 1 + progress * 0.2;
  const lift = progress * 12;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.arc(x + 4 + lift, y + 6 + lift, r * sc, 0, TAU); ctx.fill();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.fillStyle = rusty ? '#b8692a' : '#d3dae1';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = rusty ? '#7c4316' : '#7b8592';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.rotate(angle);
  if (rusty) {
    ctx.fillStyle = '#8a4b16';
    [[0.45, 0.2, 0.18], [-0.4, 0.45, 0.14], [-0.2, -0.5, 0.16], [0.5, -0.4, 0.1]].forEach(([a, b, c]) => {
      ctx.beginPath(); ctx.arc(a * r, b * r, c * r, 0, TAU); ctx.fill();
    });
  }
  ctx.fillStyle = '#4b5563';
  roundRect(ctx, -r * 0.62, -6, r * 1.24, 12, 5); ctx.fill();
  roundRect(ctx, -6, -r * 0.62, 12, r * 1.24, 5); ctx.fill();
  if (damaged) {
    ctx.strokeStyle = 'rgba(185, 28, 28, 0.85)';
    ctx.lineWidth = 4;
    for (let k = 0; k < Math.min(3, damaged); k++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.3 + k * 14);
      ctx.lineTo(r * 0.6, -r * 0.55 + k * 18);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Coupelle où atterrissent les vis retirées.
export const TRAY = { x: 150, y: 175 };
const TRAY_SLOTS = [[-48, -18], [40, -24], [-32, 24], [50, 20]];

export function trayPos(i) {
  const [dx, dy] = TRAY_SLOTS[i % 4];
  return { x: TRAY.x + dx, y: TRAY.y + dy };
}

export function drawTray(ctx) {
  ctx.fillStyle = '#c9b291';
  ctx.beginPath(); ctx.ellipse(TRAY.x, TRAY.y + 8, 118, 74, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e6d4b6';
  ctx.beginPath(); ctx.ellipse(TRAY.x, TRAY.y, 112, 68, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d2bc98';
  ctx.beginPath(); ctx.ellipse(TRAY.x, TRAY.y + 4, 84, 46, 0, 0, TAU); ctx.fill();
}
