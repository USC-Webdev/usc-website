// CI guard: the media team is the Confederation Media Network (CMN). Older
// names (Confederation Broadcast/Broadcasting Network, CBN) must not appear in
// content. Prints every offending line.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOTS = ['src/content', 'src/pages', 'src/components'];
const OLD = /\b(broadcast(ing)?\s+network|CBN)\b/i;
const problems = [];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(ya?ml|mdoc|md|astro|ts)$/.test(entry.name)) yield path;
  }
}

for (const root of ROOTS) {
  for await (const path of walk(root)) {
    const lines = (await readFile(path, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      if (OLD.test(line)) problems.push(`${path}:${i + 1}: ${line.trim().slice(0, 120)}`);
    });
  }
}

if (problems.length) {
  console.error('check-names: old media team name found. Use "Confederation Media Network" / "CMN".');
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('check-names: no old media team names.');
