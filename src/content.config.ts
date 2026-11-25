import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Mirrors keystatic.config.ts field for field. Keystatic writes empty text as
// "" and empty optional values as null or omits them, so optional fields
// accept all three.

type ImageFn = SchemaContext['image'];

const text = () => z.string().nullish().transform((v) => v ?? '');
const req = () => z.string().min(1);
const url = () => z.string().nullish().transform((v) => v ?? '');
const prose = () => z.string().nullish().transform((v) => v ?? '');
const list = <T extends z.ZodTypeAny>(item: T) => z.array(item).nullish().transform((v) => v ?? []);
const lines = () => list(z.string());
const creditStatus = () => z.enum(['Citizen', 'Resident']).nullish().transform((v) => v ?? 'Citizen');

const heroSchema = (image: ImageFn) =>
  z.object({
    image: image(),
    alt: text(),
    credit: text(),
    creditStatus: creditStatus(),
  });

const gallerySchema = (image: ImageFn) =>
  list(
    z.object({
      image: image(),
      alt: text(),
      caption: text(),
      credit: text(),
      creditStatus: creditStatus(),
    }),
  );

const sectionsSchema = () =>
  list(
    z.object({
      heading: req(),
      railLabel: text(),
      body: prose(),
    }),
  );

const titledItems = () => list(z.object({ title: req(), text: text() }));

const seo = { title: req(), description: text() };

const single = (name: string) => ({ pattern: `${name}.yaml`, base: './src/content/pages' });

const siteSettings = defineCollection({
  loader: glob({ pattern: 'site.yaml', base: './src/content/settings' }),
  schema: z.object({
    applicationUrl: z.url(),
    contactEmail: req(),
    tagline: text(),
    footerText: text(),
    youtube: url(),
    instagram: url(),
    x: url(),
    patreon: url(),
    swagStore: url(),
    galacticSenate: url(),
    affiliates: list(z.object({ label: req(), href: z.url() })),
    feedChannels: list(
      z.object({
        label: req(),
        channelId: z.string().min(10),
        carousel: z.enum(['creators', 'latest', 'off']).nullish().transform((v) => v ?? 'creators'),
      }),
    ),
    creatorFeeds: list(
      z.object({
        label: req(),
        rssUrl: z.string().url(),
        category: text(),
        count: z.number().int().nullish().transform((v) => v ?? 2),
      }),
    ),
    feedVideosPerChannel: z.number().int().nullish().transform((v) => v ?? 3),
    feedLength: z.number().int().nullish().transform((v) => v ?? 6),
    feedScreenshots: z.number().int().nullish().transform((v) => v ?? 2),
  }),
});

const home = defineCollection({
  loader: glob(single('home')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroKicker: text(),
      heroLines: lines(),
      hero: heroSchema(image),
      introHeading: text(),
      intro: prose(),
      philosophyHeading: text(),
      philosophy: titledItems(),
      community: sectionsSchema(),
      updatesHeading: z.string().nullish().transform((v) => v || 'Latest Updates'),
      creatorsHeading: z.string().nullish().transform((v) => v || 'Affiliated Creators'),
      ctaHeading: text(),
      ctaText: text(),
      ctaLabel: text(),
    }),
});

const ourVision = defineCollection({
  loader: glob(single('our-vision')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroLines: lines(),
      hero: heroSchema(image),
      sections: sectionsSchema(),
      ideasHeading: text(),
      ideas: prose(),
      creedHeading: text(),
      creed: titledItems(),
      closing: prose(),
    }),
});

const leadership = defineCollection({
  loader: glob(single('leadership')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroLines: lines(),
      hero: heroSchema(image),
      sections: sectionsSchema(),
      rolesHeading: text(),
      roles: list(z.object({ name: req(), description: prose() })),
      chart: gallerySchema(image),
    }),
});

const ministriesIndex = defineCollection({
  loader: glob(single('ministries')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroLines: lines(),
      hero: heroSchema(image),
      sections: sectionsSchema(),
      ministriesHeading: text(),
      ministriesIntro: prose(),
      orgChartHeading: text(),
      orgChart: gallerySchema(image),
    }),
});

const policies = defineCollection({
  loader: glob(single('policies')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroLines: lines(),
      hero: heroSchema(image),
      internalHeading: text(),
      internal: sectionsSchema(),
      externalHeading: text(),
      external: sectionsSchema(),
    }),
});

