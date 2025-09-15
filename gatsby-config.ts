require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

import type { GatsbyConfig } from 'gatsby';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.SITE_URL || 'https://news.mickschroeder.com';
const LOCALES_DIR = path.join(__dirname, 'src', 'locales');
const languages = fs.existsSync(LOCALES_DIR)
  ? fs.readdirSync(LOCALES_DIR).filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory())
  : ['en'];
const DEFAULT_LANGUAGE = ((): string => {
  const envDefault = process.env.DEFAULT_LANGUAGE;
  if (envDefault && languages.includes(envDefault)) return envDefault;
  return languages[0] || 'en';
})();

const config: GatsbyConfig = {
  siteMetadata: {
    name: `News Craic`,
    title: `News Craic`,
    tagLine: `Shuffle the news, find the craic.`,
    description: `News Craic is your shuffle button for Irish news. Stay informed with a single click as we take you across Ireland’s top news sites, serving the craic.`,
    twitterUsername: `@mick_schroeder`,
    image: `/web-shuffle-large-promo.png`,
    author: `Mick Schroeder, LLC`,
    authorUrl: `https://www.mickschroeder.com`,
    foundingYear: `2021`,
    email: `contact@mickschroeder.com`,
    siteUrl: SITE_URL,
  },
  graphqlTypegen: {
    typesOutputPath: `${__dirname}/.cache/types/gatsby-types.d.ts`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `News Craic`,
        short_name: `News Craic`,
        start_url: `/`,
        background_color: `#1f2937`,
        lang: DEFAULT_LANGUAGE,
        theme_color: `#1f2937`,
        display: `standalone`,
        cache_busting_mode: 'none',
        icon: `src/images/icon.svg`,
        icon_options: {
          purpose: `any maskable`,
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
      resolve: `gatsby-source-filesystem`,
      options: { name: `screenshots`, path: `${__dirname}/static/screenshots` },
    },
    {
      resolve: 'gatsby-plugin-react-i18next',
      options: {
        localeJsonSourceName: 'locale',
        languages,
        defaultLanguage: DEFAULT_LANGUAGE,
        redirect: true,
        lowerCaseLng: false,
        siteUrl: SITE_URL,
        i18nextOptions: {
          fallbackLng: DEFAULT_LANGUAGE,
          interpolation: { escapeValue: false },
          supportedLngs: languages,
          ns: ['common'],
          defaultNS: 'common',
        },
        pages: [
          // keep MDX/pages localized by filename or directory later if you want
          // { matchPath: '/:lang?/news/:uid', getLanguageFromPath: true },
        ],
      },
    },
    `gatsby-plugin-postcss`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: 'gatsby-plugin-offline',
      options: {
        workboxConfig: {
          globPatterns: ['**/icons*'],
        },
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          'G-RMM4MSRDQM', // Google Analytics
        ],
        pluginConfig: {
          head: true,
          respectDNT: true,
        },
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: `./src/data/`,
      },
    },
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: './src/images/',
      },
      __key: 'images',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'mdpages',
        path: './src/md-pages/',
      },
      __key: 'mdpages',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: './src/pages/',
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
      resolve: `gatsby-plugin-sitemap`,
      options: {
        resolveSiteUrl: () => SITE_URL,
        excludes: ['/redirect'],
        query: `
          {
            allSitePage {
              nodes {
                path
              }
            }
          }
        `,
        resolvePages: ({ allSitePage }) => {
          const nodes = allSitePage?.nodes || [];
          const groups = new Map();
          const languagesSet = new Set();
          let defaultLanguage: string | undefined;

          const langFromPath = (p: string): string | undefined => {
            const m = p.match(/^\/(\w{2}(?:-[A-Za-z]{2})?)(?:\/|$)/);
            return m?.[1];
          };

          for (const n of nodes) {
            const ctx = (n as any).context || (n as any).pageContext || {};
            const i18n = ctx.i18n || {};
            const language: string | undefined = i18n.language || langFromPath(n.path);
            const originalPath: string =
              i18n.originalPath ||
              (language ? n.path.replace(new RegExp(`^/${language}(?=/|$)`), '') : n.path) ||
              '/';
            const langs: string[] = Array.isArray(i18n.languages) ? i18n.languages : [];
            if (langs.length) langs.forEach((l) => languagesSet.add(l));
            if (language) languagesSet.add(language);
            if (!defaultLanguage && i18n.defaultLanguage) defaultLanguage = i18n.defaultLanguage;

            const key = originalPath || '/';
            if (!groups.has(key))
              groups.set(key, { originalPath: key, perLang: {} as Record<string, string> });
            if (language) groups.get(key).perLang[language] = n.path;
            // Also store default fallback if no language identified
            if (!language) groups.get(key).perLang['__default__'] = n.path;
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
          if (!defaultLanguage) defaultLanguage = DEFAULT_LANGUAGE;

          // Ensure default language appears in alternates
          languagesSet.add(defaultLanguage!);
          const languages = Array.from(languagesSet);

          const toHref = (lng: string, originalPath: string) =>
            `${SITE_URL}${lng === defaultLanguage ? originalPath : `/${lng}${originalPath}`}`;

          const pages = Array.from(groups.values()).map((g) => {
            const canonicalPath = g.perLang[defaultLanguage!] || g.originalPath || '/';
            const links = [
              { lang: 'x-default', url: `${SITE_URL}${g.originalPath || '/'}` },
              ...languages.map((lng) => ({ lang: lng, url: toHref(lng, g.originalPath || '/') })),
            ];
            return { path: canonicalPath, links };
          });

          return pages;
        },
        serialize: (page) => ({
          url: `${SITE_URL}${page.path}`,
          links: page.links,
          changefreq: `daily`,
          priority: 0.7,
        }),
      },
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: SITE_URL,
        sitemap: `${SITE_URL}/sitemap-index.xml`,
        env: {
          development: {
            policy: [{ userAgent: '*', disallow: ['/'] }],
          },
          production: {
            policy: [
              { userAgent: '*', allow: '/' },
              { userAgent: '*', disallow: ['/redirect'] },
            ],
          },
        },
      },
    },
  ],
};

export default config;
