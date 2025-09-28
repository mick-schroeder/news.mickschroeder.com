const { createHash } = require('crypto');

const MAX_BASE_LENGTH = 80;
const DEFAULT_FALLBACK = 'screenshot';

const sanitize = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const truncate = (value, maxLength) =>
  value.length > maxLength ? value.slice(0, maxLength) : value;

const buildBaseFromUrl = (rawUrl) => {
  if (!rawUrl) return '';

  const collectFromUrl = (value) => {
    try {
      return new URL(value);
    } catch (error) {
      return null;
    }
  };

  let parsed = collectFromUrl(rawUrl);
  if (!parsed && !/^https?:\/\//i.test(rawUrl)) {
    parsed = collectFromUrl(`https://${rawUrl}`);
  }
  if (!parsed) {
    return rawUrl;
  }

  const hostname = parsed.hostname.replace(/^www\./i, '');
  const pathSegments = parsed.pathname.split('/').filter(Boolean);
  const params = Array.from(parsed.searchParams.keys()).slice(0, 2);

  const rawBase = [hostname, ...pathSegments, params.join('-')].filter(Boolean).join('-');
  return rawBase || parsed.hostname;
};

function createScreenshotSlug(rawInput, fallback = DEFAULT_FALLBACK) {
  const source = rawInput || fallback || DEFAULT_FALLBACK;
  const baseSource = buildBaseFromUrl(source);
  const sanitized = sanitize(baseSource);
  const base = truncate(sanitized || sanitize(fallback), MAX_BASE_LENGTH);
  const shortHash = createHash('sha1').update(String(source)).digest('hex').slice(0, 6);
  return `${base}-${shortHash}`;
}

module.exports = {
  createScreenshotSlug,
};
