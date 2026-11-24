import type { ImageMetadata } from 'astro';

export interface NavLink {
  href: string;
  label: string;
}

export interface MinistryNavLink extends NavLink {
  mark?: ImageMetadata;
  abbreviation: string;
}

export interface SiteNav {
  pages: NavLink[];
  ministries: MinistryNavLink[];
  media: NavLink[];
}

export interface Channel {
  label: string;
  href: string;
}

export interface SiteSettings {
  applicationUrl: string;
  contactEmail: string;
  tagline: string;
  footerText: string;
  channels: Channel[];
}

export interface HeroImage {
  src?: ImageMetadata;
  alt: string;
  credit?: string;
  creditStatus?: 'Citizen' | 'Resident';
}
