// Vérification des textes FR/EN. Lancer : node tools/verif-langues.mjs
// Cherche : clés présentes dans une langue et pas l'autre, textes vides,
// variables {x} différentes, clés utilisées par le jeu mais absentes des fichiers.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const fr = json('lang/fr.json');
const en = json('lang/en.json');
const problems = [];
const warn = (m) => problems.push(m);

// 1. Les deux fichiers ont les mêmes clés, non vides, avec les mêmes variables.
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
for (const k of Object.keys(fr)) if (!(k in en)) warn(`absente en EN : ${k}`);
for (const k of Object.keys(en)) if (!(k in fr)) warn(`absente en FR : ${k}`);
for (const [name, d] of [['FR', fr], ['EN', en]]) {
  for (const [k, v] of Object.entries(d)) {
    if (typeof v !== 'string' || !v.trim()) warn(`texte vide (${name}) : ${k}`);
    else if (/TODO|XXX/.test(v) || (/\?\?\?/.test(v) && k !== 'nb.unknown')) warn(`texte provisoire (${name}) : ${k}`);
  }
}
for (const k of Object.keys(fr)) {
  if (k in en && vars(fr[k]) !== vars(en[k])) warn(`variables différentes : ${k} (FR {${vars(fr[k])}} / EN {${vars(en[k])}})`);
}

// 2. Clés utilisées par le jeu.
const used = new Set();
const ns = new Set(Object.keys(fr).map((k) => k.split('.')[0]));
const looksLikeKey = (s) => /^[a-z_]+\.[\w.]+$/.test(s) && ns.has(s.split('.')[0]) && !s.endsWith('.');

function walkFiles(dir, ext, out = []) {
  for (const f of readdirSync(join(root, dir))) {
    const p = join(dir, f);
    if (statSync(join(root, p)).isDirectory()) walkFiles(p, ext, out);
    else if (f.endsWith(ext)) out.push(p);
  }
  return out;
}
// Textes entre guillemets dans le code.
for (const f of walkFiles('js', '.js')) {
  for (const m of read(f).matchAll(/'([^'\n]+)'|"([^"\n]+)"/g)) {
    const s = m[1] || m[2];
    if (looksLikeKey(s) && !/\.(js|json|mp3|png|webp)$/.test(s)) used.add(s);
  }
}
// Textes dans les données (avec « orateur: » devant pour les bulles).
function walkData(x) {
  if (typeof x === 'string') {
    const s = x.replace(/^[a-z]+:/, '');
    if (looksLikeKey(s)) used.add(s);
  } else if (Array.isArray(x)) x.forEach(walkData);
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (k !== '_doc') walkData(v);
}
for (const f of walkFiles('data', '.json')) walkData(json(f));

// Clés fabriquées à partir des données.
const P = json('data/patients.json');
for (const id of Object.keys(P)) if (id !== '_doc') used.add('patient.' + id);
const CL = json('data/clients.json');
for (const id of Object.keys(CL.list)) {
  if (id === 'passage' || id === 'gribouille') { used.add('name.' + id); continue; }
  used.add('client.' + id);
}
for (const id of CL.order) used.add('client.' + id + '.bio'); // fiche du Carnet
for (const sp of ['mamie', 'note', 'postcard', 'ohm']) used.add('name.' + sp);
const TO = json('data/tools.json');
for (const [k, v] of Object.entries(TO)) {
  if (k === '_doc') continue;
  v.levels.forEach((l, i) => { used.add('tool.' + l.id); if (i > 0) used.add('tool.' + l.id + '.desc'); });
}
for (const d of json('data/decorations.json').list) used.add('deco.' + d.id);
for (const p of json('data/rare_parts.json').list) used.add('rare.' + p.id);
for (const r of json('data/ranks.json').list) {
  used.add('rank.' + r.rank); used.add('rank.' + r.rank + '.unlocks');
  if (r.rank > 1) used.add('rank.' + r.rank + '.exam');
}
const ST = json('data/story.json');
for (const sc of Object.values(ST.scenes)) {
  if (sc.chapter) { used.add('chapter.' + sc.chapter + '.title'); used.add('chapter.' + sc.chapter + '.sub'); }
  if (sc.speaker) used.add('name.' + sc.speaker);
}
for (const o of json('data/orders.json').list) {
  for (const l of [...(o.intro || []), ...(o.thanks || [])]) {
    const sp = l.match(/^([a-z]+):/);
    if (sp && !CL.list[sp[1]]) used.add('name.' + sp[1]);
  }
}
// Pannes trouvées à la loupe et gestes secondaires.
const O = json('data/orders.json');
for (const o of [...O.list, ...O.tests]) for (const f of o.hidden || []) used.add('op.found.' + f);
const secMap = read('js/drone.js').match(/export const SEC = \{([\s\S]*?)\};/)[1];
for (const m of secMap.matchAll(/(\w+): '(\w+)'/g)) {
  used.add('op.found.' + m[1]);
  for (const p of ['sec.title.', 'sec.tap.', 'tuto.sec.']) used.add(p + m[2]);
}
const opt = read('js/scenes/options.js');
const rows = opt.match(/const ROWS = \{([\s\S]*?)\};/)[1];
const toggles = JSON.parse(opt.match(/const TOGGLES = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
for (const m of rows.matchAll(/^\s*(\w+):/gm)) if (m[1] !== 'lang') used.add('opt.' + m[1]);
for (const k of toggles) used.add('opt.' + k + '.sub');

for (const k of [...used].sort()) {
  if (!(k in fr)) warn(`utilisée par le jeu mais absente (FR) : ${k}`);
  if (!(k in en)) warn(`utilisée par le jeu mais absente (EN) : ${k}`);
}

// 3. Bilan.
const unused = Object.keys(fr).filter((k) => !used.has(k));
console.log(`${Object.keys(fr).length} clés FR, ${Object.keys(en).length} clés EN, ${used.size} repérées dans le jeu.`);
if (unused.length) console.log(`(info) ${unused.length} clés non repérées automatiquement (construites autrement) : ${unused.slice(0, 40).join(', ')}${unused.length > 40 ? '…' : ''}`);
if (problems.length) {
  console.log(`\n${problems.length} problème(s) :`);
  problems.forEach((p) => console.log(' - ' + p));
  process.exit(1);
}
console.log('Aucune clé manquante.');
