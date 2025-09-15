import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { useSourceCategoryContext } from './context/SourceCategoryContext';

const NextSiteContext = createContext();

export const useNextSiteContext = () => useContext(NextSiteContext);

export const NextSiteProvider = ({ children }) => {
  const data = useStaticQuery(graphql`
    query NextSiteSourcesQuery {
      allSourcesJson {
        nodes {
          name
          url
          categories
        }
      }
    }
  `);
  const nodes = data.allSourcesJson.nodes;
  const sources = useMemo(() => nodes || [], [nodes]);

  const { selectedCategories } = useSourceCategoryContext();

  // Filter sources by selected categories (empty = all)
  const filteredSources = useMemo(() => {
    if (!selectedCategories.length) return sources;
    return sources.filter((s) =>
      (s.categories || []).some((cat) => selectedCategories.includes(cat))
    );
  }, [sources, selectedCategories]);

  // Random picker
  const pickRandom = useCallback(
    (list) => (list && list.length ? list[Math.floor(Math.random() * list.length)] : undefined),
    []
  );

  // State for the next site selection
  const [nextSite, setNextSite] = useState('');
  const [nextSiteName, setNextSiteName] = useState('');

  // Refresh using filtered sources
  const refreshNextSite = useCallback(() => {
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
  useEffect(() => {
    refreshNextSite();
  }, [filteredSources, refreshNextSite]);

  const contextValue = useMemo(
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
