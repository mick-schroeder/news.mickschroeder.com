const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const sharp = require('sharp');

require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const shouldForceRegenerate = process.env.FORCE_REGENERATE === 'true';
const shouldSkipScreenshots = process.env.SKIP_SCREENSHOTS === 'true';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Constants
const BUCKET_NAME = process.env.SCREENSHOT_BUCKET || 'web-shuffle-screenshots';
const SCREENSHOT_PATH = './static/screenshots';

const SCREENSHOT_QUALITY = Number(process.env.SCREENSHOT_QUALITY || 80);
const VIEWPORT_WIDTH = Number(process.env.SCREENSHOT_VIEWPORT_WIDTH || 1080);
const VIEWPORT_HEIGHT = Number(process.env.SCREENSHOT_VIEWPORT_HEIGHT || 1920);
const PAGE_NAVIGATION_TIMEOUT = Number(process.env.SCREENSHOT_NAVIGATION_TIMEOUT || 30000);
const WAIT_AFTER_LOAD = Number(process.env.SCREENSHOT_WAIT_AFTER_LOAD || 3000);
const WAIT_FOR_BODY_TIMEOUT = Number(process.env.SCREENSHOT_WAIT_FOR_BODY_TIMEOUT || 15000);
const WAIT_FOR_IMAGES_TIMEOUT = Number(process.env.SCREENSHOT_WAIT_FOR_IMAGES_TIMEOUT || 5000);
const SCROLL_STEP = Number(process.env.SCREENSHOT_SCROLL_STEP || 600);
const SCROLL_PAUSE = Number(process.env.SCREENSHOT_SCROLL_PAUSE || 200);
const CONSENT_TEXT_MATCHES = (process.env.SCREENSHOT_CONSENT_TEXTS ||
  'accept,agree,consent,got it,continue,allow all,allow cookies,accept all,accept cookies,yes i agree,ok,got it!,save and exit'
)
  .split(',')
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);

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

async function primeLazyMedia(page) {
  try {
    await page.evaluate(
      async ({ step, pause }) => {
        const delayFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const maxScroll = Math.max(
          document.body ? document.body.scrollHeight : 0,
          document.documentElement ? document.documentElement.scrollHeight : 0,
          window.innerHeight
        );

        const safeStep = Number.isFinite(step) && step > 0 ? step : 600;
        const safePause = Number.isFinite(pause) && pause >= 0 ? pause : 200;

        for (let y = 0; y < maxScroll; y += safeStep) {
          window.scrollTo(0, y);
          await delayFn(safePause);
        }
        window.scrollTo(0, 0);
      },
      { step: SCROLL_STEP, pause: SCROLL_PAUSE }
    );
  } catch (error) {
    // Best-effort scroll; ignore failures
  }

  try {
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });
  } catch (error) {
    // ignore font readiness errors
  }

  try {
    await page.waitForFunction(
      () =>
        Array.from(document.images || []).every((img) => {
          if (!img) return true;
          if (!img.complete) return false;
          if (typeof img.naturalWidth === 'number' && img.naturalWidth === 0) return false;
          if (typeof img.naturalHeight === 'number' && img.naturalHeight === 0) return false;
          return true;
        }),
      { timeout: WAIT_FOR_IMAGES_TIMEOUT }
    );
  } catch (error) {
    // Ignore timeout; some sites lazy load endlessly
  }
}

async function dismissConsentModals(page, reporter, slug) {
  const frames = page.frames();
  const attemptClick = async (frame) => {
    try {
      return await frame.evaluate((texts) => {
        const candidates = Array.from(
          document.querySelectorAll(
            'button, [role="button"], input[type="button"], input[type="submit"], a[role="button"], a.consent-accept'
          )
        );
        for (const el of candidates) {
          if (!el || typeof el.click !== 'function') continue;
          const label =
            (el.innerText || el.textContent || el.getAttribute('aria-label') || el.value || '')
              .replace(/\s+/g, ' ')
              .trim()
              .toLowerCase();
          if (!label) continue;
          if (texts.some((text) => label.includes(text))) {
            el.click();
            return true;
          }
        }
        return false;
      }, CONSENT_TEXT_MATCHES);
    } catch (error) {
      return false;
    }
  };

  for (const frame of frames) {
    const clicked = await attemptClick(frame);
    if (clicked) {
      if (reporter && slug) {
        reporter.log(`Dismissed consent modal for ${slug}.`);
      }
      return true;
    }
  }

  try {
    await page.addStyleTag({
      content:
        '[data-testid*="cookie"], [id*="cookie"], [class*="cookie"], .fc-consent-root, #sp_message_container_318103, .qc-cmp2-container, .qc-cmp2-summary-buttons, .js-consent-banner { display: none !important; visibility: hidden !important; }',
    });
  } catch (error) {
    // ignore style injection failures
  }

  return false;
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
      .webp({ quality: SCREENSHOT_QUALITY })
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

      await dismissConsentModals(page, reporter, slug);
      await primeLazyMedia(page);

      await page.screenshot({
        path: screenshotFullPath,
        quality: SCREENSHOT_QUALITY,
      });
      success = true;
      break; // Exit loop if screenshot is successful
    } catch (error) {
      if (error.name === 'TimeoutError' && attempt < RETRIES) {
        reporter.warn(`Attempt ${attempt} failed for ${slug}. Error: ${error.message} Retrying...`);
      } else if (attempt === RETRIES) {
        try {
          reporter.warn(`Attempt ${attempt} exceeded timeout for ${slug}; capturing current state.`);
          await dismissConsentModals(page, reporter, slug);
          await delay(500);
          await page.screenshot({
            path: screenshotFullPath,
            quality: SCREENSHOT_QUALITY,
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
    reporter.log(`Generate new screenshot? (local file doesn't exist) - ${decision}. `);
    return decision;
  } else if (isProduction) {
    if (s3) {
      let decision = !(await screenshotExistsInS3(slug));
      reporter.log(`Generate new screenshot? (not in S3) ${decision}. `);
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

async function processChunk(sourcesChunk, browser, reporter) {
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

async function processSources(sources, CONCURRENT_PAGES, browser, reporter) {
  // Chunk your sources
  const sourceChunks = [];
  for (let i = 0; i < sources.length; i += CONCURRENT_PAGES) {
    sourceChunks.push(sources.slice(i, i + CONCURRENT_PAGES));
  }

  // Use Promise.all to process each chunk concurrently
  await Promise.all(sourceChunks.map((chunk) => processChunk(chunk, browser, reporter)));
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

    puppeteer.use(StealthPlugin());
    puppeteer.use(
      AdblockerPlugin({
        blockTrackers: true,
        blockTrackersAndAnnoyances: true,
      })
    );

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: HEADLESS_MODE,
      ignoreHTTPSErrors: true,
      protocolTimeout: PAGE_NAVIGATION_TIMEOUT * 2,
    });

    await processSources(sourcesData, CONCURRENT_PAGES, browser, reporter);

    await browser.close();
  } catch (error) {
    reporter.error('Error loading sources data from JSON:', error);
  }
};

module.exports = {
  preProcessSources,
};
