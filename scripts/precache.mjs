// Runs after `expo export` (see "build:web" in package.json). Writes dist/precache.json: every file
// the web app needs, so the offline worker (public/sw.js) can save them all, including the
// screens you haven't opened yet (each screen is its own .js file).
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const files = walk(dist)
  .map((path) => '/' + relative(dist, path).split('\\').join('/'))
  .filter((url) => !url.endsWith('.map') && url !== '/metadata.json' && url !== '/sw.js')
  // @expo/vector-icons ships ~19 icon fonts (4 MB); Budjet only uses Ionicons.
  .filter((url) => !url.endsWith('.ttf') || url.includes('/Ionicons.'));

writeFileSync(join(dist, 'precache.json'), JSON.stringify(files));
console.log(`precache.json: ${files.length} files`);
