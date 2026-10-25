// Sauvegarde pico_save_v1 : identifiants et nombres uniquement, jamais de texte traduit.
// "version" permet de migrer une ancienne sauvegarde sans rien perdre.
const KEY = 'pico_save_v1';
const VERSION = 3;

function defaults() {
  return {
    version: VERSION,
    credits: 0,
    rank: 1,
    // niveau de chaque outil (1 à 3), acheté à la boutique
    tools: { iron: 1, vacuum: 1, lens: 1, tweezers: 1, driver: 1 },
    // par commande : meilleures étoiles [fonctionnel, propre, précis], meilleur temps, payée, parties
    orders: {},
    clients: {},
    rare_parts: [],
    // V3b : décorations achetées, parties d'Atelier libre
    deco: [],
    free: { plays: 0 },
    // tutoriel et histoire : leçons de Gribouille et scènes déjà vues
    story: [],
    // V4b : défi quotidien, par date (« 2026-10-25 ») : essais, étoiles, temps, payé
    daily: {},
    // V4b : écran Options. musicVol / sfxVol de 0 à 1 ; music / sound = volume au-dessus de 0
    settings: {
      lang: null, sound: true, music: true, musicVol: 0.6, sfxVol: 0.8,
      vibration: true, tremor: false, lefty: false, contrast: false,
    },
  };
}

// Version 1 (V0) : seulement les réglages. On garde tout ce qui existe et on complète.
// Version 3 (V1b) : les commandes sont rangées par numéro (o01…) ; l'ancien drone d'essai disparaît.
function migrate(d) {
  const def = defaults();
  const out = { ...def, ...d };
  out.settings = { ...def.settings, ...(d.settings || {}) };
  // anciens boutons Musique / Sons (V4a) : « non » devient un volume à 0
  const st = d.settings || {};
  if (st.musicVol === undefined && st.music === false) out.settings.musicVol = 0;
  if (st.sfxVol === undefined && st.sound === false) out.settings.sfxVol = 0;
  out.settings.music = out.settings.musicVol > 0;
  out.settings.sound = out.settings.sfxVol > 0;
  out.daily = d.daily && typeof d.daily === 'object' ? d.daily : {};
  out.tools = { ...def.tools, ...(d.tools || {}) };
  out.orders = {};
  for (const [k, v] of Object.entries(d.orders || {})) if (/^o\d+$/.test(k)) out.orders[k] = v;
  out.clients = { ...(d.clients || {}) };
  out.story = Array.isArray(d.story) ? d.story : [];
  out.deco = Array.isArray(d.deco) ? d.deco : [];
  out.version = VERSION;
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return migrate(JSON.parse(raw));
  } catch (e) {
    return defaults();
  }
}

export const save = load();

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* stockage indisponible */ }
}

// Nouvelle partie : tout est remis à zéro sauf les réglages.
export function resetSave() {
  const keep = save.settings;
  for (const k of Object.keys(save)) delete save[k];
  Object.assign(save, defaults(), { settings: keep });
  persist();
}

export function totalStars() {
  return Object.values(save.orders).reduce((n, o) => n + (o.stars || []).filter(Boolean).length, 0);
}
