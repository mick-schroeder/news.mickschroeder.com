# [🔀 News Shuffle](https://news.mickschroeder.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Assets: CC BY-NC 4.0](https://img.shields.io/badge/Content-CC%20BY--NC%204.0-blue.svg)](CONTENT_LICENSE.md)

Take me to a random website, please.

Choose your interests, then open the queued website or ask for a new pick. Save the shuffle bookmark to open a random website using your saved interests.

## Tech Stack

- [React](https://reactjs.org/)
- [Astro](https://astro.build/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com)

## Develop

```sh
pnpm install
pnpm dev
```

## Data

Sites and tags come from [popular-news-sites](https://github.com/mick-schroeder/popular-news-sites)
at build time (`data.news.mickschroeder.com`). If the feed can't be fetched or
doesn't validate, the build fails.

To build against a local run of the data repo, serve its `out/` folder (the
`data-preview` launch entry) and set `DATA_URL=http://localhost:4400`.

## Release

```sh
pnpm check
pnpm audit
pnpm build
pnpm preview
```

## Author

- [Mick Schroeder](https://mickschroeder.com)

## License

- News Shuffle™ is open-source and available under the [MIT License](LICENSE)
- Content (non-code): [CC BY-NC 4.0](CONTENT_LICENSE.md)

Logos, trademarks, and certain media assets may be excluded and remain All Rights Reserved unless explicitly licensed.

## UI conventions

Use the Base Luma shadcn components in `src/components/ui` and prefer their
variants and sizes. Keep discovery-specific styling with the components in
`src/components/discovery`. Use Tailwind utilities for layout and keep shared
theme tokens in `src/styles/global.css`.
