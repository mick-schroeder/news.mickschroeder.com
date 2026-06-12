import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { filterSources, useSourceFilterContext } from './source-filter-context';

type SourceNode = {
  id: string;
  name: string;
  url: string;
  tags?: string[] | null;
  lists?: string[] | null;
};

type NextSiteContextValue = {
  nextSite: string;
  setNextSite: React.Dispatch<React.SetStateAction<string>>;
  nextSiteId: string;
  setNextSiteId: React.Dispatch<React.SetStateAction<string>>;
  nextSiteName: string;
  setNextSiteName: React.Dispatch<React.SetStateAction<string>>;
  refreshNextSite: () => void;
  availableCount: number;
};

type NextSiteSourcesQuery = {
  allGeneratedJson: {
    nodes: Array<{ sources: SourceNode[] }>;
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
      allGeneratedJson {
        nodes {
          sources {
            id
            name
            url
            tags
            lists
          }
        }
      }
    }
  `);
  const nodes = data.allGeneratedJson?.nodes?.[0]?.sources ?? [];
  const sources = React.useMemo(() => nodes, [nodes]);

  const { selectedLists, selectedTags } = useSourceFilterContext();

  const filteredSources = React.useMemo(() => {
    return filterSources(sources, selectedLists, selectedTags);
  }, [sources, selectedLists, selectedTags]);

  // Random picker
  const pickRandom = React.useCallback(
    (list: SourceNode[]): SourceNode | undefined =>
      list.length ? list[Math.floor(Math.random() * list.length)] : undefined,
    []
  );

  // State for the next site selection
  const [nextSite, setNextSite] = React.useState<string>('');
  const [nextSiteId, setNextSiteId] = React.useState<string>('');
  const [nextSiteName, setNextSiteName] = React.useState<string>('');

  // Refresh using filtered sources
  const refreshNextSite = React.useCallback((): void => {
    if (!filteredSources.length) {
      setNextSite('');
      setNextSiteId('');
      setNextSiteName('');
      return;
    }
    const chosen = pickRandom(filteredSources);
    if (!chosen) {
      setNextSite('');
      setNextSiteId('');
      setNextSiteName('');
      return;
    }
    setNextSite(chosen.url);
    setNextSiteId(chosen.id);
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
      nextSiteId,
      setNextSiteId,
      nextSiteName,
      setNextSiteName,
      refreshNextSite,
      availableCount: filteredSources.length,
    }),
    [nextSite, nextSiteId, nextSiteName, refreshNextSite, filteredSources.length]
  );

  return <NextSiteContext.Provider value={contextValue}>{children}</NextSiteContext.Provider>;
};
