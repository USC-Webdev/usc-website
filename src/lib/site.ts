import type { SiteNav, SiteSettings } from './types';

// Phase 2: static defaults so the design system can be built before the
// content model. Phase 3 replaces these with Keystatic content.
export async function getSite(): Promise<{ settings: SiteSettings; nav: SiteNav }> {
  const settings: SiteSettings = {
    applicationUrl: 'https://forms.gle/zfYYm6SCNMQfhEMWA',
    contactEmail: 'consulofpeace@unitedspaceconfederation.org',
    tagline: 'EQUALITY.PROSPERITY.FREEDOM',
    footerText: '',
    channels: [
      { label: 'YouTube', href: 'https://www.youtube.com/channel/UCR7NViQANVRSMB84wMFCS-A' },
      { label: 'Instagram', href: 'https://www.instagram.com/theunitedspaceconfederation' },
      { label: 'X / Twitter', href: 'https://twitter.com/usc_starcitizen' },
      { label: 'Patreon', href: 'https://www.patreon.com/UnitedSpaceConfederation' },
      { label: 'Swag Store', href: 'https://www.redbubble.com/people/LandscaperUSC/explore' },
      { label: 'Galactic Senate', href: 'https://robertsspaceindustries.com/orgs/SENATE' },
    ],
  };
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
    ministries: [
      { href: '/ministries/usc-navy', label: 'USC Navy', abbreviation: 'NAVY' },
      { href: '/ministries/security', label: 'Security', abbreviation: 'MSS' },
      { href: '/ministries/exploration', label: 'Exploration', abbreviation: 'MIE' },
      { href: '/ministries/commerce', label: 'Commerce', abbreviation: 'MIC' },
      { href: '/ministries/engineering', label: 'Engineering', abbreviation: 'MES' },
      { href: '/ministries/state-affairs', label: 'State Affairs', abbreviation: 'MSA' },
    ],
    media: [
      { href: '/media-network/the-citizen-compass', label: 'The Citizen Compass' },
      { href: '/media-network/newsletter-q3-2956', label: 'Newsletter Q3 2956' },
    ],
  };
  return { settings, nav };
}
