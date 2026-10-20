// Geste de dévissage : maintenir sur la vis puis tourner en cercle autour.
// Progression = angle cumulé du doigt autour du centre de la vis.
// Dérapage si le doigt s'éloigne de plus de slip_factor × le rayon de la vis.
const TAU = Math.PI * 2;

export function createUnscrew(screws, params, hooks = {}) {
  let active = null;

  function find(x, y) {
    let best = null;
    let bd = Infinity;
    for (const s of screws) {
      if (s.out) continue;
      const d = Math.hypot(x - s.x, y - s.y);
      if (d < s.r * params.grab_factor && d < bd) { best = s; bd = d; }
    }
    return best;
  }

  return {
    get active() { return active && active.s; },

    down(x, y) {
      const s = find(x, y);
      if (!s) return false;
      active = { s, last: Math.atan2(y - s.y, x - s.x), quarter: Math.floor(Math.abs(s.turned) / (TAU / 4)) };
      return true;
    },

    move(x, y) {
      if (!active) return;
      const s = active.s;
      const d = Math.hypot(x - s.x, y - s.y);
      if (d > s.r * params.slip_factor) {
        active = null;
        if (hooks.onSlip) hooks.onSlip(s);
        return;
      }
      const a = Math.atan2(y - s.y, x - s.x);
      // trop près du centre : l'angle n'est pas fiable, on attend
      if (d < s.r * 0.3) { active.last = a; return; }
      let da = a - active.last;
      if (da > Math.PI) da -= TAU;
      else if (da < -Math.PI) da += TAU;
      active.last = a;
      s.turned += da;
      s.angle += da;
      const need = (s.rusty ? params.turns_rusty : params.turns) * TAU;
      s.progress = Math.min(1, Math.abs(s.turned) / need);
      const q = Math.floor(Math.abs(s.turned) / (TAU / 4));
      if (q !== active.quarter) {
        active.quarter = q;
        if (hooks.onTick) hooks.onTick(s);
      }
      if (s.progress >= 1) {
        s.out = true;
        active = null;
        if (hooks.onOut) hooks.onOut(s);
      }
    },

    up() {
      active = null;
    },

    // Repères autour de la vis : cercle à suivre, limite de dérapage, avancement.
    drawGuides(ctx, time) {
      for (const s of screws) {
        if (s.out || s.fly) continue;
        const isActive = active && active.s === s;
        if (isActive) {
          ctx.save();
          ctx.setLineDash([10, 14]);
          ctx.lineDashOffset = -time * 40;
          ctx.strokeStyle = 'rgba(214, 69, 69, 0.28)';
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * params.slip_factor, 0, TAU); ctx.stroke();
          ctx.strokeStyle = 'rgba(37, 160, 141, 0.9)';
          ctx.lineWidth = 6;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 1.5, 0, TAU); ctx.stroke();
          ctx.restore();
        }
        if (s.progress > 0 || isActive) {
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(0,0,0,0.12)';
          ctx.lineWidth = 12;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 20, 0, TAU); ctx.stroke();
          ctx.strokeStyle = '#ff8a3d';
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 20, -Math.PI / 2, -Math.PI / 2 + s.progress * TAU); ctx.stroke();
        }
      }
    },
  };
}
