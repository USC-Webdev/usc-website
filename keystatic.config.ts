import { config, collection, fields } from '@keystatic/core';

// GitHub mode: editors save to a content/... branch and open a pull request.
// The scratch collection is a throwaway used for the Phase 1 deploy test.
export default config({
  storage: {
    kind: 'github',
    repo: 'USC-Webdev/usc-website',
    branchPrefix: 'content/',
  },
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
