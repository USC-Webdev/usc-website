import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Schemas here must match keystatic.config.ts exactly.
const scratch = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/scratch' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { scratch };
