import { config, collection, fields } from '@keystatic/core';

// Phase 1: local mode with one throwaway collection.
// Step 4 of Phase 1 switches this to:
//   storage: { kind: 'github', repo: 'OWNER/NAME', branchPrefix: 'content/' }
export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'USC' },
  },
  collections: {
    scratch: collection({
      label: 'Scratch (throwaway)',
      slugField: 'title',
      path: 'src/content/scratch/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        body: fields.markdoc({ label: 'Body' }),
      },
    }),
  },
});
