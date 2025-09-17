const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { preProcessSources } = require('./processSources.js');

// Constants
const JSON_PATH = './src/data/sources.json';
const SCREENSHOT_PATH = './static/screenshots'; // generated screenshots live here
const CONCURRENT_PAGES = 5;

const onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/lib': path.resolve(__dirname, 'src/lib'),
      },
    },
  });
};

const onPreBootstrap = async ({ reporter }) => {
  if (!fs.existsSync(SCREENSHOT_PATH)) {
    fs.mkdirSync(SCREENSHOT_PATH, { recursive: true });
  }
  await new Promise((resolve) => {
    preProcessSources(JSON_PATH, CONCURRENT_PAGES, reporter).then(() => {
      resolve();
    });
  });
};

const hashOf = (input) =>
  crypto.createHash('sha1').update(String(input)).digest('hex').slice(0, 12);

// 1) Declare explicit types so Gatsby won’t infer from JSON
const createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type SourcesJson implements Node @dontInfer {
      name: String!
      url: String!
      categories: [String]
      score: String
      # Derived fields (not in your JSON)
      hash: String
      screenshot: File @link
    }
  `);
};

// 2) Resolve derived fields: hash + link to File in /static/screenshots
const createResolvers = ({ createResolvers }) => {
  createResolvers({
    SourcesJson: {
      categories: {
        resolve(source) {
          const cat = source.categories;
          if (Array.isArray(cat)) return cat;
          if (typeof cat === 'string' && cat) return [cat];
          return [];
        },
      },
      hash: {
        resolve(source) {
          return hashOf(source.url || source.name || '');
        },
      },
      screenshot: {
        async resolve(source, args, context) {
          const hash = hashOf(source.url || source.name || '');
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

const createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Discover locales dynamically from src/locales
  const LOCALES_DIR = path.join(__dirname, 'src', 'locales');
  const languages = fs.existsSync(LOCALES_DIR)
    ? fs
        .readdirSync(LOCALES_DIR)
        .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory())
    : ['en'];
  const GATSBY_DEFAULT_LANGUAGE =
    process.env.GATSBY_DEFAULT_LANGUAGE && languages.includes(process.env.GATSBY_DEFAULT_LANGUAGE)
      ? process.env.GATSBY_DEFAULT_LANGUAGE
      : languages[0] || 'en';

  const result = await graphql(`
    {
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
          frontmatter {
            title
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panic('Error querying MD pages', result.errors);
    return;
  }

  const templatePath = path.resolve(__dirname, 'src/templates/md-page.tsx');
  const nodes = result.data.allMdx.nodes || [];

  const parseName = (relativePath) => {
    // Supports names like: slug.lang.md or slug.lang.mdx
    const m = relativePath.match(/^(.*?)(?:\.(\w{2}(?:-[A-Za-z]{2})?))?\.(md|mdx)$/);
    if (m) {
      const slug = m[1].split('/').pop();
      const lang = m[2] || GATSBY_DEFAULT_LANGUAGE;
      return { slug, lang };
    }
    const base = relativePath.replace(/\.(md|mdx)$/i, '');
    return { slug: base.split('/').pop(), lang: GATSBY_DEFAULT_LANGUAGE };
  };

  for (const node of nodes) {
    const file = node.parent || {};
    const rel = (file.relativePath || file.name || '').toString();
    const { slug, lang } = parseName(rel);
    const originalPath = `/${slug}/`;
    const localizedPath = lang === GATSBY_DEFAULT_LANGUAGE ? originalPath : `/${lang}${originalPath}`;

    createPage({
      path: localizedPath,
      component: `${templatePath}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        language: lang,
        id: node.id,
        i18n: {
          language: lang,
          languages,
          defaultLanguage: GATSBY_DEFAULT_LANGUAGE,
          originalPath,
          routed: true,
        },
      },
    });
  }
};

exports.onCreateWebpackConfig = onCreateWebpackConfig;
exports.onPreBootstrap = onPreBootstrap;
exports.createSchemaCustomization = createSchemaCustomization;
exports.createResolvers = createResolvers;
exports.createPages = createPages;
