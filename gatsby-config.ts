require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

import type { GatsbyConfig } from 'gatsby';
import fs from 'fs';
import path from 'path';
import { getSiteConfig } from './src/config/getSiteConfig';
import { loadSources } from './src/data/loadSources';

const GATSBY_SITE_URL = process.env.GATSBY_SITE_URL || 'https://news.mickschroeder.com';
const site = getSiteConfig();
const LOCALES_DIR = path.join(__dirname, 'src', 'locales');
const availableLanguages = fs.existsSync(LOCALES_DIR)
  ? fs.readdirSync(LOCALES_DIR).filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory())
  : ['en'];
const languages = site.languages.filter((language) => availableLanguages.includes(language));
const activeLanguages = languages.length ? languages : availableLanguages;
const GATSBY_DEFAULT_LANGUAGE = ((): string => {
  const envDefault = process.env.GATSBY_DEFAULT_LANGUAGE;
  if (envDefault && activeLanguages.includes(envDefault)) return envDefault;
  if (activeLanguages.includes(site.defaultLanguage)) return site.defaultLanguage;
  return activeLanguages[0] || 'en';
})();
const GENERATED_DATA_DIR = path.join(__dirname, 'src', 'data');
const GENERATED_DATA_FILE = path.join(GENERATED_DATA_DIR, 'data.json');

const ensureGeneratedDataFile = () => {
  const payload = JSON.stringify({ sources: loadSources() });
  fs.mkdirSync(GENERATED_DATA_DIR, { recursive: true });
  if (!fs.existsSync(GENERATED_DATA_FILE) || fs.readFileSync(GENERATED_DATA_FILE, 'utf8') !== payload) {
    fs.writeFileSync(GENERATED_DATA_FILE, payload);
  }
};

ensureGeneratedDataFile();

type I18nContext = {
  language?: string;
  originalPath?: string;
  languages?: string[];
  defaultLanguage?: string;
};

type SitePageNode = {
  path: string;
  context?: {
    i18n?: I18nContext;
  };
  pageContext?: {
    i18n?: I18nContext;
  };
};

type ResolvePagesArgs = {
  allSitePage: {
    nodes: SitePageNode[];
  };
};

type SerializedPage = {
  path: string;
  links: { lang: string; url: string }[];
};

