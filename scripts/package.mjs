import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { zipSync, strToU8 } from 'fflate';
const entries = {};
async function include(directory, prefix) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name), key = `${prefix}/${item.name}`;
    if (item.isDirectory()) await include(path, key);
    else entries[key] = new Uint8Array(await readFile(path));
  }
}
await include('dist', 'playable');
for (const directory of ['src', 'public', 'tests', 'scripts', '.github']) await include(directory, `source/${directory}`);
for (const file of ['package.json', 'package-lock.json', 'index.html', 'playwright.config.js', 'wrangler.jsonc', 'README.md', '.gitignore', '.node-version', 'AGENTS.md']) entries[`source/${file}`] = new Uint8Array(await readFile(file));
entries['START-HERE.txt'] = strToU8('Number Quest / AI Game Studio\n\nplayable/: built static website for Cloudflare Workers or any HTTP server.\nsource/: reusable Vite + Phaser source, Wrangler configuration, browser tests and CI.\nRead source/README.md for plain-English game requests.\nServe the playable folder over HTTP; opening index.html directly is unsupported.\n');
await mkdir('release', { recursive: true });
await writeFile('release/ai-game-studio.zip', zipSync(entries, { level: 6 }));
console.log(`Packaged ${Object.keys(entries).length} files into release/ai-game-studio.zip`);
