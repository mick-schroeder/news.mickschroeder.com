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

Use the Node version in `.nvmrc` and the pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Astro renders the pages and catalog overview. Discovery controls use a React island built with shadcn/ui. Settings uses native HTML rendered by Astro. The home page and bookmark redirect share the catalog and selection logic.

## Maintain the source catalog

Edit or replace [`src/data/sources.json`](src/data/sources.json) directly. Keep it as a JSON array with one record per publisher. Each record has an `id`, `name`, HTTPS `url`, and `tags` from [the current interest list](src/data/interest-tags.ts).

- Keep the existing `id` when updating a name, URL, or tags so saved visit history still works.
- Add alternate destinations under `editions`. Each edition has its own `name`, `url`, and `tags`. The main record is the default destination, so omit it from the editions array.
- Run `pnpm check` and `pnpm build`, then use `pnpm preview` to check the homepage and bookmark. Astro validates the collection and generates the shared `/catalog.json` during the build.

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