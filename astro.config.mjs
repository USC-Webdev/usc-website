// @ts-check
import { defineConfig } from 'astro/config';

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
  adapter: vercel(),
});
