// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

// Public pages are prerendered (Astro's default static output).
// The Keystatic admin and API routes opt out of prerendering and run as
// Vercel functions through the adapter.
export default defineConfig({
  site: 'https://www.unitedspaceconfederation.org',
  integrations: [react(), markdoc(), keystatic()],
  // /home stays the canonical home page (it is the existing URL).
  redirects: {
    '/': '/home',
  },
  adapter: vercel({ imageService: false }),
  // Images are optimized at build time by astro:assets (sharp), not by
  // Vercel's runtime image service.
  image: {
    responsiveStyles: false,
    // Remote pictures downloaded at build time and served from this site:
    // YouTube thumbnails (video cards, Latest updates) and the preview
    // pictures of linked Instagram and X posts. Keep in sync with
    // IMAGE_HOSTS in src/lib/feed.ts.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.ytimg.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
  // Fonts are downloaded at build time and self-hosted from the site.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Orbitron',
      cssVariable: '--font-orbitron',
      weights: [400, 500, 700, 900],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Exo 2',
      cssVariable: '--font-exo',
      weights: [400, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif'],
    },
  ],
});
