import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { getNewsletters, getSingleton, newsletterHref } from './content';

// Latest Updates on Home: the newest newsletter, then written updates from
// Keystatic, new videos from the YouTube channels and posts from the RSS feeds
// in Site settings, newest first. Also the screenshot pool for USC in the
// 'Verse on the Media Network page. Everything is fetched at build time; a
// daily rebuild picks up new videos and posts.
// A network failure never fails the build: that source is just left out.

export interface FeedItem {
  key: string;
  kind: 'update' | 'newsletter' | 'video' | 'post' | 'screenshot';
  /** In-universe date (real year + 930), like every date on the site. */
  date: Date;
  title: string;
  text: string;
  href?: string;
  external: boolean;
  source: string;
  image?: ImageMetadata;
  /** Remote picture (YouTube thumbnail or a linked page's og:image), downloaded at build time. */
  remoteImage?: string;
  alt: string;
  /** "In game image by USC-Citizen: NAME", for screenshots. */
  credit?: string;
}

/** Star Citizen's in-universe calendar runs 930 years ahead of ours (2026 is 2956). */
const IN_UNIVERSE_OFFSET = 930;
const toInUniverse = (d: Date) => {
  const out = new Date(d);
  out.setUTCFullYear(d.getUTCFullYear() + IN_UNIVERSE_OFFSET);
  return out;
};

/** Hosts whose pictures may be downloaded at build time (must match image.remotePatterns in astro.config.mjs). */
const IMAGE_HOSTS = [/^i\d?\.ytimg\.com$/, /\.cdninstagram\.com$/, /\.fbcdn\.net$/, /^pbs\.twimg\.com$/, /^www\.sc-hangarworks\.org$/, /^thecitizencompass\.com$/];
const allowedImage = (url: string) => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && IMAGE_HOSTS.some((re) => re.test(hostname));
  } catch {
    return false;
  }
};

const TIMEOUT = 10_000;
const UA = 'Mozilla/5.0 (compatible; USC-website-build)';

async function fetchText(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(TIMEOUT) });
    return res.ok ? await res.text() : undefined;
  } catch {
    return undefined;
  }
}

/** True if the picture can be downloaded now (a failed download inside <Image> would fail the build). */
async function reachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(TIMEOUT) });
    return res.ok;
  } catch {
    return false;
  }
}

