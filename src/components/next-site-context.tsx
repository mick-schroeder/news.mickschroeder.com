import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { useSourceCategoryContext } from './context/SourceCategoryContext';

type SourceNode = {
  name: string;
  url: string;
  categories?: string[] | null;
};

type NextSiteContextValue = {
  nextSite: string;
  setNextSite: React.Dispatch<React.SetStateAction<string>>;
  nextSiteName: string;
  setNextSiteName: React.Dispatch<React.SetStateAction<string>>;
  refreshNextSite: () => void;
  availableCount: number;
};


type NextSiteSourcesQuery = {
  allDataJson: {
    nodes: Array<{ sources: SourceNode[] }>
  };
};

const NextSiteContext = React.createContext<NextSiteContextValue | undefined>(undefined);

export const useNextSiteContext = (): NextSiteContextValue => {
  const context = React.useContext(NextSiteContext);
  if (!context) {
    throw new Error('useNextSiteContext must be used within NextSiteProvider');
  }
  return context;
};

type NextSiteProviderProps = {
  children: React.ReactNode;
};

export const NextSiteProvider = ({ children }: NextSiteProviderProps): JSX.Element => {
    const data = useStaticQuery<NextSiteSourcesQuery>(graphql`
    query NextSiteSourcesQuery {
      allDataJson {
        nodes {
        sources {
          name
          url
          categories
        }
      }
      }
    }
  `);
  const nodes = data.allDataJson?.nodes?.[0]?.sources ?? [];
  const sources = React.useMemo(() => nodes, [nodes]);

  const { selectedCategories } = useSourceCategoryContext();

  // Filter sources by selected categories (empty = all)
  const filteredSources = React.useMemo(() => {
    if (!selectedCategories.length) return sources;
    return sources.filter((source) =>
      (source.categories || []).some((cat) => selectedCategories.includes(cat))
    );
  }, [sources, selectedCategories]);

  // Random picker
  const pickRandom = React.useCallback(
    (list: SourceNode[]): SourceNode | undefined =>
      list.length ? list[Math.floor(Math.random() * list.length)] : undefined,
    []
  );

  // State for the next site selection
  const [nextSite, setNextSite] = React.useState<string>('');
  const [nextSiteName, setNextSiteName] = React.useState<string>('');

  // Refresh using filtered sources
  const refreshNextSite = React.useCallback((): void => {
    if (!filteredSources.length) {
      setNextSite('');
      setNextSiteName('');
      return;
    }
    const chosen = pickRandom(filteredSources);
    if (!chosen) {
      setNextSite('');
      setNextSiteName('');
      return;
    }
    setNextSite(chosen.url);
    setNextSiteName(chosen.name);
  }, [filteredSources, pickRandom]);

  // Seed selection and keep it in sync when filteredSources change
  React.useEffect(() => {
    refreshNextSite();
  }, [filteredSources, refreshNextSite]);

  const contextValue = React.useMemo<NextSiteContextValue>(
    () => ({
      nextSite, // string URL or "" when none available
      setNextSite,
      nextSiteName,
      setNextSiteName,
      refreshNextSite,
      availableCount: filteredSources.length,
    }),
    [nextSite, nextSiteName, refreshNextSite, filteredSources.length]
  );

  return <NextSiteContext.Provider value={contextValue}>{children}</NextSiteContext.Provider>;
};
