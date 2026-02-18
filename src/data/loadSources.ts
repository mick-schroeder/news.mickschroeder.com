import { getSiteConfig } from '../config/getSiteConfig';
import drudgeSourcesJson from './sources.drudge.json';
import newsSourcesJson from './sources.news.json';

export type Source = {
  name: string;
  url: string;
  categories: string[];
  score: number;
  [key: string]: unknown;
};

const sourceSets = {
  'sources.news.json': newsSourcesJson,
  'sources.drudge.json': drudgeSourcesJson,
} as const;

function assertSourceArray(value: unknown, label: string): asserts value is Source[] {
  if (!Array.isArray(value)) {
    throw new Error(`[loadSources] ${label} must export an array of source objects.`);
  }

  for (let i = 0; i < value.length; i += 1) {
    const source = value[i] as Record<string, unknown>;

    if (!source || typeof source !== 'object') {
      throw new Error(`[loadSources] ${label}[${i}] must be an object.`);
    }
    if (typeof source.name !== 'string' || !source.name.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].name must be a non-empty string.`);
    }
    if (typeof source.url !== 'string' || !source.url.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].url must be a non-empty string.`);
    }
    if (!Array.isArray(source.categories) || source.categories.some((cat) => typeof cat !== 'string')) {
      throw new Error(`[loadSources] ${label}[${i}].categories must be a string array.`);
    }
    if (typeof source.score !== 'number' || !Number.isFinite(source.score)) {
      throw new Error(`[loadSources] ${label}[${i}].score must be a finite number.`);
    }
  }
}

export const loadSources = (): Source[] => {
  const site = getSiteConfig();
  const selected = sourceSets[site.sourcesFile];
  const label = `${site.key} (${site.sourcesFile})`;

  assertSourceArray(selected, label);
  return selected;
};
