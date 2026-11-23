import { getMinistries, getNewsletters, getSingleton, ministryHref, newsletterHref } from './content';
import type { Channel, SiteNav, SiteSettings } from './types';

let cached: Promise<{ settings: SiteSettings; nav: SiteNav }> | undefined;

/** Site-wide settings and menu, built from Keystatic content. */
export function getSite() {
  cached ??= load();
  return cached;
}

async function load(): Promise<{ settings: SiteSettings; nav: SiteNav }> {
  const s = await getSingleton('siteSettings');
  const channelList: [string, string][] = [
    ['YouTube', s.youtube],
    ['Instagram', s.instagram],
    ['X / Twitter', s.x],
    ['Patreon', s.patreon],
    ['Swag Store', s.swagStore],
    ['Galactic Senate', s.galacticSenate],
  ];
  const channels: Channel[] = channelList.filter(([, href]) => href).map(([label, href]) => ({ label, href }));
  const settings: SiteSettings = {
    applicationUrl: s.applicationUrl,
    contactEmail: s.contactEmail,
    tagline: s.tagline,
    footerText: s.footerText,
    channels,
  };

  const ministries = await getMinistries();
  const newsletters = await getNewsletters();
  const nav: SiteNav = {
    pages: [
      { href: '/home', label: 'Home' },
      { href: '/our-vision', label: 'Our Vision' },
      { href: '/leadership', label: 'Leadership' },
      { href: '/ministries', label: 'Ministries' },
      { href: '/policies', label: 'Policies' },
      { href: '/citizenship', label: 'Citizenship' },
      { href: '/media-network', label: 'Media Network' },
    ],
    ministries: ministries.map((m) => ({
      href: ministryHref(m.id),
      label: m.data.menuLabel,
      abbreviation: m.data.abbreviation,
      mark: m.data.mark ?? undefined,
    })),
    media: [
      { href: '/media-network/the-citizen-compass', label: 'The Citizen Compass' },
      ...newsletters.map((n) => ({ href: newsletterHref(n.id), label: n.data.title })),
    ],
  };
  return { settings, nav };
}
