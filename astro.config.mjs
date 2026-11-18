// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField, fontProviders } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

const site = "https://news.mickschroeder.com"

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: "always",
  prefetch: { prefetchAll: true },
  // Downloaded from Fontsource at build time and served from this site.
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.fontsource(),
      weights: ["100 900"],
      styles: ["normal"],
      fallbacks: ["sans-serif"],
    },
    {
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      provider: fontProviders.fontsource(),
      weights: ["200 800"],
      styles: ["normal"],
      fallbacks: ["serif"],
    },
    {
      name: "Manufacturing Consent",
      cssVariable: "--font-manufacturing-consent",
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ["normal"],
      fallbacks: ["serif"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    // Redirect pages are noindex.
    sitemap({ filter: (page) => !page.endsWith("/redirect/") }),
  ],
  env: {
    schema: {
      DATA_URL: envField.string({
        context: "server",
        access: "public",
        default: "https://data.news.mickschroeder.com",
      }),
      GA4_MEASUREMENT_ID: envField.string({
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
})
