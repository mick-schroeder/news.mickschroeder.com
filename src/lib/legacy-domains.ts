const LEGACY_HOST_LISTS: Record<string, string> = {
  'news.mickschroeder.com': 'curated-news',
  'drudge.mickschroeder.com': 'drudge-report-sources',
  'drudgeshuffle.mickschroeder.com': 'drudge-report-sources',
  'drudge-shuffle.mickschroeder.com': 'drudge-report-sources',
};

export const getLegacyListForHostname = (hostname: string): string | null => {
  const normalized = hostname.toLowerCase().replace(/^www\./, '');
  return LEGACY_HOST_LISTS[normalized] || null;
};

export const buildCanonicalWebShuffleUrl = (currentHref: string, listId: string): string => {
  const canonicalBase = process.env.GATSBY_SITE_URL || 'https://webshuffle.mickschroeder.com';
  const current = new URL(currentHref);
  const target = new URL(current.pathname || '/', canonicalBase);

  target.hash = current.hash;
  current.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  target.searchParams.set('lists', listId);

  return target.toString();
};
