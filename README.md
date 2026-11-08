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

Run `pnpm catalog:review` to open the local review workspace. The address is
`http://127.0.0.1:4322` if the browser does not open automatically.

1. **Audit existing links.** Review missing links, redirects and inconclusive checks. Open the original and redirect links to verify where they land, or recheck from the workspace. Review possible aliases before adding or replacing links. For the initial cleanup, you can approve reachable links without possible aliases in bulk, then review the rest individually.
2. **Discover links.** The Techmeme, Memeorandum and Mediagazer feeds supply candidates and suggested interests. Edit the name, URL or tags before approving. You can also add a link manually or ignore a candidate's host. Discovery matches ignore rules by hostname, treating `www` as equivalent and other subdomains separately.
3. **Preview and apply.** The browser saves draft decisions locally. Preview the batch before writing it to the checkout. Normal batches leave deferred links alone. For an explicitly approved-only rebuild, select the rebuild option and review the proposed removals before applying. Review the Git diff afterward.
4. **Publish and verify.** Run `pnpm check` and `pnpm build`, merge the changes, and let Amplify deploy. From a build of the merged revision, run `pnpm catalog:verify --url https://news.mickschroeder.com`. Smoke-test Shuffle with an affected interest. Revert the catalog change and redeploy if a batch needs reversing.

The catalog lives in `src/data/sources.json`. Each row contains `url`, `name`, and
`tags` from the [interest list](src/data/interest-tags.ts). Astro serves the
validated catalog at `/catalog.json`. The workspace can also append approved
rules to [the ignore list](src/data/ignore-urls.txt).

For standalone reports, run `pnpm catalog:audit` or `pnpm catalog:discover`.
Discovery reports any feed failures alongside available results and exits
nonzero if a feed failed. Network scans run independently of the build.

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
