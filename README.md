# [🔀 News Shuffle](https://news.mickschroeder.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Content: CC BY-NC 4.0](https://img.shields.io/badge/Content-CC%20BY--NC%204.0-blue.svg)](CONTENT_LICENSE.md)

Shuffle to a random news source. Pick topics, regions and tiers, then open the
queued source or ask for a new pick. Save the shuffle bookmark to shuffle with
your filters from anywhere.

Built with [Astro](https://astro.build/), [React](https://react.dev/),
[Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com).
The site is fully static.

## Develop

Requires Node (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm fetch-favicons   # optional: cache source icons in public/favicons/
pnpm dev
```

| Script                | Does                                                  |
| --------------------- | ----------------------------------------------------- |
| `pnpm dev`            | Dev server on http://localhost:4321                   |
| `pnpm check`          | Formatting, lint, type check and tests (CI runs this) |
| `pnpm format`         | Format everything with Prettier                       |
| `pnpm build`          | Static build into `dist/`                             |
| `pnpm preview`        | Serve the build                                       |
| `pnpm fetch-favicons` | Download missing or stale favicons                    |

Copy `.env.example` to `.env` to set analytics and ads. They're off by default
and only load in production builds on the live domain.

## Data

Sources and tags come from
[popular-news-sites](https://github.com/mick-schroeder/popular-news-sites)
at build time (`data.news.mickschroeder.com`). The data is validated in
`src/lib/data.ts`; if it can't be fetched or doesn't validate, the build fails.

| Term   | Meaning                                     | Example               |
| ------ | ------------------------------------------- | --------------------- |
| Source | A news website the shuffle can open         | nytimes.com           |
| Tag    | A label on a source, of one kind below      |                       |
| Topic  | Tag kind: what a source covers              | news, politics        |
| Region | Tag kind: where a source is based; optional | british, american     |
| Feed   | Tag kind: a feed that listed the source     | Newzit, Drudge Report |
| Tier   | A source's rank, S (best) to F              | B                     |

Topic, region and feed are the facets: each is a tag `kind`, a filter key and a
UI label in `en.ts`, with no mapping between them.

To build against a local run of the data repo, serve its `out/` folder and set
`DATA_URL=http://localhost:4400`.

## Project layout

```
src/
  pages/[...locale]/   Pages (English only; the locale routing stays for later)
  layouts/             Page shell: head, masthead, footer
  components/
    discovery/         Home page shuffle controls
    sources/           Source and tag directory pages
    legal/             Privacy and terms copy
    ui/                shadcn/ui components
  i18n/
    en.ts              All UI text
    locales.ts         Supported languages (English)
  lib/
    brand.ts           App name, owner and links
    data.ts            Data schema and loader
    sources.ts         Filtering, shuffling and sorting
design/                Sources for the social share images
scripts/               Build helpers
tests/                 Unit tests (node --test)
```

## Conventions

- **Text** lives in `src/i18n/en.ts`, never in components. Write `{brand}` for
  the app name.
- **Brand** details live in `src/lib/brand.ts`.
- **Pages** read their language from `Astro.currentLocale`. React components
  take a `locale` prop.
- **UI** uses the shadcn components in `src/components/ui` and their variants.
  Use Tailwind utilities for layout and keep theme tokens in
  `src/styles/global.css`.

### Adding a language

1. Add it to `languages` in `src/i18n/locales.ts`.
2. Add `src/i18n/{code}.ts` and register it in `src/i18n/ui.ts`.
3. Optionally add legal copy in `src/components/legal/*/{code}.astro`
   (English is used otherwise).

## License

- Code: [MIT](LICENSE)
- Content (non-code): [CC BY-NC 4.0](CONTENT_LICENSE.md)

News Shuffle™ is a trademark of Mick Schroeder, LLC. Logos, trademarks and
certain media assets may be excluded and remain All Rights Reserved unless
explicitly licensed.