const config: GatsbyConfig = {
  siteMetadata: {
    name: site.siteName,
    title: site.siteName,
    tagLine: 'Shuffle the news.',
    description: site.siteDescription,
    image: '/large-promo.png',
    author: 'Mick Schroeder, LLC',
    authorUrl: 'https://www.mickschroeder.com',
    foundingYear: '2021',
    email: 'contact@mickschroeder.com',
    siteUrl: GATSBY_SITE_URL,
  },
  graphqlTypegen: {
    typesOutputPath: './.cache/types/gatsby-types.d.ts',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: site.siteName,
        short_name: site.siteShortName,
        start_url: '/',
        background_color: '#1f2937',
        lang: GATSBY_DEFAULT_LANGUAGE,
        theme_color: '#1f2937',
        display: 'standalone',
        cache_busting_mode: 'none',
        icon: 'src/images/logo.png',
        icon_options: {
          purpose: 'any maskable',
        },
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'locale',
        path: `${__dirname}/src/locales`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: { name: 'screenshots', path: `${__dirname}/src/images/screenshots` },
    },
    {
      resolve: 'gatsby-plugin-react-i18next',
      options: {
        localeJsonSourceName: 'locale',
        languages: activeLanguages,
        defaultLanguage: GATSBY_DEFAULT_LANGUAGE,
        redirect: true,
        lowerCaseLng: false,
        siteUrl: GATSBY_SITE_URL,
        i18nextOptions: {
          fallbackLng: GATSBY_DEFAULT_LANGUAGE,
          interpolation: { escapeValue: false },
          supportedLngs: activeLanguages,
          ns: ['common'],
          defaultNS: 'common',
        },
        pages: [
          { matchPath: '/admin', languages: ['en'] },
          { matchPath: '/admin/(.*)', languages: ['en'] },
        ],
      },
    },
    'gatsby-plugin-postcss',
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: [process.env.GATSBY_GTAG_ID, process.env.GATSBY_GOOGLE_ADS_ID].filter(
          Boolean
        ) as string[],
        pluginConfig: {
          head: true,
          respectDNT: true,
        },
        gtagConfig: {
          anonymize_ip: true,
        },
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: GENERATED_DATA_DIR,
      },
    },
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images/`,
      },
      __key: 'images',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'mdpages',
        path: `${__dirname}/src/md-pages/`,
      },
      __key: 'mdpages',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: `${__dirname}/src/pages/`,
      },
      __key: 'pages',
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.mdx', '.md'],
        gatsbyRemarkPlugins: [],
      },
    },
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        resolveSiteUrl: () => GATSBY_SITE_URL,
        excludes: ['/redirect'],
        query: `
          query SitemapPages {
            allSitePage {
              nodes {
                path
              }
            }
          }
        `,
        resolvePages: ({ allSitePage }: ResolvePagesArgs) => {
          const nodes = allSitePage?.nodes || [];
          const groups = new Map<
            string,
            {
              originalPath: string;
              perLang: Record<string, string>;
            }
          >();
          const languagesSet = new Set<string>();
          let defaultLanguage: string | undefined;

          const langFromPath = (p: string): string | undefined => {
            const m = p.match(/^\/(\w{2}(?:-[A-Za-z]{2})?)(?:\/|$)/);
            return m?.[1];
          };

          for (const node of nodes) {
            const ctx = node.context || node.pageContext || {};
            const i18n = ctx.i18n || {};
            const language: string | undefined = i18n.language || langFromPath(node.path);
            const originalPath: string =
              i18n.originalPath ||
              (language ? node.path.replace(new RegExp(`^/${language}(?=/|$)`), '') : node.path) ||
              '/';
            const langs: string[] = Array.isArray(i18n.languages) ? i18n.languages : [];
            if (langs.length) langs.forEach((l) => languagesSet.add(l));
            if (language) languagesSet.add(language);
            if (!defaultLanguage && i18n.defaultLanguage) defaultLanguage = i18n.defaultLanguage;

            const key = originalPath || '/';
            if (!groups.has(key))
              groups.set(key, { originalPath: key, perLang: {} as Record<string, string> });
            const group = groups.get(key)!;
            if (language) group.perLang[language] = node.path;
            // Also store default fallback if no language identified
            if (!language) group.perLang['__default__'] = node.path;
          }

          // Heuristic if defaultLanguage not in context: prefer the language whose page has no prefix
          if (!defaultLanguage) {
            // Try to find a language that has pages where path === originalPath
            for (const [, g] of groups) {
              const perLang = g.perLang;
              for (const lang of Object.keys(perLang)) {
                if (lang === '__default__') continue;
                const p = perLang[lang];
                if (p === g.originalPath) {
                  defaultLanguage = lang;
                  break;
                }
              }
              if (defaultLanguage) break;
            }
          }
          // Fallback to configured default
          if (!defaultLanguage) defaultLanguage = GATSBY_DEFAULT_LANGUAGE;

          // Ensure default language appears in alternates
          languagesSet.add(defaultLanguage!);
          const languages = Array.from(languagesSet);

          const toHref = (lng: string, originalPath: string): string =>
            `${GATSBY_SITE_URL}${lng === defaultLanguage ? originalPath : `/${lng}${originalPath}`}`;

          const pages: SerializedPage[] = Array.from(groups.values()).map((group) => {
            const canonicalPath = group.perLang[defaultLanguage!] || group.originalPath || '/';
            const links = [
              { lang: 'x-default', url: `${GATSBY_SITE_URL}${group.originalPath || '/'}` },
              ...languages.map((lng) => ({
                lang: lng,
                url: toHref(lng, group.originalPath || '/'),
              })),
            ];
            return { path: canonicalPath, links };
          });

          return pages;
        },
        serialize: (page: SerializedPage) => ({
          url: `${GATSBY_SITE_URL}${page.path}`,
          links: page.links,
          changefreq: 'daily',
          priority: 0.7,
        }),
      },
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: GATSBY_SITE_URL,
        sitemap: `${GATSBY_SITE_URL}/sitemap-index.xml`,
        env: {
          development: {
            policy: [{ userAgent: '*', disallow: ['/'] }],
          },
          production: {
            policy: [
              { userAgent: '*', allow: '/' },
              { userAgent: '*', disallow: ['/redirect'] },
              { userAgent: '*', disallow: ['/admin'] },
            ],
          },
        },
      },
    },
  ],
};

export default config;
