const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const puppeteer = require('puppeteer');
const { PuppeteerBlocker } = require('@ghostery/adblocker-puppeteer');
const fetch = require('cross-fetch');
const sharp = require('sharp');

require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const shouldForceRegenerate = process.env.FORCE_REGENERATE === 'true';
const shouldSkipScreenshots = process.env.SKIP_SCREENSHOTS === 'true';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Constants
const BUCKET_NAME = process.env.SCREENSHOT_BUCKET || 'web-shuffle-screenshots';
const SCREENSHOT_PATH = './static/screenshots';
const VIEWPORT_WIDTH = Number(process.env.SCREENSHOT_VIEWPORT_WIDTH || 1080);
const VIEWPORT_HEIGHT = Number(process.env.SCREENSHOT_VIEWPORT_HEIGHT || 1920);
const PAGE_NAVIGATION_TIMEOUT = Number(process.env.SCREENSHOT_NAVIGATION_TIMEOUT || 30000);
const WAIT_AFTER_LOAD = Number(process.env.SCREENSHOT_WAIT_AFTER_LOAD || 3000);
const WAIT_FOR_BODY_TIMEOUT = Number(process.env.SCREENSHOT_WAIT_FOR_BODY_TIMEOUT || 15000);
const CACHE_TIMEOUT = 6 * 60 * 60 * 1000;
const RETRIES = 2;
const HEADLESS_MODE = process.env.PUPPETEER_HEADLESS || 'new';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

const resolveS3Client = () => {
  try {
    if (process.env.SKIP_S3 === 'true') return null;

    const explicitCreds =
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          }
        : {};

    const options = {
      region: process.env.AWS_REGION,
      ...explicitCreds,
    };

    return new AWS.S3(options);
  } catch (error) {
    return null;
  }
};

const s3 = resolveS3Client();

function urlHash(input) {
  return crypto.createHash('sha1').update(String(input)).digest('hex').slice(0, 12);
}

// Ensure screenshot output directory exists
if (!fs.existsSync(SCREENSHOT_PATH)) {
  fs.mkdirSync(SCREENSHOT_PATH, { recursive: true });
}

async function generatePlaceholderImage(slug) {
  const screenshotFullPath = path.join(SCREENSHOT_PATH, `${slug}.webp`);

  try {
    await sharp({
      create: {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        channels: 3,
        background: { r: 200, g: 200, b: 200 },
      },
    })
      .webp({})
      .toFile(screenshotFullPath);
  } catch (error) {
    throw new Error(`Failed to generate placeholder image: ${error.message}`);
  }
}

async function generateScreenshot(screenshotFullPath, page, url, slug, reporter) {
  let success = false;

  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      await page.goto(url, {
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: PAGE_NAVIGATION_TIMEOUT,
      });

      await page.waitForFunction(() => document.readyState === 'complete', {
        timeout: WAIT_FOR_BODY_TIMEOUT,
      });

      if (WAIT_AFTER_LOAD > 0) {
        await delay(WAIT_AFTER_LOAD);
      }
      await page.screenshot({
        path: screenshotFullPath,
      });
      success = true;
      break; // Exit loop if screenshot is successful
    } catch (error) {
      if (error.name === 'TimeoutError' && attempt < RETRIES) {
        reporter.warn(`Attempt ${attempt} failed for ${slug}. Error: ${error.message} Retrying...`);
      } else if (attempt === RETRIES) {
        try {
          reporter.warn(
            `Attempt ${attempt} exceeded timeout for ${slug}; capturing current state.`
          );
          await delay(500);
          await page.screenshot({
            path: screenshotFullPath,
          });
          success = true;
          break; // Exit loop if screenshot is successful
        } catch (screenshotError) {
          try {
            await generatePlaceholderImage(slug);
            reporter.warn(
              `Generated placeholder image for ${slug} after failing to capture screenshot. Error: ${error.message}`
            );
          } catch (placeholderError) {
            reporter.error(
              `Failed to generate placeholder image for ${slug}: ${placeholderError.message}`
            );
          }
        }
      }
    }
  }

  return success;
}

