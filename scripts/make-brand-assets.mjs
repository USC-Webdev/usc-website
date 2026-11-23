// Builds the web brand files from the org's original logo exports, which sit
// (git-ignored, too large for the repo) in the project root:
//   "USC Main Logo/", "WHITE BACKGROUND/", "BLACK BACKGROUND/", "AI*/"
// Run with: node scripts/make-brand-assets.mjs
//
// Outputs (committed):
//   src/assets/brand/logo-white.png      header logo, white, on Blue Zodiac
//   src/assets/images/ministries/<slug>/mark.png  ministry marks (the Keystatic
//                                                 "Ministry mark" field)
//   public/favicon.png, public/apple-touch-icon.png, public/og-image.png
//
// Nothing is redrawn or recoloured: files are only trimmed, cropped out of the
// supplied lockups and resized.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const WHITE = '#FFFFFF';


// Header logo: white Format 1 lockup on transparent.
await sharp('USC Main Logo/Banner_Layer 1.png').trim().resize({ height: 192 }).png({ compressionLevel: 9 }).toFile('src/assets/brand/logo-white.png');

// Ministry marks: each "WHITE BACKGROUND" sheet holds three lockups stacked
// vertically on solid white; the bottom one is the mark beside the
// abbreviation. Find that band, then the mark at its left (separated from the
// text by empty columns). The white outside the mark's hexagon is made
// transparent so the mark sits on Robot White; the artwork is not touched.
// abbreviation: [sheet number, ministry slug]
const sheets = { MSS: [1, 'security'], MIE: [2, 'exploration'], MIC: [3, 'commerce'], MES: [4, 'engineering'], MSA: [5, 'state-affairs'] };
function runs(filled, from, to) {
  const out = [];
  let start = -1;
  for (let i = from; i < to; i++) {
    const f = filled(i);
    if (f && start < 0) start = i;
    if (!f && start >= 0) {
      out.push([start, i]);
      start = -1;
    }
  }
  if (start >= 0) out.push([start, to]);
  return out;
}
for (const [abbr, [n, slug]] of Object.entries(sheets)) {
  const src = `WHITE BACKGROUND/${n}.png`;
  const meta = await sharp(src).metadata();
  const { data: g, info } = await sharp(src).flatten({ background: WHITE }).resize({ width: 1400 }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const ink = (x, y) => g[y * W + x] < 200;
  const rowBands = runs((y) => { for (let x = 0; x < W; x++) if (ink(x, y)) return true; return false; }, 0, H).filter(([a, b]) => b - a > H * 0.05);
  const [top, bottom] = rowBands[rowBands.length - 1];
  const colBands = runs((x) => { for (let y = top; y < bottom; y++) if (ink(x, y)) return true; return false; }, 0, W).filter(([a, b]) => b - a > 2);
  let [left, right] = colBands[0];
  for (const [a, b] of colBands.slice(1)) {
    if (a - right > W * 0.02) break;
    right = b;
  }
  const k = meta.width / W;
  const bx = Math.max(0, Math.floor(left * k) - 8);
  const by = Math.max(0, Math.floor(top * k) - 8);
  const box = { left: bx, top: by, width: Math.min(meta.width - bx, Math.ceil((right - left) * k) + 16), height: Math.min(meta.height - by, Math.ceil((bottom - top) * k) + 16) };
  const crop = await sharp(src).extract(box).flatten({ background: WHITE }).resize({ width: 512, height: 512, fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = crop.data, cw = crop.info.width, ch = crop.info.height;
  // Flood fill the outer white from the edges.
  const white = (i) => px[i * 4] > 232 && px[i * 4 + 1] > 232 && px[i * 4 + 2] > 232;
  const seen = new Uint8Array(cw * ch);
  const stack = [];
  for (let x = 0; x < cw; x++) stack.push(x, (ch - 1) * cw + x);
  for (let y = 0; y < ch; y++) stack.push(y * cw, y * cw + cw - 1);
  while (stack.length) {
    const i = stack.pop();
    if (seen[i] || !white(i)) continue;
    seen[i] = 1;
    px[i * 4 + 3] = 0;
    const x = i % cw, y = (i - x) / cw;
    if (x > 0) stack.push(i - 1);
    if (x < cw - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - cw);
    if (y < ch - 1) stack.push(i + cw);
  }
  await sharp(px, { raw: { width: cw, height: ch, channels: 4 } }).trim().resize({ width: 256, height: 256, fit: 'inside' }).png({ compressionLevel: 9 }).toFile(`src/assets/images/ministries/${slug}/mark.png`);
  console.log(abbr, box);
}

// Favicon, touch icon: the blue emblem, on white.
const emblem = await sharp('USC Main Logo/RedBubble_USC_Logo_For_White_BG.png').trim().png().toBuffer();
async function square(size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const icon = await sharp(emblem).resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } }).composite([{ input: icon, gravity: 'center' }]).png();
}
await (await square(64, 0.04)).toFile('public/favicon.png');
await (await square(180, 0.1)).toFile('public/apple-touch-icon.png');

// Social sharing image: blue Format 1 logo on white.
const logo = await sharp('src/assets/brand/Logos_on_White_Main_Logo_USC_Format1_W.png').resize({ width: 880 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: WHITE } })
  .composite([{ input: logo, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile('public/og-image.png');
console.log('done');
