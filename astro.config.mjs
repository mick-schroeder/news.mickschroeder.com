// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField } from "astro/config"
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
  i18n: {
    defaultLocale,
    locales,
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
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
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map((locale) => [locale, locale])),
      },
    }),
  ],
})
