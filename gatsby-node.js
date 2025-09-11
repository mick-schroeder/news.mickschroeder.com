const path = require("path");
const fs = require("fs");
const { preProcessSources } = require("./processSources.js");
const { onPreBootstrap } = require("gatsby");
const crypto = require("crypto");

const { report } = require("process");

require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const shouldForceRegenerate = process.env.FORCE_REGENERATE === "true";

// Constants
const JSON_PATH = "./src/data/sources.json";
const SCREENSHOT_PATH = "./static/screenshots"; // generated screenshots live here
const CONCURRENT_PAGES = 5;

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

exports.onPreBootstrap = async ({ reporter }) => {
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
  crypto.createHash("sha1").update(String(input)).digest("hex").slice(0, 12);

// 1) Declare explicit types so Gatsby won’t infer from JSON
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type SourcesJson implements Node @dontInfer {
      name: String!
      url: String!
      locale: [String]
      score: String
      # Derived fields (not in your JSON)
      hash: String
      screenshot: File @link
    }
  `);
};

// 2) Resolve derived fields: hash + link to File in /static/screenshots
exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    SourcesJson: {
      locale: {
        resolve(source) {
          const loc = source.locale;
          if (Array.isArray(loc)) return loc;
          if (typeof loc === "string" && loc) return [loc];
          return [];
        },
      },
      hash: {
        resolve(source) {
          return hashOf(source.url || source.name || "");
        },
      },
      screenshot: {
        async resolve(source, args, context) {
          const hash = hashOf(source.url || source.name || "");
          return context.nodeModel.findOne({
            type: "File",
            query: {
              filter: {
                sourceInstanceName: { eq: "screenshots" },
                base: { eq: `${hash}.webp` },
              },
            },
          });
        },
      },
    },
  });
};