import fs from 'fs';
import path from 'path';
import type { GatsbyNode } from 'gatsby';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { preProcessSources } = require('./processSources');
import { getSiteConfig } from './src/config/getSiteConfig';
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
        '@/lib': path.resolve(__dirname, 'src/lib'),
      },
    },
  });
};

export const onPostBootstrap: GatsbyNode['onPostBootstrap'] = async ({
  reporter,
  getNodesByType,
}) => {
  const files = getNodesByType('DataJson') as Array<{ sources?: any[] }>;
  const file = files[0];
  const sources = Array.isArray(file?.sources) ? file!.sources : [];

  reporter.info(
    `[gatsby-node] DataJson nodes: ${files.length}; sources entries: ${sources.length}`
  );

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
    type DataJson implements Node @dontInfer {
      sources: [NewsSource!]!
    }
    type NewsSource {
      name: String!
      url: String!
      categories: [String]
      score: Float
      hash: String
      screenshot: File
    }
  `);
};

export const createResolvers: GatsbyNode['createResolvers'] = ({ createResolvers }) => {
  createResolvers({
    NewsSource: {
      categories: {
        resolve(source: { categories?: unknown }) {
          const cat = source.categories;
          if (Array.isArray(cat)) return cat;
          if (typeof cat === 'string' && cat) return [cat];
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
    process.env.GATSBY_DEFAULT_LANGUAGE && activeLanguages.includes(process.env.GATSBY_DEFAULT_LANGUAGE)
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
};
