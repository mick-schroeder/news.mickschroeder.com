import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DRUDGE_URL = 'https://www.drudgereport.com/';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/sources.drudge.json');
const IGNORE_FILE = path.resolve(__dirname, '../src/data/drudge-ignore-urls.txt');

const isHttp = (protocol) => protocol === 'http:' || protocol === 'https:';

const normalizeDomain = (hostname) => hostname.toLowerCase().replace(/^www\./, '');

const isInternalDrudgeHost = (hostname) => {
  const normalized = normalizeDomain(hostname);
  return normalized === 'drudgereport.com' || normalized.endsWith('.drudgereport.com');
};

const loadIgnoreRules = async () => {
  const content = await fs.readFile(IGNORE_FILE, 'utf8');
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  const schemePrefixes = [];
  const urlPrefixes = [];
  const domains = new Set();

  for (const line of lines) {
    const normalizedLine = line.toLowerCase();
    if (normalizedLine.endsWith(':') && !normalizedLine.includes('/')) {
      schemePrefixes.push(normalizedLine);
      continue;
    }

    try {
      const url = new URL(normalizedLine);
      if (isHttp(url.protocol)) {
        urlPrefixes.push(normalizedLine);
        domains.add(normalizeDomain(url.hostname));
      }
    } catch {
      // Ignore invalid lines to keep the list easy to edit.
    }
  }

  return { schemePrefixes, urlPrefixes, domains };
};

const extractOutboundDomains = (html, ignoreRules) => {
  const hrefRegex = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi;
  const domains = new Set();

  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[2]?.trim();
    if (!href) continue;
    const hrefLower = href.toLowerCase();
    if (ignoreRules.schemePrefixes.some((prefix) => hrefLower.startsWith(prefix))) continue;

    let url;
    try {
      url = new URL(href, DRUDGE_URL);
    } catch {
      continue;
    }

    if (!isHttp(url.protocol)) continue;
    const resolvedUrl = url.toString().toLowerCase();
    if (ignoreRules.urlPrefixes.some((prefix) => resolvedUrl.startsWith(prefix))) continue;
    if (isInternalDrudgeHost(url.hostname)) continue;
    if (ignoreRules.domains.has(normalizeDomain(url.hostname))) continue;

    const domain = normalizeDomain(url.hostname);
    if (domain) domains.add(domain);
  }

  return Array.from(domains).sort((a, b) => a.localeCompare(b));
};

const toSources = (domains) =>
  domains.map((domain) => ({
    name: domain,
    url: `https://${domain}/`,
    categories: ['Drudge'],
    score: 3.0,
  }));

const main = async () => {
  const ignoreRules = await loadIgnoreRules();
  const response = await fetch(DRUDGE_URL, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (compatible; NewsShuffleBot/1.0; +https://news.mickschroeder.com)',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const html = await response.text();
  const domains = extractOutboundDomains(html, ignoreRules);

  if (!domains.length) {
    throw new Error('No outbound domains were extracted from Drudge Report HTML.');
  }

  const sources = toSources(domains);
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(sources, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${sources.length} sources to ${OUTPUT_FILE}`);
};

main().catch((error) => {
  console.error(`[sources:drudge] Failed: ${error.message}`);
  process.exit(1);
});
