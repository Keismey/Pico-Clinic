// Refait la liste des fichiers du mode hors ligne (sw.js) et change sa version.
// Lancer : node tools/maj-cache.mjs  (après chaque modification du jeu, avant le commit)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
// dossiers et fichiers qui ne sont pas utiles au joueur
const SKIP = new Set(['.git', 'docs', 'tools', 'sw.js', 'README.md', 'LISEZMOI.md']);
const files = [];
(function walk(dir) {
  for (const f of readdirSync(join(root, dir)).sort()) {
    if (SKIP.has(f) || f.startsWith('.')) continue;
    const p = dir ? dir + '/' + f : f;
    if (statSync(join(root, p)).isDirectory()) walk(p);
    else files.push(p);
  }
})('');

const hash = createHash('sha256');
for (const f of files) hash.update(f).update(readFileSync(join(root, f)));
const version = 'pico-clinic-' + hash.digest('hex').slice(0, 8);

const swPath = join(root, 'sw.js');
let sw = readFileSync(swPath, 'utf8');
sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);
sw = sw.replace(/const FILES = \[[\s\S]*?\];/, `const FILES = [\n  './',\n${files.map((f) => `  '${f}',`).join('\n')}\n];`);
writeFileSync(swPath, sw);
const size = files.reduce((n, f) => n + statSync(join(root, f)).size, 0);
console.log(`${files.length} fichiers (${(size / 1e6).toFixed(1)} Mo), version ${version}`);
