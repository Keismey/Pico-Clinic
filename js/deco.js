// V3b — Décorations de l'atelier (cosmétiques, GDD 02-progression) : achetées à la boutique,
// elles apparaissent au comptoir. Chaque objet est dessiné centré en (0, 0) ; PLACE = sa place dans l'atelier.
import { game } from './state.js';
import { save, persist } from './save.js';
import { roundRect } from './ui.js';

const TAU = Math.PI * 2;

export function decoList() {
  return game.data.decorations || [];
}
export function hasDeco(id) {
  return (save.deco || []).includes(id);
}
// 'owned', 'rank', 'money' ou 'ok'
export function decoState(d) {
  if (hasDeco(d.id)) return 'owned';
  if (save.rank < (d.rank || 1)) return 'rank';
  if (save.credits < d.price) return 'money';
  return 'ok';
}
export function buyDeco(d) {
  if (decoState(d) !== 'ok') return false;
  save.credits -= d.price;
  save.deco = [...(save.deco || []), d.id];
  persist();
  return true;
}

const DRAW = {
  lamp(ctx, time) {
    // lampe d'établi articulée
    ctx.fillStyle = '#3a4150';
    roundRect(ctx, -40, 70, 80, 22, 8); ctx.fill();
    ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 74); ctx.lineTo(-24, -10); ctx.lineTo(20, -70); ctx.stroke();
    ctx.fillStyle = 'rgba(255, 220, 140, 0.35)';
    ctx.beginPath(); ctx.moveTo(-6, -46); ctx.lineTo(-60, 70); ctx.lineTo(40, 70); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(20, -70); ctx.rotate(0.6);
    ctx.fillStyle = '#e0453a';
    ctx.beginPath(); ctx.moveTo(-34, 30); ctx.lineTo(-14, -14); ctx.lineTo(14, -14); ctx.lineTo(34, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff2b0';
    ctx.beginPath(); ctx.ellipse(0, 30, 30, 9, 0, 0, TAU); ctx.fill();
    ctx.restore();
  },
  plant(ctx, time) {
    const sway = Math.sin(time * 1.2) * 0.05;
    ctx.fillStyle = '#c47a3c';
    ctx.beginPath(); ctx.moveTo(-40, 20); ctx.lineTo(40, 20); ctx.lineTo(30, 90); ctx.lineTo(-30, 90); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8f5426'; ctx.fillRect(-44, 14, 88, 14);
    for (const [a, l, c] of [[-0.6, 90, '#3a9d6a'], [-0.2, 120, '#5fbf7f'], [0.25, 110, '#3a9d6a'], [0.65, 85, '#7cc68a'], [0, 70, '#2f8a5b']]) {
      ctx.save(); ctx.translate(0, 18); ctx.rotate(a + sway);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(0, -l / 2, 18, l / 2, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  },
  poster(ctx) {
    ctx.fillStyle = '#fff7ec';
    roundRect(ctx, -75, -100, 150, 200, 8); ctx.fill();
    ctx.strokeStyle = '#c9b291'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#5fb8e8';
    roundRect(ctx, -60, -85, 120, 110, 6); ctx.fill();
    // petit drone dessiné sur l'affiche
    ctx.fillStyle = '#3fd0bb'; roundRect(ctx, -22, -44, 44, 34, 8); ctx.fill();
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 4;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 22, -36); ctx.lineTo(sx * 44, -56); ctx.stroke(); ctx.beginPath(); ctx.ellipse(sx * 44, -58, 14, 4, 0, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = '#e0453a'; ctx.fillRect(-50, 40, 100, 12);
    ctx.fillStyle = '#c9b291'; ctx.fillRect(-50, 62, 70, 8); ctx.fillRect(-50, 78, 84, 8);
    ctx.fillStyle = '#8f5426';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 62, -88, 5, 0, TAU); ctx.fill(); }
  },
  rug(ctx) {
    // tapis d'établi vert sous les patients
    ctx.fillStyle = '#2f8a5b';
    roundRect(ctx, -230, -16, 460, 32, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
    for (let x = -200; x <= 200; x += 40) { ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x, 12); ctx.stroke(); }
  },
  hanging_drone(ctx, time) {
    const swing = Math.sin(time * 1.4) * 0.08;
    ctx.save(); ctx.rotate(swing);
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(0, -20); ctx.stroke();
    ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sx * 42, sy * 26); ctx.stroke(); }
    ctx.fillStyle = '#ffd166'; roundRect(ctx, -26, -18, 52, 36, 10); ctx.fill();
    ctx.fillStyle = '#ff8a3d';
    const a = time * 12;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.ellipse(sx * 42, sy * 26 - 8, 22 * Math.abs(Math.cos(a + sx)), 5, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  },
  aquarium(ctx, time) {
    ctx.fillStyle = '#8f5426'; roundRect(ctx, -88, 50, 176, 16, 6); ctx.fill();
    ctx.fillStyle = 'rgba(95, 184, 232, 0.55)'; roundRect(ctx, -82, -60, 164, 112, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#e6d4b6'; ctx.fillRect(-80, 34, 160, 16);
    // poisson mécanique qui fait des allers-retours
    const fx = Math.sin(time * 0.8) * 46, dir = Math.cos(time * 0.8) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(fx, -8 + Math.sin(time * 2) * 6); ctx.scale(dir, 1);
    ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 15, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-40, -12); ctx.lineTo(-40, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#aeb6c0'; ctx.beginPath(); ctx.arc(-6, 0, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.arc(14, -4, 4, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let k = 0; k < 3; k++) { const y = 30 - ((time * 30 + k * 30) % 90); ctx.beginPath(); ctx.arc(50 + k * 6, y, 5 - k, 0, TAU); ctx.fill(); }
  },
  neon_sign(ctx, time) {
    // cadre lumineux autour de l'enseigne : ampoules qui s'allument à tour de rôle
    const on = Math.floor(time * 3);
    ctx.strokeStyle = 'rgba(63, 208, 187, 0.55)'; ctx.lineWidth = 10;
    roundRect(ctx, -230, -62, 460, 124, 28); ctx.stroke();
    for (let k = 0; k < 14; k++) {
      const x = -210 + k * (420 / 13);
      for (const y of [-62, 62]) {
        const lit = (k + (y > 0 ? 1 : 0) + on) % 2 === 0;
        ctx.fillStyle = lit ? '#fff2b0' : '#c9a24a';
        ctx.beginPath(); ctx.arc(x, y, lit ? 9 : 7, 0, TAU); ctx.fill();
      }
    }
  },
  gear_clock(ctx, time) {
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    for (let k = 0; k < 24; k++) { const a = (k / 24) * TAU, r = k % 2 ? 46 : 54; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff7ec'; ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#3a2a1e'; ctx.lineCap = 'round';
    const d = new Date();
    const m = (d.getMinutes() + d.getSeconds() / 60) / 60, h = ((d.getHours() % 12) + m) / 12;
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(h * TAU) * 20, -Math.cos(h * TAU) * 20); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(m * TAU) * 30, -Math.cos(m * TAU) * 30); ctx.stroke();
    ctx.fillStyle = '#8f5426'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
    // petit engrenage qui tourne à côté
    ctx.save(); ctx.translate(52, 40); ctx.rotate(time);
    ctx.fillStyle = '#a8822a';
    ctx.beginPath();
    for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU, r = k % 2 ? 16 : 21; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },
};

