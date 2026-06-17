import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseHtml } from 'node-html-parser';
import { parse as parseDomain } from 'tldts-experimental';

const PRESERVE_HOSTS = new Set([
  'abcnews.go.com',
  'asia.nikkei.com',
  'en.people.cn',
  'english.elpais.com',
  'english.kyodonews.net',
  'english.yonhapnews.co.kr',
  'finance.yahoo.com',
  'news.google.com',
  'trends.google.com',
]);

const normalizeHostname = (hostname) => hostname.toLowerCase().replace(/^www\./, '');

export const toAbsoluteUrl = (rawUrl, baseUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  try {
    return new URL(rawUrl.trim(), baseUrl);
  } catch {
    return null;
  }
};

export const isHttpUrl = (url) => url?.protocol === 'http:' || url?.protocol === 'https:';

export const canonicalKeyForUrl = (rawUrl, options = {}) => {
  const url = rawUrl instanceof URL ? rawUrl : toAbsoluteUrl(rawUrl);
  if (!url || !isHttpUrl(url)) return '';

  const hostname = normalizeHostname(url.hostname);
  const parsed = parseDomain(hostname);
  const shouldPreserveHost = options.preserveHost || PRESERVE_HOSTS.has(hostname);
  const hostKey = shouldPreserveHost ? hostname : parsed.domain || hostname;
  const normalizedPath = url.pathname.replace(/\/+/g, '/').replace(/\/$/, '');

  if (options.preservePath && normalizedPath) {
    return `${hostKey}${normalizedPath}`;
  }

  return hostKey;
};

