// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField, fontProviders } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import { defaultLocale, locales } from "./src/i18n/locales.ts"

/** @param {string} locale */
const prefix = (locale) => (locale === defaultLocale ? "" : `/${locale}`)

// https://astro.build/config
export default defineConfig({
  site: "https://news.mickschroeder.com",
  output: "static",
  trailingSlash: "always",
  prefetch: true,
  i18n: {
    defaultLocale,
    locales,
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Geist",
      cssVariable: "--font-geist",
      options: {
        variants: [
          {
            weight: "100 900",
            style: "normal",
            src: [
              "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
            ],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Manufacturing Consent",
      cssVariable: "--font-manufacturing-consent",
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: [
              "@fontsource/manufacturing-consent/files/manufacturing-consent-latin-400-normal.woff2",
            ],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            weight: "200 800",
            style: "normal",
            src: [
              "@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2",
            ],
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      // http://localhost:4400 reads the data repo's out/ folder.
      DATA_URL: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      GOOGLE_TAGS_ENABLED: envField.boolean({
        context: "server",
        access: "public",
        default: false,
      }),
      GA4_MEASUREMENT_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      ADSENSE_SLOT_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      ADSENSE_CLIENT_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
    },
  },
  integrations: [
    react(),
    sitemap({
      filter: (url) => {
        const path = new URL(url).pathname
        if (path.endsWith("/redirect/")) return false
        return locales.some((locale) =>
          ["/", "/sources/", "/tags/", "/about/"].some(
            (page) =>
              path === prefix(locale) + page ||
              (page !== "/" && path.startsWith(prefix(locale) + page))
          )
        )
      },
    }),
  ],
})
