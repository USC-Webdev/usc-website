import { config, collection, singleton, fields } from '@keystatic/core';

// Content model (build plan section 9). Every schema here has a mirror in
// src/content.config.ts; change both together.
//
// All entries are YAML files one folder below src/content/, so image fields
// store paths relative to the entry ("../../assets/images/<folder>/...") and
// Astro's image() helper can optimize them at build.

const imageField = (folder: string, label: string) => ({
  label,
  directory: `src/assets/images/${folder}`,
  publicPath: `../../assets/images/${folder}/`,
});
const img = (folder: string, label = 'Image') => fields.image({ ...imageField(folder, label), validation: { isRequired: true } });
const optionalImg = (folder: string, label: string) => fields.image(imageField(folder, label));

const alt = () =>
  fields.text({
    label: 'Alt text',
    description: 'Describe what the image shows for people who cannot see it. Optional but recommended; leave empty only for decorative images.',
  });

const credit = () =>
  fields.text({
    label: 'Image credit (name)',
    description: 'Shown as "In game image by USC-Citizen: NAME" (or USC-Resident). Leave empty if not an in-game image.',
  });

const creditStatus = () =>
  fields.select({
    label: 'Credit status',
    description: 'Resident is the pre-citizen term.',
    options: [
      { label: 'Citizen', value: 'Citizen' },
      { label: 'Resident', value: 'Resident' },
    ],
    defaultValue: 'Citizen',
  });

const prose = (label: string, description?: string) =>
  fields.markdoc.inline({
    label,
    description,
    options: { image: false, codeBlock: false, code: false, heading: [3, 4] },
  });

const hero = (folder: string) =>
  fields.object(
    {
      image: img(folder, 'Hero image'),
      alt: alt(),
      credit: credit(),
      creditStatus: creditStatus(),
    },
    { label: 'Hero image' },
  );

const gallery = (folder: string, label = 'Gallery') =>
  fields.array(
    fields.object({
      image: img(folder),
      alt: alt(),
      caption: fields.text({ label: 'Caption' }),
      credit: credit(),
      creditStatus: creditStatus(),
    }),
    { label, itemLabel: (props) => props.fields.caption.value || props.fields.alt.value || 'Image' },
  );

const seo = {
  title: fields.text({ label: 'Page title', validation: { length: { min: 1 } } }),
  description: fields.text({ label: 'Search description', multiline: true }),
};

const sections = (label = 'Sections') =>
  fields.array(
    fields.object({
      heading: fields.text({ label: 'Heading', validation: { length: { min: 1 } } }),
      railLabel: fields.text({ label: 'Rail label', description: 'Short label in the left rail. Optional.' }),
      body: prose('Body'),
    }),
    { label, itemLabel: (props) => props.fields.heading.value || 'Section' },
  );

const titledItems = (label: string) =>
  fields.array(
    fields.object({
      title: fields.text({ label: 'Title', validation: { length: { min: 1 } } }),
      text: fields.text({ label: 'Text', multiline: true }),
    }),
    { label, itemLabel: (props) => props.fields.title.value || 'Item' },
  );

const page = (name: string) => `src/content/pages/${name}`;

// Set PUBLIC_KEYSTATIC_LOCAL=true when running `npm run dev` to edit the files
// on disk instead of GitHub (useful for testing schema changes).
const useLocal = import.meta.env.PUBLIC_KEYSTATIC_LOCAL === 'true';