async function uploadToS3(filePath, slug, reporter) {
  if (!s3) {
    reporter.warn(`Skipping upload for ${slug}.webp — S3 credentials not configured.`);
    return;
  }
  try {
    const data = fs.readFileSync(filePath);
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${slug}.webp`,
      Body: data,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=604800, immutable',
    };
    await s3.upload(params).promise();
  } catch (error) {
    reporter.warn(`Failed to upload ${slug}.webp to S3: ${error.message}`);
  }
}

async function screenshotExistsInS3(slug) {
  if (!s3) return false;
  try {
    const objectData = await s3
      .headObject({
        Bucket: BUCKET_NAME,
        Key: `${slug}.webp`,
      })
      .promise();
    const lastModifiedDate = new Date(objectData.LastModified);
    const now = new Date();
    return now - lastModifiedDate < CACHE_TIMEOUT;
  } catch (error) {
    if (error.code === 'NotFound') return false;
    throw error;
  }
}

async function shouldGenerateScreenshot(screenshotFullPath, slug, reporter) {
  if (shouldSkipScreenshots) {
    reporter.log('Skipping screenshot generation because SKIP_SCREENSHOTS=true');
    return false;
  }

  if (shouldForceRegenerate) {
    reporter.log(
      `Deciding to generate screenshot - Regenerated ${slug}.webp because shouldForceRegenerate is true `
    );
    return true;
  } else if (isDevelopment) {
    let decision = !fs.existsSync(screenshotFullPath);
    reporter.log(`Generate new screenshot? ${decision}. `);
    return decision;
  } else if (isProduction) {
    if (s3) {
      let decision = !(await screenshotExistsInS3(slug));
      reporter.log(`Generate new screenshot? ${decision}. `);
      return decision;
    }
    const decision = !fs.existsSync(screenshotFullPath);
    reporter.log(
      `Generate new screenshot? (fallback to local file check because S3 is unavailable) ${decision}.`
    );
    return decision;
  }

  return !fs.existsSync(screenshotFullPath);
}

async function downloadFromS3(slug, reporter) {
  if (!s3) {
    reporter.warn('Skipping S3 download because credentials are not configured.');
    return;
  }
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${slug}.webp`,
    };
    const stream = require('stream');
    const util = require('util');
    const pipeline = util.promisify(stream.pipeline);
    const s3Stream = s3.getObject(params).createReadStream();
    const fileWriteStream = fs.createWriteStream(`${SCREENSHOT_PATH}/${slug}.webp`);
    await pipeline(s3Stream, fileWriteStream);
  } catch (error) {
    try {
      await generatePlaceholderImage(slug);
    } catch (e) {
      reporter.warn(`Also failed to generate placeholder for ${slug}: ${e.message}`);
    }
    reporter.warn(`Failed to download ${slug}.webp from S3: ${error.message}`);
  }
}

async function processChunk(sourcesChunk, browser, reporter, blocker) {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
  await page.setDefaultNavigationTimeout(PAGE_NAVIGATION_TIMEOUT);
  await page.setDefaultTimeout(PAGE_NAVIGATION_TIMEOUT);
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
  );
  page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));

  if (blocker) {
    try {
      await blocker.enableBlockingInPage(page);
    } catch (e) {
      if (reporter && reporter.warn) reporter.warn(`Failed to enable ad blocker: ${e.message}`);
    }
  }

  try {
    for (const edge of sourcesChunk) {
      const hash = urlHash(edge.url || edge.name);
      const screenshotFullPath = path.join(SCREENSHOT_PATH, `${hash}.webp`);
      if (!edge.url) {
        reporter.warn(`Skipping source with missing URL: ${edge.name || hash}`);
        continue;
      }

      if (await shouldGenerateScreenshot(screenshotFullPath, hash, reporter)) {
        try {
          reporter.log(`Generating screenshot for ${edge.url}.`);
          const ok = await generateScreenshot(screenshotFullPath, page, edge.url, hash, reporter);
          if (ok && isProduction) {
            await uploadToS3(screenshotFullPath, hash, reporter);
          }
        } catch (error) {
          reporter.warn(`Failed to generate/upload screenshot for ${edge.url}: ${error.message}`);
        }
      } else if (isProduction && s3) {
        try {
          reporter.log(`Downloading existing screenshot for ${edge.url} from S3.`);
          await downloadFromS3(hash, reporter);
        } catch (error) {
          reporter.warn(`Failed to download screenshot for ${edge.url} from S3: ${error.message}`);
        }
      } else {
        // Local fallback: ensure placeholder exists so Gatsby image pipeline has a file.
        if (!fs.existsSync(screenshotFullPath)) {
          await generatePlaceholderImage(hash);
        }
      }
    }
  } finally {
    await page.close().catch(() => {});
  }
}

async function processSources(sources, CONCURRENT_PAGES, browser, reporter, blocker) {
  // Chunk your sources
  const sourceChunks = [];
  for (let i = 0; i < sources.length; i += CONCURRENT_PAGES) {
    sourceChunks.push(sources.slice(i, i + CONCURRENT_PAGES));
  }

  // Use Promise.all to process each chunk concurrently
  for (const chunk of sourceChunks) {
    await processChunk(chunk, browser, reporter, blocker);
  }
}

const preProcessSources = async (JSON_PATH, CONCURRENT_PAGES, reporter) => {
  try {
    if (shouldSkipScreenshots) {
      reporter.info('SKIP_SCREENSHOTS=true – skipping screenshot pre-processing.');
      return;
    }

    if (!fs.existsSync(JSON_PATH)) {
      reporter.warn(`Sources file not found at ${JSON_PATH}; skipping screenshots.`);
      return;
    }

    const sourcesData = require(JSON_PATH); // Load sources data from JSON

    if (!Array.isArray(sourcesData) || sourcesData.length === 0) {
      reporter.info('No sources found for screenshot generation.');
      return;
    }

    console.log(
      '\nI have gotten the task of taking screenshots of ' + sourcesData.length + ' Sources'
    );

    let blocker = null;
    try {
      blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
    } catch (error) {
      reporter.warn(`Failed to initialize ad blocker: ${error.message}`);
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: HEADLESS_MODE,
      ignoreHTTPSErrors: true,
      protocolTimeout: PAGE_NAVIGATION_TIMEOUT * 2,
    });

    await processSources(sourcesData, CONCURRENT_PAGES, browser, reporter, blocker);

    await browser.close();
  } catch (error) {
    reporter.error('Error loading sources data from JSON:', error);
  }
};

module.exports = {
  preProcessSources,
};
