import React, { type ReactNode } from 'react';

export const DEFAULT_SELECTED_LISTS = ['news'];

const LIST_PARAM = 'lists';
const TAG_PARAM = 'tags';
const ALL_LISTS_PARAM_VALUE = 'all';
const LIST_STORAGE_KEY = 'news.selectedLists';
const TAG_STORAGE_KEY = 'news.selectedTags';

type SourceFilterContextType = {
  selectedLists: string[];
  selectedTags: string[];
  setSelectedLists: (lists: string[]) => void;
  setSelectedTags: (tags: string[]) => void;
  filterQueryString: string;
};

export type FilterableSource = {
  lists?: readonly string[] | null;
  tags?: readonly string[] | null;
};

const SourceFilterContext = React.createContext<SourceFilterContextType | undefined>(undefined);

const parseCsv = (value: string | null): string[] =>
  value
    ? Array.from(
        new Set(
          value
            .split(',')
            .map((item) => decodeURIComponent(item).trim())
            .filter(Boolean)
        )
      )
    : [];

const readStoredArray = (key: string): string[] | undefined => {
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(key);
  if (stored === null) return undefined;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const arraysMatch = (a: readonly string[], b: readonly string[]): boolean => {
  if (a.length !== b.length) return false;
  const aSorted = [...a].sort();
  const bSorted = [...b].sort();
  return aSorted.every((item, index) => item === bSorted[index]);
};

const normalizeSelection = (values: readonly string[]): string[] =>
  Array.from(new Set(values.filter(Boolean).map(String))).sort((a, b) => a.localeCompare(b));

export const createFilterQueryString = (
  selectedLists: readonly string[],
  selectedTags: readonly string[]
): string => {
  const params = new URLSearchParams();

  if (selectedLists.length === 0) {
    params.set(LIST_PARAM, ALL_LISTS_PARAM_VALUE);
  } else if (!arraysMatch(selectedLists, DEFAULT_SELECTED_LISTS)) {
    params.set(LIST_PARAM, selectedLists.join(','));
  }
  if (selectedTags.length) {
    params.set(TAG_PARAM, selectedTags.join(','));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const filterSources = <T extends FilterableSource>(
  sources: readonly T[],
  selectedLists: readonly string[],
  selectedTags: readonly string[]
): T[] => {
  return sources.filter((source) => {
    const sourceLists = source.lists ?? [];
    const sourceTags = source.tags ?? [];
    const matchesList =
      selectedLists.length === 0 || sourceLists.some((list) => selectedLists.includes(list));
    const matchesTags =
      selectedTags.length === 0 || sourceTags.some((tag) => selectedTags.includes(tag));

    return matchesList && matchesTags;
  });
};

const getInitialSelection = (): { lists: string[]; tags: string[] } => {
  if (typeof window === 'undefined') {
    return { lists: DEFAULT_SELECTED_LISTS, tags: [] };
  }

  const params = new URLSearchParams(window.location.search);
  const hasQueryLists = params.has(LIST_PARAM);
  const queryLists = parseCsv(params.get(LIST_PARAM));
  const queryTags = parseCsv(params.get(TAG_PARAM));

  if (hasQueryLists || queryTags.length) {
    return {
      lists: queryLists.includes(ALL_LISTS_PARAM_VALUE)
        ? []
        : hasQueryLists
          ? normalizeSelection(queryLists)
          : DEFAULT_SELECTED_LISTS,
      tags: normalizeSelection(queryTags),
    };
  }

  const storedLists = readStoredArray(LIST_STORAGE_KEY);
  const storedTags = readStoredArray(TAG_STORAGE_KEY);

  return {
    lists: storedLists === undefined ? DEFAULT_SELECTED_LISTS : normalizeSelection(storedLists),
    tags: normalizeSelection(storedTags ?? []),
  };
};

export const useSourceFilterContext = (): SourceFilterContextType => {
  const context = React.useContext(SourceFilterContext);
  if (!context) {
    throw new Error('useSourceFilterContext must be used within a SourceFilterProvider');
  }
  return context;
};

export const SourceFilterProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const initialSelection = React.useMemo(getInitialSelection, []);
  const [selectedLists, setSelectedListsState] = React.useState<string[]>(initialSelection.lists);
  const [selectedTags, setSelectedTagsState] = React.useState<string[]>(initialSelection.tags);

  const setSelectedLists = React.useCallback((lists: string[]) => {
    setSelectedListsState(normalizeSelection(lists));
  }, []);

  const setSelectedTags = React.useCallback((tags: string[]) => {
    setSelectedTagsState(normalizeSelection(tags));
  }, []);

  const filterQueryString = React.useMemo(
    () => createFilterQueryString(selectedLists, selectedTags),
    [selectedLists, selectedTags]
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(selectedLists));
    window.localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(selectedTags));

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete(LIST_PARAM);
    nextUrl.searchParams.delete(TAG_PARAM);

    const filterParams = new URLSearchParams(filterQueryString);
    filterParams.forEach((value, key) => {
      nextUrl.searchParams.set(key, value);
    });

    const next = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) {
      window.history.replaceState({}, '', next);
    }
  }, [filterQueryString, selectedLists, selectedTags]);

  const value = React.useMemo<SourceFilterContextType>(
    () => ({
      selectedLists,
      selectedTags,
      setSelectedLists,
      setSelectedTags,
      filterQueryString,
    }),
    [filterQueryString, selectedLists, selectedTags, setSelectedLists, setSelectedTags]
  );

  return <SourceFilterContext.Provider value={value}>{children}</SourceFilterContext.Provider>;
};
