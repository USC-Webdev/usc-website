import type { APIRoute } from 'astro';
import { getMinistries, getNewsletters, ministryHref, newsletterHref } from '../lib/content';

// Hand-built sitemap (no extra dependency). /styleguide and /keystatic are
// left out on purpose.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const paths = [
    '/home',
    '/our-vision',
    '/leadership',
    '/ministries',
    ...(await getMinistries()).map((m) => ministryHref(m.id)),
    '/policies',
    '/citizenship',
    '/media-network',
    '/media-network/the-citizen-compass',
    ...(await getNewsletters()).map((n) => newsletterHref(n.id)),
  ];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