export const sourceIdForCanonicalKey = (canonicalKey) => {
  const id = String(canonicalKey || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return id || 'source';
};

export const sourceUrlForCanonicalKey = (canonicalKey) => {
  const [host, ...pathParts] = String(canonicalKey).split('/');
  const pathname = pathParts.join('/');
  return `https://${host}/${pathname ? `${pathname.replace(/^\/+/, '')}` : ''}`;
};

export const displayNameForCanonicalKey = (canonicalKey) => String(canonicalKey).split('/')[0];

export const uniqueSorted = (values) =>
  Array.from(new Set((values || []).filter(Boolean).map(String))).sort((a, b) =>
    a.localeCompare(b)
  );

export const loadIgnoreRules = async (ignoreFile) => {
  const content = await fs.readFile(ignoreFile, 'utf8');
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  const schemePrefixes = [];
  const urlPrefixes = [];
  const domains = new Set();

  for (const line of lines) {
    const normalized = line.toLowerCase();
    if (normalized.endsWith(':') && !normalized.includes('/')) {
      schemePrefixes.push(normalized);
      continue;
    }

    const url = toAbsoluteUrl(normalized);
    if (!url || !isHttpUrl(url)) continue;
    urlPrefixes.push(url.toString().toLowerCase());
    domains.add(canonicalKeyForUrl(url));
  }

  return { schemePrefixes, urlPrefixes, domains };
};

export const shouldIgnoreUrl = (url, ignoreRules, internalKeys = new Set()) => {
  if (!url || !isHttpUrl(url)) return true;
  const raw = url.toString().toLowerCase();
  if (ignoreRules.schemePrefixes.some((prefix) => raw.startsWith(prefix))) return true;
  if (ignoreRules.urlPrefixes.some((prefix) => raw.startsWith(prefix))) return true;

  const canonicalKey = canonicalKeyForUrl(url);
  return (
    !canonicalKey ||
    ignoreRules.domains.has(canonicalKey) ||
    internalKeys.has(canonicalKey) ||
    internalKeys.has(normalizeHostname(url.hostname))
  );
};

const textContent = (node) => node?.textContent?.replace(/\s+/g, ' ').trim() || '';

const createInternalKeys = (scraper) =>
  new Set(
    (scraper.internalUrls || [scraper.url])
      .map((entry) => canonicalKeyForUrl(entry))
      .filter(Boolean)
  );

const addCandidate = (candidates, url, ignoreRules, internalKeys, name) => {
  if (shouldIgnoreUrl(url, ignoreRules, internalKeys)) return false;

  const canonicalKey = canonicalKeyForUrl(url);
  if (!canonicalKey) return false;
  if (candidates.has(canonicalKey)) return true;

  candidates.set(canonicalKey, {
    canonicalKey,
    name: name || displayNameForCanonicalKey(canonicalKey),
    url: sourceUrlForCanonicalKey(canonicalKey),
  });

  return true;
};

const addPinnedSources = (candidates, scraper) => {
  for (const pinned of scraper.pinnedSources || []) {
    candidates.set(pinned.canonicalKey, pinned);
  }
};

const limitCandidates = (candidates, maxCandidates) => {
  if (!Number.isInteger(maxCandidates) || maxCandidates < 0) return candidates;
  return new Map(Array.from(candidates).slice(0, maxCandidates));
};

const extractOpmlSourceCandidates = (root, scraper, ignoreRules, internalKeys) => {
  const candidates = new Map();
  const outlines = root.querySelectorAll('outline');

  for (const outline of outlines) {
    const name =
      outline.getAttribute('text') || outline.getAttribute('title') || textContent(outline);
    const rawUrl = outline.getAttribute('htmlUrl') || outline.getAttribute('url');
    const url = toAbsoluteUrl(rawUrl, scraper.url);
    addCandidate(candidates, url, ignoreRules, internalKeys, name);
  }

  return candidates;
};

const extractAnchorSourceCandidates = (root, scraper, ignoreRules, internalKeys) => {
  const candidates = new Map();

  for (const anchor of root.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    const url = toAbsoluteUrl(href, scraper.url);
    addCandidate(candidates, url, ignoreRules, internalKeys);
  }

  return candidates;
};

const isSourceHeadingLink = (anchor) => {
  const href = anchor.getAttribute('href') || '';
  return /^\/source\/[^/?#]+/.test(href);
};

const isSectionHeading = (node) => /^H[1-6]$/.test(node?.tagName || '');

const extractSectionSourceCandidates = (root, scraper, ignoreRules, internalKeys) => {
  const candidates = new Map();
  const sourceAnchors = root
    .querySelectorAll('h1 a[href], h2 a[href], h3 a[href], h4 a[href]')
    .filter(isSourceHeadingLink);

  for (const sourceAnchor of sourceAnchors) {
    const name = textContent(sourceAnchor);
    let sibling = sourceAnchor.parentNode?.nextElementSibling;

    while (sibling && !isSectionHeading(sibling)) {
      const storyAnchors = sibling.querySelectorAll?.('a[href]') || [];

      for (const storyAnchor of storyAnchors) {
        const href = storyAnchor.getAttribute('href');
        const url = toAbsoluteUrl(href, scraper.url);
        if (addCandidate(candidates, url, ignoreRules, internalKeys, name)) {
          sibling = null;
          break;
        }
      }

      sibling = sibling?.nextElementSibling;
    }
  }

  return candidates;
};

const extractJsonSourceCandidates = (content, scraper, ignoreRules, internalKeys) => {
  const candidates = new Map();
  let data;
  try {
    data = JSON.parse(content);
  } catch {
    return candidates;
  }

  for (const article of data.articles || []) {
    const url = toAbsoluteUrl(article.url);
    addCandidate(candidates, url, ignoreRules, internalKeys);
  }

  return candidates;
};

export const extractSourceCandidates = (content, scraper, ignoreRules) => {
  const internalKeys = createInternalKeys(scraper);
  let candidates;

  if (scraper.sourceJson) {
    candidates = extractJsonSourceCandidates(content, scraper, ignoreRules, internalKeys);
  } else {
    const root = parseHtml(content);
    candidates = scraper.sourceOpml
      ? extractOpmlSourceCandidates(root, scraper, ignoreRules, internalKeys)
      : scraper.sourceSectionLinks
        ? extractSectionSourceCandidates(root, scraper, ignoreRules, internalKeys)
        : extractAnchorSourceCandidates(root, scraper, ignoreRules, internalKeys);
  }

  candidates = limitCandidates(candidates, scraper.maxSourceCandidates);
  addPinnedSources(candidates, scraper);

  return Array.from(candidates.values()).sort((a, b) =>
    a.canonicalKey.localeCompare(b.canonicalKey)
  );
};

export const createSourceIndex = (sources) => {
  const index = new Map();
  for (const source of sources) {
    index.set(source.canonicalKey, source);
    for (const alias of source.aliases || []) {
      index.set(alias, source);
    }
  }
  return index;
};

export const mergeScrapedSources = ({ sources, listId, candidates, runDate, tags = [] }) => {
  const selectedList = String(listId);
  // Sources that drop off a list are kept (with their metrics frozen) so
  // firstSeen history survives transient absences; pruneStaleSources
  // removes them once unseen past the grace window.
  const merged = sources.map((source) => ({
    ...source,
    lists: (source.lists || []).filter((id) => id !== selectedList),
  }));

  const index = createSourceIndex(merged);
  const seenMetrics = (source) => ({
    firstSeen: source.metrics?.firstSeen ?? runDate,
    lastSeen: runDate,
    foundInCount: 0, // finalized by applyScores once all scrapers have merged
  });

  for (const candidate of candidates) {
    const existing = index.get(candidate.canonicalKey);
    if (existing) {
      existing.lists = uniqueSorted([...existing.lists, selectedList]);
      existing.tags = uniqueSorted([...existing.tags, ...tags]);
      existing.metrics = seenMetrics(existing);
      continue;
    }

    const source = {
      id: sourceIdForCanonicalKey(candidate.canonicalKey),
      name: candidate.name || displayNameForCanonicalKey(candidate.canonicalKey),
      description: candidate.description || '',
      url: candidate.url || sourceUrlForCanonicalKey(candidate.canonicalKey),
      canonicalKey: candidate.canonicalKey,
      aliases: uniqueSorted(candidate.aliases || []),
      tags: uniqueSorted([...(candidate.tags || []), ...tags]),
      lists: [selectedList],
    };
    source.metrics = seenMetrics(source);
    merged.push(source);
    index.set(source.canonicalKey, source);
  }

  return sortSources(merged);
};

export const sortSources = (sources) =>
  [...sources].sort((a, b) => {
    const listRank = (source) => ((source.lists || []).includes('news') ? 0 : 1);
    const rank = listRank(a) - listRank(b);
    if (rank) return rank;
    const score = Number(b.score || 0) - Number(a.score || 0);
    if (score) return score;
    return a.name.localeCompare(b.name);
  });

export const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));

export const writeJson = async (file, value) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
