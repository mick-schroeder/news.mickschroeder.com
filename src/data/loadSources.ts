import sourceListsJson from './source-lists.json';
import sourcesJson from './sources.json';

export type SourceMetrics = {
  firstSeen: string;
  lastSeen: string;
  foundInCount: number;
};

export type Source = {
  id: string;
  name: string;
  description: string;
  url: string;
  canonicalKey: string;
  aliases?: string[];
  tags: string[];
  lists: string[];
  score: number;
  metrics?: SourceMetrics;
  [key: string]: unknown;
};

export type SourceList = {
  id: string;
  name: string;
  description?: string;
  kind: 'curated' | 'scraped';
  sourceUrl?: string;
};

export type ShuffleData = {
  lists: SourceList[];
  sources: Source[];
};

function assertSourceArray(value: unknown, label: string): asserts value is Source[] {
  if (!Array.isArray(value)) {
    throw new Error(`[loadSources] ${label} must export an array of source objects.`);
  }

  for (let i = 0; i < value.length; i += 1) {
    const source = value[i] as Record<string, unknown>;

    if (!source || typeof source !== 'object') {
      throw new Error(`[loadSources] ${label}[${i}] must be an object.`);
    }
    if (typeof source.id !== 'string' || !source.id.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].id must be a non-empty string.`);
    }
    if (typeof source.name !== 'string' || !source.name.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].name must be a non-empty string.`);
    }
    if (typeof source.description !== 'string') {
      throw new Error(`[loadSources] ${label}[${i}].description must be a string.`);
    }
    if (typeof source.url !== 'string' || !source.url.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].url must be a non-empty string.`);
    }
    if (typeof source.canonicalKey !== 'string' || !source.canonicalKey.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].canonicalKey must be a non-empty string.`);
    }
    if (
      source.aliases !== undefined &&
      (!Array.isArray(source.aliases) || source.aliases.some((alias) => typeof alias !== 'string'))
    ) {
      throw new Error(`[loadSources] ${label}[${i}].aliases must be a string array.`);
    }
    if (!Array.isArray(source.tags) || source.tags.some((tag) => typeof tag !== 'string')) {
      throw new Error(`[loadSources] ${label}[${i}].tags must be a string array.`);
    }
    if (!Array.isArray(source.lists) || source.lists.some((list) => typeof list !== 'string')) {
      throw new Error(`[loadSources] ${label}[${i}].lists must be a string array.`);
    }
    if (typeof source.score !== 'number' || !Number.isFinite(source.score)) {
      throw new Error(`[loadSources] ${label}[${i}].score must be a finite number.`);
    }
    if (source.metrics !== undefined) {
      const metrics = source.metrics as Record<string, unknown>;
      if (
        !metrics ||
        typeof metrics !== 'object' ||
        typeof metrics.firstSeen !== 'string' ||
        typeof metrics.lastSeen !== 'string' ||
        typeof metrics.foundInCount !== 'number'
      ) {
        throw new Error(
          `[loadSources] ${label}[${i}].metrics must have firstSeen, lastSeen, and foundInCount.`
        );
      }
    }
  }
}

function assertSourceListArray(value: unknown, label: string): asserts value is SourceList[] {
  if (!Array.isArray(value)) {
    throw new Error(`[loadSources] ${label} must export an array of source list objects.`);
  }

  for (let i = 0; i < value.length; i += 1) {
    const list = value[i] as Record<string, unknown>;

    if (!list || typeof list !== 'object') {
      throw new Error(`[loadSources] ${label}[${i}] must be an object.`);
    }
    if (typeof list.id !== 'string' || !list.id.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].id must be a non-empty string.`);
    }
    if (typeof list.name !== 'string' || !list.name.trim()) {
      throw new Error(`[loadSources] ${label}[${i}].name must be a non-empty string.`);
    }
    if (list.kind !== 'curated' && list.kind !== 'scraped') {
      throw new Error(`[loadSources] ${label}[${i}].kind must be curated or scraped.`);
    }
    if (list.sourceUrl !== undefined && typeof list.sourceUrl !== 'string') {
      throw new Error(`[loadSources] ${label}[${i}].sourceUrl must be a string.`);
    }
  }
}

function assertNoDuplicateSourceKeys(sources: Source[]): void {
  const seen = new Map<string, string>();

  for (const source of sources) {
    for (const key of [source.canonicalKey, ...(source.aliases || [])]) {
      const existing = seen.get(key);
      if (existing && existing !== source.id) {
        throw new Error(
          `[loadSources] Source key "${key}" is used by both ${existing} and ${source.id}.`
        );
      }
      seen.set(key, source.id);
    }
  }
}

function assertListReferences(sources: Source[], lists: SourceList[]): void {
  const validLists = new Set(lists.map((list) => list.id));

  for (const source of sources) {
    for (const listId of source.lists) {
      if (!validLists.has(listId)) {
        throw new Error(`[loadSources] ${source.id} references unknown list "${listId}".`);
      }
    }
  }
}

export const loadShuffleData = (): ShuffleData => {
  const lists = sourceListsJson as unknown;
  const sources = sourcesJson as unknown;

  assertSourceListArray(lists, 'source-lists.json');
  assertSourceArray(sources, 'sources.json');
  assertNoDuplicateSourceKeys(sources);
  assertListReferences(sources, lists);

  return { lists, sources };
};

export const loadSources = (): Source[] => loadShuffleData().sources;
