require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    name: `Nuacht Craic`,
    title: `Nuacht Craic`,
    tagLine: `Shuffle the news, find the craic.`,
    description: `Nuacht Craic is your shuffle button for Irish news. Stay informed with a single click as we take you across Ireland’s top news sites, serving the craic.`,
    twitterUsername: `@mick_schroeder`,
    image: `/web-shuffle-large-promo.png`,
    author: `Mick Schroeder, LLC`,
    authorUrl: `https://schroeder.ie`,
    foundingYear: `2021`,
    email: `webshuffle@mickschroeder.com`,
    siteUrl: `https://news.schroeder.ie`,
  },
  graphqlTypegen: true,
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Nuacht Craic`,
        short_name: `Nuacht Craic`,
        start_url: `/`,
        background_color: `#1f2937`,
        lang: `en-IE`,
        theme_color: `#1f2937`,
        display: `standalone`,
        cache_busting_mode: "none",
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
    languages: ['en-IE','ga','en-US'],     
    defaultLanguage: 'en-IE',
    redirect: true,
    lowerCaseLng: false,
    siteUrl: 'https://news.schroeder.ie',
    i18nextOptions: {
      fallbackLng: 'en-IE',
      interpolation: { escapeValue: false },
      supportedLngs: ['en-IE','ga','en-US'],
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
      resolve: "gatsby-plugin-offline",
      options: {
        workboxConfig: {
          globPatterns: ["**/icons*"],
        },
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          "G-RMM4MSRDQM", // Google Analytics        
          ],
        pluginConfig: {
          head: true,
          respectDNT: true,
        },
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "data",
        path: `./src/data/`,
      },
    },
    "gatsby-transformer-json",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".mdx"],
        gatsbyRemarkPlugins: [],
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {},
    },
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        host: "https://news.schroeder.ie",
        sitemap: "https://news.schroeder.ie/sitemap-index.xml",
        env: {
          development: {
            policy: [{ userAgent: "*", disallow: ["/"] }],
          },
          production: {
            policy: [
              { userAgent: "*", allow: "/" },
              { userAgent: "*", disallow: ["/redirect"] },
            ],
          },
        },
      },
    },
  ],
};

export default config;