const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** Text of the first <name> element, CDATA unwrapped. */
const tag = (xml: string, name: string) =>
  xml
    .match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`))?.[1]
    .replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1')
    .trim();

function platform(link: string): string {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    if (/(^|\.)youtube\.com$|^youtu\.be$/.test(host)) return 'YouTube';
    if (/(^|\.)instagram\.com$/.test(host)) return 'Instagram';
    if (/^(x|twitter)\.com$/.test(host)) return 'X';
    if (/(^|\.)discord\.(com|gg)$/.test(host)) return 'Discord';
    return host;
  } catch {
    return 'Link';
  }
}

function youtubeId(link: string): string | undefined {
  try {
    const u = new URL(link);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || undefined;
    if (u.hostname.endsWith('youtube.com')) return u.searchParams.get('v') ?? u.pathname.match(/\/(?:shorts|live|embed)\/([\w-]{6,})/)?.[1];
  } catch {
    // not a URL
  }
  return undefined;
}

/** Picture, title and description a page shares for link previews (Open Graph). */
async function linkPreview(link: string) {
  const html = await fetchText(link);
  if (!html) return {};
  const meta = (prop: string) => {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, 'i');
    const content = html.match(re)?.[0].match(/content=["']([^"']*)["']/i)?.[1];
    return content ? decode(content) : undefined;
  };
  return { title: meta('og:title'), text: meta('og:description'), image: meta('og:image') };
}

async function pictureFor(url: string | undefined): Promise<string | undefined> {
  if (!url || !allowedImage(url)) return undefined;
  return (await reachable(url)) ? url : undefined;
}

async function writtenUpdates(): Promise<FeedItem[]> {
  const entries = await getCollection('updates', (u) => u.data.visible);
  return Promise.all(
    entries.map(async (u): Promise<FeedItem> => {
      const d = u.data;
      const link = d.link || undefined;
      const ytId = link ? youtubeId(link) : undefined;
      const preview = link && !ytId && (!d.image || !d.summary) ? await linkPreview(link) : {};
      const remote = d.image ? undefined : ytId ? await pictureFor(`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`) : await pictureFor(preview.image);
      return {
        key: `update-${u.id}`,
        kind: 'update',
        date: d.date,
        title: d.title,
        text: d.summary || preview.text || '',
        href: link,
        external: !!link,
        source: link ? platform(link) : 'Update',
        image: d.image ?? undefined,
        remoteImage: remote,
        alt: d.alt,
      };
    }),
  );
}

async function newsletterItems(): Promise<FeedItem[]> {
  return (await getNewsletters()).map((n) => ({
    key: `newsletter-${n.id}`,
    kind: 'newsletter',
    date: n.data.published,
    title: n.data.title,
    text: n.data.summary,
    href: newsletterHref(n.id),
    external: false,
    source: 'Newsletter',
    image: n.data.cover.image,
    alt: n.data.cover.alt,
  }));
}

async function channelVideos(label: string, channelId: string, count: number): Promise<FeedItem[]> {
  const xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);
  if (!xml) return [];
  const entries = xml.split('<entry>').slice(1, count + 1);
  const items = await Promise.all(
    entries.map(async (entry): Promise<FeedItem | undefined> => {
      const id = tag(entry, 'yt:videoId');
      const published = tag(entry, 'published');
      const title = tag(entry, 'title');
      if (!id || !published || !title) return undefined;
      return {
        key: `video-${id}`,
        kind: 'video',
        date: toInUniverse(new Date(published)),
        title: decode(title),
        text: '',
        href: `https://www.youtube.com/watch?v=${id}`,
        external: true,
        source: `YouTube · ${label}`,
        remoteImage: await pictureFor(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`),
        alt: '',
      };
    }),
  );
  return items.filter((i): i is FeedItem => !!i);
}

/** The newest posts from an RSS feed, optionally only those in one <category>. */
async function feedPosts(label: string, rssUrl: string, category: string, count: number): Promise<FeedItem[]> {
  const xml = await fetchText(rssUrl);
  if (!xml) return [];
  const wanted = category.trim().toLowerCase();
  const inCategory = (item: string) =>
    [...item.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/g)].some(
      (m) => decode(m[1].replace(/<!\[CDATA\[|\]\]>/g, '')).trim().toLowerCase() === wanted,
    );
  const entries = xml
    .split(/<item[\s>]/)
    .slice(1)
    .filter((item) => !wanted || inCategory(item))
    .slice(0, Math.max(0, count));
  const items = await Promise.all(
    entries.map(async (item): Promise<FeedItem | undefined> => {
      const link = tag(item, 'link');
      const title = tag(item, 'title');
      const published = tag(item, 'pubDate');
      if (!link || !title || !published || Number.isNaN(Date.parse(published))) return undefined;
      const preview = await linkPreview(link);
      return {
        key: `post-${link}`,
        kind: 'post',
        date: toInUniverse(new Date(published)),
        title: decode(title),
        // WordPress adds "The post X appeared first on Y." to every description.
        text: decode((tag(item, 'description') ?? '').replace(/<[^>]+>/g, ' '))
          .replace(/The post .* appeared first on .*$/s, '')
          .replace(/\s+/g, ' ')
          .trim(),
        href: link,
        external: true,
        source: label,
        remoteImage: await pictureFor(preview.image),
        alt: '',
      };
    }),
  );
  return items.filter((i): i is FeedItem => !!i);
}

/** Every screenshot in the pool (USC in the 'Verse picks from these on page load). */
export async function getScreenshots(): Promise<FeedItem[]> {
  const pool = (await getCollection('screenshots', (s) => s.data.visible)).sort((a, b) => a.id.localeCompare(b.id));
  return pool.map((s) => {
    const d = s.data;
    return {
      key: `screenshot-${s.id}`,
      kind: 'screenshot',
      date: new Date(0),
      title: d.caption,
      text: '',
      href: d.link || undefined,
      external: /^https?:/.test(d.link),
      source: 'Screenshot',
      image: d.image,
      alt: d.alt,
      credit: d.credit ? `In game image by USC-${d.creditStatus}: ${d.credit}` : undefined,
    };
  });
}

let cached: Promise<FeedItem[]> | undefined;

/**
 * Latest Updates: the newest newsletter first, then written updates, videos
 * from the channels shown on Home and posts from the RSS feeds, newest first,
 * cut to the length set in Site settings. The component adds the closing
 * "More at Media Network" card.
 */
export function getFeed(): Promise<FeedItem[]> {
  cached ??= (async () => {
    const settings = await getSingleton('siteSettings');
    const [newsletters, ...rest] = await Promise.all([
      newsletterItems(),
      writtenUpdates(),
      ...settings.feedChannels.filter((c) => c.show).map((c) => channelVideos(c.label, c.channelId, settings.feedVideosPerChannel)),
      ...settings.creatorFeeds.map((f) => feedPosts(f.label, f.rssUrl, f.category, f.count)),
    ]);
    const seen = new Set<string>();
    const middle = rest
      .flat()
      .filter((i) => (seen.has(i.key) ? false : (seen.add(i.key), true)))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, settings.feedLength);
    return [...newsletters.slice(0, 1), ...middle];
  })();
  return cached;
}
