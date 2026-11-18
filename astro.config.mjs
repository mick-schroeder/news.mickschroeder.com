// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

// https://astro.build/config
export default defineConfig({
  site: "https://news.mickschroeder.com",
  trailingSlash: "always",
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
