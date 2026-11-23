// Checks that all 19 existing site paths (plus sitemap and robots) return 200.
// usage: node scripts/check-routes.mjs https://usc-website-nine.vercel.app
const base = (process.argv[2] ?? 'https://www.unitedspaceconfederation.org').replace(/\/$/, '');
const paths = [
  '/home',
  '/our-vision',
  '/leadership',
  '/ministries',
  '/ministries/usc-navy',
  '/ministries/security',
  '/ministries/exploration',
  '/ministries/commerce',
  '/ministries/engineering',
  '/ministries/state-affairs',
  '/policies',
  '/citizenship',
  '/media-network',
  '/media-network/the-citizen-compass',
  '/media-network/newsletter-q3-2956',
  '/media-network/newsletter-q2-2956',
  '/media-network/newsletter-q1-2956',
  '/media-network/newsletter-q4-2955',
  '/media-network/newsletter-q3-2955',
  '/sitemap.xml',
  '/robots.txt',
];
let failed = 0;
for (const path of paths) {
  const res = await fetch(base + path, { redirect: 'manual' });
  const ok = res.status === 200;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${res.status} ${path}`);
}
const root = await fetch(base + '/', { redirect: 'manual' });
console.log(`${[301, 302, 307, 308].includes(root.status) ? 'ok  ' : 'FAIL'} ${root.status} / -> ${root.headers.get('location')}`);
process.exit(failed ? 1 : 0);
