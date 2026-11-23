// CI guard: fails if any image under src/assets/images is over 1.5 MB or
// wider than 3840px. Prints every offending path.
// Uses sharp, which Astro already installs for astro:assets.
import { readdir, stat } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/assets/images';
const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_WIDTH = 3840;
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tiff']);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) yield path;
  }
}

const problems = [];
let count = 0;

for await (const path of walk(ROOT)) {
  count += 1;
  const shown = relative(process.cwd(), path);
  const { size } = await stat(path);
  if (size > MAX_BYTES) {
    problems.push(`${shown}: ${(size / 1024 / 1024).toFixed(2)} MB (limit 1.5 MB)`);
  }
  try {
    const { width } = await sharp(path).metadata();
    if (width && width > MAX_WIDTH) {
      problems.push(`${shown}: ${width}px wide (limit ${MAX_WIDTH}px)`);
    }
  } catch (error) {
    problems.push(`${shown}: could not be read as an image (${error.message})`);
  }
}

if (problems.length > 0) {
  console.error(`check-images: ${problems.length} problem(s) in ${count} image(s):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`check-images: ${count} image(s) checked, all within limits.`);