// Place dans l'atelier : [x, y, échelle] ; wall = dessiné sur le mur, sinon sur le comptoir.
const PLACE = {
  poster: [120, 520, 1, 'wall'],
  aquarium: [120, 760, 1, 'wall'],
  gear_clock: [555, 455, 0.8, 'wall'],
  hanging_drone: [555, 320, 0.9, 'wall'],
  lamp: [1010, 607, 0.9, 'wall'],
  neon_sign: [290, 304, 1, 'wall'],
  rug: [840, 995, 1, 'counter'],
  plant: [585, 905, 0.9, 'counter'],
};

// Objet seul (boutique) : centré en (x, y), agrandi de s.
export function drawDeco(ctx, id, x, y, s = 1, time = 0) {
  if (!DRAW[id]) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  DRAW[id](ctx, time);
  ctx.restore();
}

// Toutes les décorations achetées, au mur ('wall') ou sur le comptoir ('counter').
export function drawOwnedDecos(ctx, where, time = 0) {
  for (const id of save.deco || []) {
    const p = PLACE[id];
    if (p && p[3] === where) drawDeco(ctx, id, p[0], p[1], p[2], time);
  }
}

// Petite vignette pour la boutique (taille à peu près égale pour tous).
export const ICON_SCALE = { lamp: 0.8, plant: 0.8, poster: 0.6, rug: 0.32, hanging_drone: 1.1, aquarium: 0.75, neon_sign: 0.3, gear_clock: 1.1 };
