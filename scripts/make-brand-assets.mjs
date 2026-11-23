// Generates public/favicon.png, public/apple-touch-icon.png and
// public/og-image.png from the supplied logo PNG. Run with:
//   node scripts/make-brand-assets.mjs
// Re-run when the official icon or white logo files arrive (and switch the
// source below to them).
import sharp from 'sharp';

const SOURCE = 'src/assets/brand/Logos_on_White_Main_Logo_USC_Format1_W.png';
const WHITE = '#FFFFFF';

// Find the emblem: the opaque block left of the first fully transparent
// column gap that separates it from the wordmark.
const probe = 1000;
const { data, info } = await sharp(SOURCE).resize({ width: probe }).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
const opaqueColumn = (x) => {
  for (let y = 0; y < info.height; y++) if (data[y * info.width + x] > 16) return true;
  return false;
};
let x = 0;
while (x < info.width && !opaqueColumn(x)) x++;
const start = x;
while (x < info.width && opaqueColumn(x)) x++;
let end = x;
// Allow small gaps inside the emblem: keep going while the next opaque run starts within 1% of the width.
for (;;) {
  let gapEnd = end;
  while (gapEnd < info.width && !opaqueColumn(gapEnd)) gapEnd++;
  if (gapEnd - end > info.width * 0.03 || gapEnd >= info.width) break;
  x = gapEnd;
  while (x < info.width && opaqueColumn(x)) x++;
  end = x;
}
const meta = await sharp(SOURCE).metadata();
const scale = meta.width / info.width;
const left = Math.floor(start * scale);
const width = Math.ceil((end - start) * scale);
const emblem = await sharp(SOURCE).extract({ left, top: 0, width, height: meta.height }).trim().png().toBuffer();
console.log(`emblem: x ${left}..${left + width} of ${meta.width}`);

async function square(size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const icon = await sharp(emblem).resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: icon, gravity: 'center' }])
    .png();
}

await (await square(64, 0.04)).toFile('public/favicon.png');
await (await square(180, 0.1)).toFile('public/apple-touch-icon.png');

const logo = await sharp(SOURCE).resize({ width: 880 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: WHITE } })
  .composite([{ input: logo, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile('public/og-image.png');
console.log('wrote public/favicon.png, public/apple-touch-icon.png, public/og-image.png');
