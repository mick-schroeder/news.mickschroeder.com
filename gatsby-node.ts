import fs from 'fs';
import path from 'path';
import type { GatsbyNode } from 'gatsby';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { preProcessSources, syncScreenshotsFromS3 } = require('./processSources');
import { getSiteConfig } from './src/config/getSiteConfig';
import { loadShuffleData } from './src/data/loadSources';
import {
  listPath,
  listsIndexPath,
  sortSourcesByName,
  sourcePath,
  tagPath,
  tagsIndexPath,
} from './src/lib/taxonomy';
import { createScreenshotSlug } from './utils/screenshotSlug';

const express = require('express');

// Serve files from `static` in development
export const onCreateDevServer: GatsbyNode['onCreateDevServer'] = ({ app }) => {
  app.use(express.static('static'));
};

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/config': path.resolve(__dirname, 'src/config'),
        '@/lib': path.resolve(__dirname, 'src/lib'),
      },
    },
  });
};

export const onPreBootstrap: GatsbyNode['onPreBootstrap'] = async ({ reporter }) => {
  const shouldRefreshScreenshots =
    process.env.GATSBY_REFRESH_SCREENSHOTS === 'true' || process.env.FORCE_REGENERATE === 'true';

  if (!shouldRefreshScreenshots) {
    reporter.info(
      '[gatsby-node] Screenshot regeneration disabled; syncing existing screenshots from S3. Set GATSBY_REFRESH_SCREENSHOTS=true to regenerate during build.'
    );
    const { sources } = loadShuffleData();
    await syncScreenshotsFromS3(sources, reporter);
    return;
  }

  const { sources } = loadShuffleData();
  reporter.info(`[gatsby-node] Preparing screenshots before source nodes: ${sources.length}`);

  if (!sources.length) {
    reporter.warn(
      '[gatsby-node] No sources found in data layer; skipping screenshot pre-processing.'
    );
    return;
  }

  await preProcessSources(sources, reporter);
};

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type GeneratedJson implements Node @dontInfer {
      sources: [NewsSource!]!
      lists: [SourceList!]!
    }
    type NewsSource {
      id: String!
      name: String!
      description: String!
      url: String!
      canonicalKey: String!
      aliases: [String]
      tags: [String]
      lists: [String]
      score: Float
      hash: String
      screenshot: File
    }
    type SourceList {
      id: String!
      name: String!
      description: String
      kind: String!
      sourceUrl: String
    }
  `);
};

export const createResolvers: GatsbyNode['createResolvers'] = ({ createResolvers }) => {
  createResolvers({
    NewsSource: {
      aliases: {
        resolve(source: { aliases?: unknown }) {
          const aliases = source.aliases;
          if (Array.isArray(aliases)) return aliases;
          if (typeof aliases === 'string' && aliases) return [aliases];
          return [];
        },
      },
      tags: {
        resolve(source: { tags?: unknown; categories?: unknown }) {
          const tags = source.tags ?? source.categories;
          if (Array.isArray(tags)) return tags;
          if (typeof tags === 'string' && tags) return [tags];
          return [];
        },
      },
      lists: {
        resolve(source: { lists?: unknown }) {
          const lists = source.lists;
          if (Array.isArray(lists)) return lists;
          if (typeof lists === 'string' && lists) return [lists];
          return [];
        },
      },
      hash: {
        resolve(source: { url?: string; name?: string }) {
          return createScreenshotSlug(source.url || source.name || '', source.name);
        },
      },
      screenshot: {
        async resolve(source: { url?: string; name?: string }, _args: unknown, context: any) {
          const hash = createScreenshotSlug(source.url || source.name || '', source.name);
          return context.nodeModel.findOne({
            type: 'File',
            query: {
              filter: {
                sourceInstanceName: { eq: 'screenshots' },
                base: { eq: `${hash}.webp` },
              },
            },
          });
        },
      },
    },
  });
};

type MdxFileNode = {
  name?: string | null;
  relativePath?: string | null;
};

type MdxNode = {
  id: string;
  internal: {
    contentFilePath: string;
  };
  parent?: MdxFileNode | null;
};

type AllMdxQuery = {
  allMdx: {
    nodes: MdxNode[];
  };
};

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
  const site = getSiteConfig();

  const localesDir = path.join(__dirname, 'src', 'locales');
  const availableLanguages = fs.existsSync(localesDir)
    ? fs
        .readdirSync(localesDir)
        .filter((file) => fs.statSync(path.join(localesDir, file)).isDirectory())
    : ['en'];
  const languages = site.languages.filter((language) => availableLanguages.includes(language));
  const activeLanguages = languages.length ? languages : availableLanguages;

  const defaultLanguage =
    process.env.GATSBY_DEFAULT_LANGUAGE &&
    activeLanguages.includes(process.env.GATSBY_DEFAULT_LANGUAGE)
      ? process.env.GATSBY_DEFAULT_LANGUAGE
      : activeLanguages.includes(site.defaultLanguage)
        ? site.defaultLanguage
        : activeLanguages[0] || 'en';

  const result = await graphql<AllMdxQuery>(`
    query MdPagesForCreatePages {
      allMdx(filter: { internal: { contentFilePath: { regex: "//src/md-pages//" } } }) {
        nodes {
          id
          internal {
            contentFilePath
          }
          parent {
            ... on File {
              name
              relativePath
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panic('Error querying MD pages', result.errors);
    return;
  }

  const nodes = result.data?.allMdx.nodes ?? [];
  const templatePath = path.resolve(__dirname, 'src/templates/md-page.tsx');
  const sourceTemplatePath = path.resolve(__dirname, 'src/templates/source-page.tsx');
  const taxonomyIndexTemplatePath = path.resolve(
    __dirname,
    'src/templates/taxonomy-index-page.tsx'
  );
  const taxonomyDetailTemplatePath = path.resolve(
    __dirname,
    'src/templates/taxonomy-detail-page.tsx'
  );

  const parseName = (relativePath: string): { slug: string; lang: string } => {
    const match = relativePath.match(/^(.*?)(?:\.(\w{2}(?:-[A-Za-z]{2})?))?\.(md|mdx)$/);
    if (match) {
      const slug = match[1].split('/').pop() ?? '';
      const lang = match[2] || defaultLanguage;
      return { slug, lang };
    }
    const base = relativePath.replace(/\.(md|mdx)$/i, '');
    const slug = base.split('/').pop() ?? '';
    return { slug, lang: defaultLanguage };
  };

  nodes.forEach((node) => {
    const parent = node.parent ?? {};
    const relativePath = String(parent.relativePath || parent.name || '');
    const { slug, lang } = parseName(relativePath);
    const originalPath = `/${slug}/`;
    const localizedPath = lang === defaultLanguage ? originalPath : `/${lang}${originalPath}`;

    createPage({
      path: localizedPath,
      component: `${templatePath}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        language: lang,
        id: node.id,
        i18n: {
          language: lang,
          languages: activeLanguages,
          defaultLanguage,
          originalPath,
          routed: true,
        },
      },
    });
  });

  const shuffleData = loadShuffleData();
  const listById = new Map(shuffleData.lists.map((list) => [list.id, list]));
  const sourceSummary = (source: (typeof shuffleData.sources)[number]) => ({
    id: source.id,
    name: source.name,
    description: source.description,
    url: source.url,
    canonicalKey: source.canonicalKey,
    tags: source.tags,
    lists: source.lists,
    score: source.score,
  });
  const createLocalizedPage = ({
    originalPath,
    component,
    context,
  }: {
    originalPath: string;
    component: string;
    context: Record<string, unknown>;
  }) => {
    activeLanguages.forEach((lang) => {
      const localizedPath = lang === defaultLanguage ? originalPath : `/${lang}${originalPath}`;

      createPage({
        path: localizedPath,
        component,
        context: {
          ...context,
          language: lang,
          i18n: {
            language: lang,
            languages: activeLanguages,
            defaultLanguage,
            originalPath,
            routed: true,
          },
        },
      });
    });
  };

  const tagNames = Array.from(
    new Set(shuffleData.sources.flatMap((source) => source.tags ?? []))
  ).sort((a, b) => a.localeCompare(b));

  const tagItems = tagNames.map((tag) => ({
    id: tagPath(tag).split('/').filter(Boolean).pop() || tag,
    name: tag,
    count: shuffleData.sources.filter((source) => source.tags.includes(tag)).length,
    path: tagPath(tag),
  }));

  const listItems = shuffleData.lists
    .map((list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      sourceUrl: list.sourceUrl,
      count: shuffleData.sources.filter((source) => source.lists.includes(list.id)).length,
      path: listPath(list.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const sortedSourceNavigationItems = sortSourcesByName(shuffleData.sources).map((source) => ({
    id: source.id,
    name: source.name,
    path: sourcePath(source.id),
  }));

  createLocalizedPage({
    originalPath: tagsIndexPath(),
    component: taxonomyIndexTemplatePath,
    context: {
      kind: 'tags',
      items: tagItems,
    },
  });

  createLocalizedPage({
    originalPath: listsIndexPath(),
    component: taxonomyIndexTemplatePath,
    context: {
      kind: 'lists',
      items: listItems,
    },
  });

  tagNames.forEach((tag) => {
    const item = tagItems.find((tagItem) => tagItem.name === tag);
    if (!item) return;

    createLocalizedPage({
      originalPath: tagPath(tag),
      component: taxonomyDetailTemplatePath,
      context: {
        kind: 'tags',
        item,
        sources: sortSourcesByName(
          shuffleData.sources
            .filter((source) => source.tags.includes(tag))
            .map((source) => sourceSummary(source))
        ),
      },
    });
  });

  shuffleData.lists.forEach((list) => {
    const item = listItems.find((listItem) => listItem.id === list.id);
    if (!item) return;

    createLocalizedPage({
      originalPath: listPath(list.id),
      component: taxonomyDetailTemplatePath,
      context: {
        kind: 'lists',
        item,
        sources: sortSourcesByName(
          shuffleData.sources
            .filter((source) => source.lists.includes(list.id))
            .map((source) => sourceSummary(source))
        ),
      },
    });
  });

  shuffleData.sources.forEach((source) => {
    const screenshotBase = `${createScreenshotSlug(source.url || source.name || '', source.name)}.webp`;
    const sourceIndex = sortedSourceNavigationItems.findIndex((item) => item.id === source.id);
    const previousSource =
      sourceIndex >= 0
        ? sortedSourceNavigationItems[
            (sourceIndex - 1 + sortedSourceNavigationItems.length) %
              sortedSourceNavigationItems.length
          ]
        : undefined;
    const nextSource =
      sourceIndex >= 0
        ? sortedSourceNavigationItems[(sourceIndex + 1) % sortedSourceNavigationItems.length]
        : undefined;

    createLocalizedPage({
      originalPath: sourcePath(source.id),
      component: sourceTemplatePath,
      context: {
        id: source.id,
        source,
        screenshotBase,
        sourceLists: source.lists.map((listId) => {
          const list = listById.get(listId);
          return {
            id: listId,
            name: list?.name || listId,
            path: listPath(listId),
          };
        }),
        navigation: {
          previous: previousSource,
          next: nextSource,
          sources: sortedSourceNavigationItems,
        },
      },
    });
  });
};