export default config({
  storage: useLocal
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: 'USC-Webdev/usc-website',
        branchPrefix: 'content/',
      },
  ui: {
    brand: { name: 'USC' },
    navigation: {
      'Media Network': ['updates', 'screenshots','newsletters', 'newsUpdates', 'videos', 'mediaNetwork', 'citizenCompass'],
      Pages: ['home', 'ourVision', 'leadership', 'policies', 'citizenship', 'ministriesIndex', 'orgChart', 'ministries'],
      Settings: ['siteSettings'],
    },
  },
  singletons: {
    siteSettings: singleton({
      label: 'Site settings',
      path: 'src/content/settings/site',
      format: { data: 'yaml' },
      schema: {
        applicationUrl: fields.url({ label: 'Application form URL', validation: { isRequired: true } }),
        contactEmail: fields.text({ label: 'Contact email (Consul of Peace)', validation: { length: { min: 3 } } }),
        tagline: fields.text({ label: 'Tagline', defaultValue: 'EQUALITY.PROSPERITY.FREEDOM' }),
        footerText: fields.text({ label: 'Footer text', multiline: true }),
        youtube: fields.url({ label: 'YouTube channel' }),
        instagram: fields.url({ label: 'Instagram' }),
        x: fields.url({ label: 'X / Twitter' }),
        patreon: fields.url({ label: 'Patreon' }),
        swagStore: fields.url({ label: 'Swag Store' }),
        galacticSenate: fields.url({ label: 'Galactic Senate' }),
        affiliates: fields.array(
          fields.object({
            label: fields.text({ label: 'Link text', validation: { length: { min: 1 } } }),
            href: fields.url({ label: 'Address', validation: { isRequired: true } }),
          }),
          { label: 'Affiliates (footer)', itemLabel: (p) => p.fields.label.value || 'Affiliate' },
        ),
        feedChannels: fields.array(
          fields.object({
            label: fields.text({ label: 'Channel name', validation: { length: { min: 1 } } }),
            channelId: fields.text({
              label: 'YouTube channel ID',
              description: 'Starts with UC. On the channel page: More (the "…more" link under the name) → Share channel → Copy channel ID.',
              validation: { length: { min: 10 } },
            }),
            show: fields.checkbox({ label: 'Show in Latest Updates', defaultValue: true }),
          }),
          {
            label: 'Latest updates: YouTube channels',
            description: 'New videos from these channels appear in the Latest Updates carousel on Home. The site checks once a day.',
            itemLabel: (p) => `${p.fields.label.value || 'Channel'}${p.fields.show.value ? '' : ' (hidden)'}`,
          },
        ),
        feedVideosPerChannel: fields.integer({ label: 'Latest updates: videos per channel', defaultValue: 3 }),
        creatorFeeds: fields.array(
          fields.object({
            label: fields.text({ label: 'Name', validation: { length: { min: 1 } } }),
            rssUrl: fields.url({ label: 'RSS feed address', validation: { isRequired: true } }),
            category: fields.text({ label: 'Only this category (optional)', description: 'For example "Patch notes". Leave empty for every post.' }),
            count: fields.integer({ label: 'Posts shown', defaultValue: 2 }),
          }),
          {
            label: 'Latest updates: blogs and news feeds',
            description: 'The newest posts from these RSS feeds appear in the Latest Updates carousel on Home. Pictures come from each post\'s link preview, and only from hosts the webdev team has allowed.',
            itemLabel: (p) => p.fields.label.value || 'Feed',
          },
        ),
        feedLength: fields.integer({
          label: 'Latest updates: items shown',
          description: 'Between the newest newsletter (always first) and the "More at Media Network" card (always last).',
          defaultValue: 6,
        }),
      },
    }),

    home: singleton({
      label: 'Home',
      path: page('home'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroKicker: fields.text({ label: 'Hero small line' }),
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/home'),
        introHeading: fields.text({ label: 'Intro heading' }),
        intro: prose('Intro'),
        philosophyHeading: fields.text({ label: 'Philosophy heading' }),
        philosophy: titledItems('Philosophy items'),
        community: sections('Community sections'),
        updatesHeading: fields.text({ label: 'Latest updates heading', defaultValue: 'Latest Updates' }),
        updatesIntro: fields.text({ label: 'Latest updates text', description: 'One line under the heading. Optional.', multiline: true }),
        ctaHeading: fields.text({ label: 'Closing heading' }),
        ctaText: fields.text({ label: 'Closing text', multiline: true }),
        ctaLabel: fields.text({ label: 'Apply button label', defaultValue: 'Apply for citizenship' }),
      },
    }),

    ourVision: singleton({
      label: 'Our Vision',
      path: page('our-vision'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/our-vision'),
        sections: sections(),
        ideasHeading: fields.text({ label: 'Ideas heading' }),
        ideas: prose('Ideas'),
        creedHeading: fields.text({ label: 'Creed heading' }),
        creed: titledItems('Creed items'),
        closing: prose('Closing text'),
      },
    }),

    leadership: singleton({
      label: 'Leadership',
      path: page('leadership'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/leadership'),
        sections: sections(),
        rolesHeading: fields.text({ label: 'Roles heading' }),
        roles: fields.array(
          fields.object({
            name: fields.text({ label: 'Role', validation: { length: { min: 1 } } }),
            description: prose('Description'),
          }),
          { label: 'Roles', itemLabel: (p) => p.fields.name.value || 'Role' },
        ),
        chart: gallery('pages', 'Structure images'),
      },
    }),

    ministriesIndex: singleton({
      label: 'Ministries (index page)',
      path: page('ministries'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/ministries'),
        sections: sections(),
        ministriesHeading: fields.text({ label: 'Ministries heading' }),
        ministriesIntro: prose('Ministries intro'),
        orgChartHeading: fields.text({ label: 'Org chart heading' }),
        orgChart: gallery('pages/ministries', 'Org chart image'),
      },
    }),

    policies: singleton({
      label: 'Policies',
      path: page('policies'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/policies'),
        internalHeading: fields.text({ label: 'Internal policies heading' }),
        internal: sections('Internal policies'),
        externalHeading: fields.text({ label: 'External policies heading' }),
        external: sections('External policies'),
      },
    }),

    orgChart: singleton({
      label: 'Organization chart (interactive)',
      path: page('org-chart'),
      format: { data: 'yaml' },
      schema: {
        version: fields.text({ label: 'Version line', defaultValue: 'USC organization chart v4 · January 2955' }),
        bodiesNote: fields.text({ label: 'Note under the governing bodies', multiline: true }),
        bodies: fields.array(
          fields.object({
            name: fields.text({ label: 'Name', validation: { length: { min: 1 } } }),
            holder: fields.text({ label: 'Who sits in it' }),
            description: fields.text({ label: 'Description', multiline: true }),
            duties: fields.array(fields.text({ label: 'Duty' }), { label: 'Duties', itemLabel: (p) => p.value }),
          }),
          { label: 'Governing bodies', itemLabel: (p) => p.fields.name.value || 'Body' },
        ),
        branches: fields.array(
          fields.object({
            name: fields.text({ label: 'Name', validation: { length: { min: 1 } } }),
            short: fields.text({ label: 'Short name', description: 'Shown in the branch list.' }),
            role: fields.text({ label: 'Title of the post', description: 'e.g. Consul of Peace' }),
            holder: fields.text({ label: 'Holder', description: 'Leave empty if the post is open.' }),
            tier: fields.select({
              label: 'Tier',
              options: [
                { label: 'Tier I · Support', value: '1' },
                { label: 'Tier II · Sandbox content', value: '2' },
                { label: 'Tier III · Progression', value: '3' },
              ],
              defaultValue: '2',
            }),
            description: fields.text({ label: 'Description', multiline: true }),
            duties: fields.array(fields.text({ label: 'Duty' }), { label: 'Duties', itemLabel: (p) => p.value }),
            offices: fields.array(
              fields.object({
                name: fields.text({ label: 'Name', validation: { length: { min: 1 } } }),
                note: fields.text({ label: 'Short note', description: 'e.g. Discord admin' }),
                holder: fields.text({ label: 'Holder' }),
                status: fields.select({
                  label: 'Status',
                  options: [
                    { label: 'Filled', value: 'filled' },
                    { label: 'Open', value: 'open' },
                    { label: 'In development', value: 'wip' },
                    { label: 'Not listed', value: 'none' },
                  ],
                  defaultValue: 'open',
                }),
                description: fields.text({ label: 'Description', multiline: true }),
              }),
              { label: 'Offices and departments', itemLabel: (p) => p.fields.name.value || 'Office' },
            ),
          }),
          { label: 'Cabinet branches', itemLabel: (p) => p.fields.name.value || 'Branch' },
        ),
      },
    }),

    citizenship: singleton({
      label: 'Citizenship',
      path: page('citizenship'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/citizenship'),
        intro: prose('Intro'),
        rulesHeading: fields.text({ label: 'Rules heading' }),
        rules: prose('Rules'),
        videoId: fields.text({ label: 'YouTube video ID', description: 'The part after v= in the YouTube link.' }),
        videoTitle: fields.text({ label: 'Video title' }),
        ctaHeading: fields.text({ label: 'Call to action heading' }),
        ctaLabel: fields.text({ label: 'Apply button label', defaultValue: 'Join the USC' }),
      },
    }),

    mediaNetwork: singleton({
      label: 'Media Network page',
      path: page('media-network'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroKicker: fields.text({ label: 'Hero small line', defaultValue: 'Confederation' }),
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/media-network'),
        railLabel: fields.text({ label: 'Rail label', defaultValue: 'CMN  |  USC' }),
        railItems: fields.array(fields.text({ label: 'Item' }), { label: 'Rail items', itemLabel: (p) => p.value }),
        statement: prose('Statement', 'Large display text. Bold words are shown heavier.'),
        statementAside: fields.text({ label: 'Statement aside', multiline: true }),
        verseHeading: fields.text({ label: 'Screenshot carousel heading', defaultValue: "USC in the 'Verse" }),
        verseCount: fields.integer({
          label: 'Screenshot carousel: screenshots shown',
          description: 'Picked at random from the Screenshot pool each time the page loads.',
          defaultValue: 10,
        }),
        newsHeading: fields.text({ label: 'News heading', defaultValue: 'Notable News Updates' }),
        videosHeading: fields.text({ label: 'Videos heading', defaultValue: 'Videos of the Month' }),
        videosAside: fields.text({ label: 'Videos aside' }),
        poolHeading: fields.text({ label: 'Donation pool heading', defaultValue: 'USC Donation Pool' }),
        poolAside: fields.text({ label: 'Donation pool aside', multiline: true }),
        time: fields.text({ label: 'Time', multiline: true }),
        talent: fields.text({ label: 'Talent', multiline: true }),
        treasureInGame: fields.text({ label: 'Treasure: in game', multiline: true }),
        treasureOutOfGame: fields.text({ label: 'Treasure: out of game', multiline: true }),
        noticeStatement: fields.text({ label: 'Notice statement', defaultValue: 'Membership never requires payment.' }),
        noticeBody: prose('Notice body'),
        closingHeading: fields.text({ label: 'Closing heading' }),
        closingText: fields.text({ label: 'Closing text', multiline: true }),
      },
    }),

    citizenCompass: singleton({
      label: 'The Citizen Compass page',
      path: page('the-citizen-compass'),
      format: { data: 'yaml' },
      schema: {
        ...seo,
        heroLines: fields.array(fields.text({ label: 'Line' }), { label: 'Hero title lines', itemLabel: (p) => p.value }),
        hero: hero('pages/the-citizen-compass'),
        banner: fields.text({ label: 'Banner line' }),
        overviewHeading: fields.text({ label: 'Overview heading' }),
        overview: prose('Overview'),
        siteUrl: fields.url({ label: 'Citizen Compass site URL' }),
        siteLabel: fields.text({ label: 'Site button label', defaultValue: 'Visit The Citizen Compass' }),
        contactHeading: fields.text({ label: 'Contact heading', defaultValue: 'Contact' }),
        contactText: fields.text({ label: 'Contact text', multiline: true }),
        contactEmail: fields.text({ label: 'Contact email' }),
      },
    }),
  },

  collections: {
    ministries: collection({
      label: 'Ministries',
      path: 'src/content/ministries/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { length: { min: 1 } } },
          slug: { label: 'URL slug', description: 'Part of the page address, e.g. security for /ministries/security.' },
        }),
        menuLabel: fields.text({ label: 'Menu label', validation: { length: { min: 1 } } }),
        fullName: fields.text({ label: 'Full name', validation: { length: { min: 1 } } }),
        abbreviation: fields.text({ label: 'Abbreviation', validation: { length: { min: 1 } } }),
        summary: fields.text({ label: 'One-line summary', multiline: true }),
        mark: optionalImg('ministries', 'Ministry mark'),
        order: fields.integer({ label: 'Order', defaultValue: 1 }),
        workInProgress: fields.checkbox({ label: 'Work in progress', defaultValue: true }),
        workInProgressNote: fields.text({
          label: 'Work in progress note',
          defaultValue: 'More information will be posted as the game develops.',
        }),
        hero: hero('ministries'),
        overview: prose('Overview'),
        officesHeading: fields.text({ label: 'Offices heading' }),
        offices: fields.array(
          fields.object({
            name: fields.text({ label: 'Name', validation: { length: { min: 1 } } }),
            body: prose('Body'),
          }),
          { label: 'Offices', itemLabel: (p) => p.fields.name.value || 'Office' },
        ),
        closing: prose('Closing text'),
        gallery: gallery('ministries'),
      },
    }),

    newsletters: collection({
      label: 'Newsletters',
      path: 'src/content/newsletters/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['title', 'published', 'visible'],
      schema: {
        title: fields.slug({
          name: { label: 'Title', description: 'For example: Newsletter Q3 2956', validation: { length: { min: 1 } } },
          slug: { label: 'URL slug', description: 'For example: newsletter-q3-2956' },
        }),
        visible: fields.checkbox({
          label: 'Published on the site',
          description: 'Untick to keep this issue as a draft: it is saved but does not appear anywhere on the site. Tick it and save to publish.',
          defaultValue: true,
        }),
        quarter: fields.select({
          label: 'Quarter',
          options: [
            { label: 'Q1', value: 'Q1' },
            { label: 'Q2', value: 'Q2' },
            { label: 'Q3', value: 'Q3' },
            { label: 'Q4', value: 'Q4' },
          ],
          defaultValue: 'Q1',
        }),
        year: fields.integer({ label: 'Year (in-universe)', validation: { isRequired: true } }),
        issueNumber: fields.integer({ label: 'Issue number' }),
        published: fields.date({ label: 'Published date', validation: { isRequired: true } }),
        summary: fields.text({ label: 'One-line summary', multiline: true }),
        cover: hero('newsletters'),
        intro: prose('Intro'),
        sections: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading', validation: { length: { min: 1 } } }),
            kicker: fields.text({ label: 'Kicker', description: 'Small line above the heading, e.g. "Desk of the Consul of War". Optional.' }),
            body: prose('Body'),
            gallery: gallery('newsletters'),
          }),
          { label: 'Sections', itemLabel: (p) => p.fields.heading.value || 'Section' },
        ),
      },
    }),

    newsUpdates: collection({
      label: 'News updates',
      path: 'src/content/news/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { length: { min: 1 } } } }),
        kicker: fields.text({ label: 'Kicker' }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        link: fields.text({
          label: 'Link',
          description: 'A page on this site (e.g. /media-network/the-citizen-compass) or a full https:// address.',
          validation: { length: { min: 1 } },
        }),
        order: fields.integer({ label: 'Order', defaultValue: 1 }),
        visible: fields.checkbox({ label: 'Visible', defaultValue: true }),
      },
    }),

    updates: collection({
      label: 'Latest updates',
      path: 'src/content/updates/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['title', 'date', 'visible'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { length: { min: 1 } } } }),
        date: fields.date({ label: 'Date (in-universe)', description: 'For example 2956-11-24. Newest first in the feed.', validation: { isRequired: true } }),
        summary: fields.text({ label: 'Short text', multiline: true, description: 'One or two sentences. Leave empty on a link to use the linked page\'s own description.' }),
        link: fields.url({
          label: 'Link',
          description: 'Optional. An Instagram or X post, a YouTube video, a Discord event or any page. Without an image below, the site uses the linked page\'s own picture.',
        }),
        image: optionalImg('updates', 'Image (optional)'),
        alt: alt(),
        visible: fields.checkbox({ label: 'Published on the site', defaultValue: true }),
      },
    }),

    screenshots: collection({
      label: 'Screenshot pool',
      path: 'src/content/screenshots/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['title', 'credit', 'visible'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Name',
            description: 'For finding it here, for example "Idris over Nyx". Not shown on the site.',
            validation: { length: { min: 1 } },
          },
        }),
        image: img('screenshots', 'Screenshot'),
        alt: alt(),
        caption: fields.text({ label: 'Caption (optional)', description: 'Shown on the card under the picture.' }),
        credit: credit(),
        creditStatus: creditStatus(),
        link: fields.url({ label: 'Link (optional)', description: 'For example the newsletter the screenshot appeared in.' }),
        visible: fields.checkbox({ label: 'In the pool', description: 'Untick to take it out of rotation without deleting it.', defaultValue: true }),
      },
    }),

    videos: collection({
      label: 'Videos',
      path: 'src/content/videos/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['title', 'month'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { length: { min: 1 } } } }),
        youtubeId: fields.text({ label: 'YouTube video ID', description: 'The part after v= in the YouTube link.', validation: { length: { min: 5 } } }),
        presenter: fields.text({ label: 'Presenter line' }),
        month: fields.date({ label: 'Month', validation: { isRequired: true } }),
        poster: optionalImg('videos', 'Poster image (optional: leave empty to use the YouTube thumbnail)'),
        posterAlt: fields.text({ label: 'Poster alt text', description: 'Optional but recommended.' }),
      },
    }),
  },
});