const orgChart = defineCollection({
  loader: glob(single('org-chart')),
  schema: z.object({
    version: text(),
    bodiesNote: text(),
    bodies: list(z.object({ name: req(), holder: text(), description: text(), duties: lines() })),
    branches: list(
      z.object({
        name: req(),
        short: text(),
        role: text(),
        holder: text(),
        tier: z.enum(['1', '2', '3']),
        description: text(),
        duties: lines(),
        offices: list(
          z.object({
            name: req(),
            note: text(),
            holder: text(),
            status: z.enum(['filled', 'open', 'wip', 'none']),
            description: text(),
          }),
        ),
      }),
    ),
  }),
});

const citizenship = defineCollection({
  loader: glob(single('citizenship')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroLines: lines(),
      hero: heroSchema(image),
      intro: prose(),
      rulesHeading: text(),
      rules: prose(),
      videoId: text(),
      videoTitle: text(),
      ctaHeading: text(),
      ctaLabel: text(),
    }),
});

const mediaNetwork = defineCollection({
  loader: glob(single('media-network')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroKicker: text(),
      heroLines: lines(),
      hero: heroSchema(image),
      railLabel: text(),
      railItems: lines(),
      statement: prose(),
      statementAside: text(),
      newsHeading: text(),
      videosHeading: text(),
      videosAside: text(),
      poolHeading: text(),
      poolAside: text(),
      time: text(),
      talent: text(),
      treasureInGame: text(),
      treasureOutOfGame: text(),
      noticeStatement: text(),
      noticeBody: prose(),
      closingHeading: text(),
      closingText: text(),
    }),
});

const citizenCompass = defineCollection({
  loader: glob(single('the-citizen-compass')),
  schema: ({ image }) =>
    z.object({
      ...seo,
      heroLines: lines(),
      hero: heroSchema(image),
      banner: text(),
      overviewHeading: text(),
      overview: prose(),
      siteUrl: url(),
      siteLabel: text(),
      contactHeading: text(),
      contactText: text(),
      contactEmail: text(),
    }),
});

const ministries = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/ministries' }),
  schema: ({ image }) =>
    z.object({
      title: req(),
      menuLabel: req(),
      fullName: req(),
      abbreviation: req(),
      summary: text(),
      mark: image().nullish(),
      order: z.number().int().nullish().transform((v) => v ?? 1),
      workInProgress: z.boolean().default(false),
      workInProgressNote: text(),
      hero: heroSchema(image),
      overview: prose(),
      officesHeading: text(),
      offices: list(z.object({ name: req(), body: prose() })),
      closing: prose(),
      gallery: gallerySchema(image),
    }),
});

const newsletters = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/newsletters' }),
  schema: ({ image }) =>
    z.object({
      title: req(),
      visible: z.boolean().default(true),
      quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
      year: z.number().int(),
      issueNumber: z.number().int().nullish(),
      published: z.coerce.date(),
      summary: text(),
      cover: heroSchema(image),
      intro: prose(),
      sections: list(
        z.object({
          heading: req(),
          kicker: text(),
          body: prose(),
          gallery: gallerySchema(image),
        }),
      ),
    }),
});

const newsUpdates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/news' }),
  schema: z.object({
    title: req(),
    kicker: text(),
    summary: text(),
    link: req(),
    order: z.number().int().nullish().transform((v) => v ?? 1),
    visible: z.boolean().default(true),
  }),
});

const updates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/updates' }),
  schema: ({ image }) =>
    z.object({
      title: req(),
      date: z.coerce.date(),
      summary: text(),
      link: url(),
      image: image().nullish(),
      alt: text(),
      visible: z.boolean().default(true),
    }),
});

const screenshots = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/screenshots' }),
  schema: ({ image }) =>
    z.object({
      title: req(),
      image: image(),
      alt: text(),
      caption: text(),
      credit: text(),
      creditStatus: creditStatus(),
      link: url(),
      visible: z.boolean().default(true),
    }),
});

const videos = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/videos' }),
  schema: ({ image }) =>
    z.object({
      title: req(),
      youtubeId: z.string().min(5),
      presenter: text(),
      month: z.coerce.date(),
      poster: image().nullish(),
      posterAlt: text(),
    }),
});

export const collections = {
  siteSettings,
  home,
  ourVision,
  leadership,
  ministriesIndex,
  policies,
  citizenship,
  orgChart,
  mediaNetwork,
  citizenCompass,
  ministries,
  newsletters,
  newsUpdates,
  updates,
  screenshots,
  videos,
};
