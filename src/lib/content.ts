import { getCollection, type CollectionKey, type CollectionEntry } from 'astro:content';

type SingletonKey = Extract<
  CollectionKey,
  | 'siteSettings'
  | 'home'
  | 'ourVision'
  | 'leadership'
  | 'ministriesIndex'
  | 'policies'
  | 'citizenship'
  | 'mediaNetwork'
  | 'citizenCompass'
>;

/** Returns the data of a Keystatic singleton. Fails the build if it is missing. */
export async function getSingleton<K extends SingletonKey>(key: K): Promise<CollectionEntry<K>['data']> {
  const entries = await getCollection(key);
  if (entries.length !== 1) {
    throw new Error(`Expected exactly one "${key}" entry, found ${entries.length}.`);
  }
  return entries[0]!.data;
}

const quarterIndex = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 } as const;

/** Newsletters, newest first (by in-universe year and quarter). */
export async function getNewsletters() {
  const all = await getCollection('newsletters');
  return all.sort((a, b) => b.data.year - a.data.year || quarterIndex[b.data.quarter] - quarterIndex[a.data.quarter]);
}

/** Ministries in menu order. */
export async function getMinistries() {
  const all = await getCollection('ministries');
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export const newsletterHref = (id: string) => `/media-network/${id}`;
export const ministryHref = (id: string) => `/ministries/${id}`;

/** Formats a date as DD.MM.YYYY (copy rule). */
export function formatDate(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${date.getUTCFullYear()}`;
}
