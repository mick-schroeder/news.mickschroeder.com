export type SourceSummary = {
  id: string;
  name: string;
  description?: string;
  url: string;
  canonicalKey: string;
  tags: string[];
  lists: string[];
  score?: number;
};

export type TaxonomyItem = {
  id: string;
  name: string;
  description?: string;
  sourceUrl?: string;
  count: number;
  path: string;
};

export const tagSlug = (tag: string): string =>
  tag
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const tagsIndexPath = (): string => '/tags/';

export const tagPath = (tag: string): string => `/tags/${tagSlug(tag)}/`;

export const listsIndexPath = (): string => '/lists/';

export const listPath = (listId: string): string => `/lists/${listId}/`;

export const sourcePath = (sourceId: string): string => `/sources/${sourceId}/`;

export const sortSourcesByName = <T extends { name: string }>(sources: T[]): T[] =>
  [...sources].sort((a, b) => a.name.localeCompare(b.name));
