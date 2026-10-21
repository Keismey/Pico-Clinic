// Notation 3 étoiles, pourboire et enregistrement dans la sauvegarde.
import { game } from './state.js';
import { save, persist } from './save.js';
import { rustCleaned } from './gestures/vacuum.js';
import { partEarned } from './progress.js';

// Propreté (%) : rouille aspirée, moins les vis abîmées.
export function cleanliness(rep) {
  const slip = game.data.gestures.unscrew.slip_cleanliness;
  return Math.max(0, Math.min(100, Math.round(100 * rustCleaned(rep) - rep.slips * slip)));
}

// Précision (%) : moyenne des soudures et des alignements de puce (100 s'il n'y en a pas).
export function precision(rep) {
  const s = [rep.weld.score, rep.chip.score].filter((v) => v !== null && v !== undefined);
  if (!s.length) return 100;
  return Math.round((100 * s.reduce((a, b) => a + b, 0)) / s.length);
}

export function scoreRepair(rep) {
  const g = game.data.gestures.scoring;
  const p = rep.patient;
  const clean = cleanliness(rep);
  const prec = precision(rep);
  // un condensateur cassé ne retire pas d'étoile : la pièce de rechange se paie en crédits
  const parts = (rep.partsUsed || 0) * g.capacitor_cost;
  const stars = [rep.faults.size === 0, clean >= g.clean_min, prec >= g.precise_min];
  const onTime = rep.elapsed <= p.target_time;
  return { stars, clean, prec, parts, onTime, base: p.reward, tip: onTime ? Math.round(p.reward * g.tip_ratio) : 0 };
}

// À appeler une seule fois par réparation terminée. Une commande ne paie qu'une fois :
// la rejouer permet seulement d'améliorer ses étoiles.
export function recordRepair(rep, r) {
  const id = rep.patient.id;
  const o = save.orders[id] || { stars: [false, false, false], best_time: null, paid: false, plays: 0 };
  const firstPay = !o.paid;
  const paid = (firstPay ? r.base + r.tip : 0) - r.parts;
  const count = (a) => a.filter(Boolean).length;
  const record = o.plays > 0 && count(r.stars) > count(o.stars);
  if (count(r.stars) >= count(o.stars)) o.stars = r.stars.slice();
  const tm = Math.round(rep.elapsed);
  o.best_time = o.best_time === null ? tm : Math.min(o.best_time, tm);
  o.paid = true;
  o.plays++;
  save.orders[id] = o;
  save.credits = Math.max(0, save.credits + paid);
  // commande d'examen réussie (même avec 1 étoile) : nouveau rang
  const exam = rep.patient.order && rep.patient.order.exam;
  let rankUp = 0;
  if (exam && save.rank < exam) { save.rank = exam; rankUp = exam; }
  // pièce rare : 3 étoiles sur une commande clé, ou cadeau du client
  const part = rep.patient.order ? partEarned(rep.patient.order, count(o.stars)) : null;
  if (part) save.rare_parts.push(part.id);
  persist();
  return { firstPay, paid, record, rankUp, part };
}
