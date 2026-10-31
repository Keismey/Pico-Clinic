// Refait les listes de fichiers du mode hors ligne (sw.js) et change sa version.
// Lancer : node tools/maj-cache.mjs  (après chaque modification du jeu, avant le commit)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
// dossiers et fichiers qui ne sont pas utiles au joueur
const SKIP = new Set(['.git', 'docs', 'tools', 'sw.js', 'README.md', 'LISEZMOI.md']);
// pas préchargés : grandes icônes (demandées par le navigateur à l'installation), aperçu de lien, musiques (à part)
const NO_PRECACHE = new Set(['icons/icon-512.png', 'icons/maskable-512.png', 'og.jpg']);
const isMusic = (f) => /^audio\/[^/]+\.mp3$/.test(f);
const files = [];
(function walk(dir) {
  for (const f of readdirSync(join(root, dir)).sort()) {
    if (SKIP.has(f) || f.startsWith('.')) continue;
    const p = dir ? dir + '/' + f : f;
    if (statSync(join(root, p)).isDirectory()) walk(p);
    else files.push(p);
  }
})('');

const short = (h) => h.digest('hex').slice(0, 8);
const hash = createHash('sha256');
for (const f of files) hash.update(f).update(readFileSync(join(root, f)));
const version = 'pico-clinic-' + short(hash);
const precache = files.filter((f) => !NO_PRECACHE.has(f) && !isMusic(f));
const music = Object.fromEntries(files.filter(isMusic).map((f) => [f, short(createHash('sha256').update(readFileSync(join(root, f))))]));

const swPath = join(root, 'sw.js');
let sw = readFileSync(swPath, 'utf8');
sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);
sw = sw.replace(/const FILES = \[[\s\S]*?\];/, `const FILES = [\n${precache.map((f) => `  '${f}',`).join('\n')}\n];`);
sw = sw.replace(/const MUSIC = \{[\s\S]*?\};/, `const MUSIC = {\n${Object.entries(music).map(([f, h]) => `  '${f}': '${h}',`).join('\n')}\n};`);
writeFileSync(swPath, sw);
const size = (list) => (list.reduce((n, f) => n + statSync(join(root, f)).size, 0) / 1e6).toFixed(1);
console.log(`${precache.length} fichiers préchargés (${size(precache)} Mo), ${Object.keys(music).length} musiques (${size(Object.keys(music))} Mo), version ${version}`);
