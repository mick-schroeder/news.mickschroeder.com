import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { graphql, useStaticQuery } from "gatsby";
import { useI18next } from "gatsby-plugin-react-i18next";

const NextSiteContext = createContext();

export const useNextSiteContext = () => useContext(NextSiteContext);

// Helpers to handle string or array locales and base-language fallback
const normalizeLocales = (val) => (Array.isArray(val) ? val : [val]).filter(Boolean);
const isExactMatch = (locs, lang) => normalizeLocales(locs).some((l) => l === lang);
const isBaseMatch = (locs, lang) => {
  const base = String(lang || "").split("-")[0];
  if (!base) return false;
  return normalizeLocales(locs).some((l) => String(l).split("-")[0] === base);
};

export const NextSiteProvider = ({ children }) => {
  const data = useStaticQuery(graphql`
    query NextSiteSourcesQuery {
      allSourcesJson {
        nodes {
          name
          url
          locale
        }
      }
    }
  `);
  const nodes = data.allSourcesJson.nodes;
  const sources = useMemo(() => nodes || [], [nodes]);

  const i18n = useI18next(); // { language: 'en-IE' | 'ga' | 'en-US', ... }
  const lang = i18n.language;

  // Build the candidate pool for the current language: prefer exact match, else base-lang match
  const candidates = useMemo(() => {
    const exact = sources.filter((s) => isExactMatch(s.locale, lang));
    if (exact.length) return exact;
    const base = sources.filter((s) => isBaseMatch(s.locale, lang));
    return base;
  }, [sources, lang]);

  // Random picker
  const pickRandom = useCallback(
    (list) => (list && list.length ? list[Math.floor(Math.random() * list.length)] : undefined),
    []
  );

  // State for the next site selection
  const [nextSite, setNextSite] = useState("");
  const [nextSiteName, setNextSiteName] = useState("");
  const [nextSiteLocale, setNextSiteLocale] = useState(lang);

  // Refresh using current language (or an override) — no hooks inside
  const refreshNextSite = useCallback(
    (forcedLanguage) => {
      const targetLang = typeof forcedLanguage === "string" && forcedLanguage ? forcedLanguage : lang;
      const exact = sources.filter((s) => isExactMatch(s.locale, targetLang));
      const pool = exact.length ? exact : sources.filter((s) => isBaseMatch(s.locale, targetLang));
      if (!pool.length) {
        setNextSite("");
        setNextSiteName("");
        setNextSiteLocale(targetLang);
        return;
      }
      const chosen = pickRandom(pool);
      if (!chosen) {
        setNextSite("");
        setNextSiteName("");
        setNextSiteLocale(targetLang);
        return;
      }
      setNextSite(chosen.url);
      setNextSiteName(chosen.name);
      setNextSiteLocale(targetLang);
    },
    [lang, sources, pickRandom]
  );

  // Seed selection and keep it in sync when language or sources change
  useEffect(() => {
    refreshNextSite();
  }, [lang, sources, refreshNextSite]);

  const contextValue = useMemo(
    () => ({
      nextSite, // string URL or "" when none available
      setNextSite,
      nextSiteName,
      nextSiteLocale,
      setNextSiteLocale,
      setNextSiteName,
      refreshNextSite,
      availableCount: candidates.length,
    }),
    [nextSite, nextSiteName, nextSiteLocale, refreshNextSite, candidates.length]
  );

  return (
    <NextSiteContext.Provider value={contextValue}>
      {children}
    </NextSiteContext.Provider>
  );
};
