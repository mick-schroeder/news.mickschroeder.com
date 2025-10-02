// -----------------------------------------------------------------------------
// Screenshot pipeline for news.mickschroeder.com
// -----------------------------------------------------------------------------
// This script decides when to generate, download, or reuse screenshots for sources.
// Dev: prefers downloading from S3 if available; generates only when missing.
// Prod: uses S3 as cache with a freshness timeout, regenerates stale or missing.
// No placeholders are created; failures are skipped (gallery handles fallbacks).

const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { PuppeteerBlocker, adsAndTrackingLists } = require('@ghostery/adblocker-puppeteer');
const fetch = require('cross-fetch');
const { createScreenshotSlug } = require('./utils/screenshotSlug');

require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const shouldForceRegenerate = process.env.FORCE_REGENERATE === 'true';
const shouldSkipScreenshots = process.env.SKIP_SCREENSHOTS === 'true';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Constants
const BUCKET_NAME = process.env.SCREENSHOT_BUCKET || 'web-shuffle-screenshots';
const SCREENSHOT_PATH = './src/images/screenshots';
const VIEWPORT_WIDTH = Number(process.env.SCREENSHOT_VIEWPORT_WIDTH || 1080);
const VIEWPORT_HEIGHT = Number(process.env.SCREENSHOT_VIEWPORT_HEIGHT || 1920);
const PAGE_NAVIGATION_TIMEOUT = Number(process.env.SCREENSHOT_NAVIGATION_TIMEOUT || 30000);
const WAIT_AFTER_LOAD = Number(process.env.SCREENSHOT_WAIT_AFTER_LOAD || 4000);
const WAIT_FOR_BODY_TIMEOUT = Number(process.env.SCREENSHOT_WAIT_FOR_BODY_TIMEOUT || 15000);
const WAIT_FOR_IMAGES_TIMEOUT = Number(process.env.SCREENSHOT_WAIT_FOR_IMAGES_TIMEOUT || 8000);
const CONCURRENT_PAGES = 4;

const CACHE_TIMEOUT = Number(process.env.SCREENSHOT_CACHE_TIMEOUT_MS || 6 * 60 * 60 * 1000);
const RETRIES = 2;
const HEADLESS_MODE =
  typeof process.env.PUPPETEER_HEADLESS === 'string'
    ? process.env.PUPPETEER_HEADLESS !== 'false'
    : true;
const COLOR_SCHEME = process.env.PUPPETEER_COLOR_SCHEME || 'dark';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

// Create an S3 client or return null if disabled
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

// Ensure screenshot output directory exists
if (!fs.existsSync(SCREENSHOT_PATH)) {
  fs.mkdirSync(SCREENSHOT_PATH, { recursive: true });
}


// Tries to hide cookie/consent overlays using selectors and text matching
async function hideCookieBanners(page, reporter) {
  try {
    await page.evaluate(() => {
      const selectors = [
        '[id*="cookie" i]',
        '[class*="cookie" i]',
        '[class*="message-container" i]',
        '[id*="consent" i]',
        '[class*="consent" i]',
        '[id*="gdpr" i]',
        '[class*="gdpr" i]',
        'button[aria-label*="cookie" i]',
        'button[aria-label*="consent" i]',
        'div[data-testid="cookie-popup"]',
        '[class*="cookie-banner" i]',
        '[class*="cookiebanner" i]',
        '[class*="cookie-modal" i]',
        '[class*="cookie-overlay" i]',
        '[data-testid*="consent" i]',
        '[role="dialog"][aria-label*="cookie" i]',
        '[role="dialog"][aria-labelledby*="cookie" i]',
      ];
      const hidden = new WeakSet();

      const hideElement = (el) => {
        if (!(el instanceof HTMLElement)) return;
        if (hidden.has(el)) return;
        el.setAttribute('data-cookie-hidden', 'true');
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        hidden.add(el);
      };

      const shouldHideByText = (el) => {
        const text = (el.textContent || '').trim().toLowerCase();
        if (!text || text.length > 800) return false;
        const keywords = [
          'cookie',
          'consent',
          'gdpr',
          'privacy',
          'preferences',
          'tracking',
          'agree',
          'manage choices',
          'manage consent',
          'data usage',
        ];
        return keywords.some((word) => text.includes(word));
      };

      const scanElement = (el) => {
        if (!(el instanceof HTMLElement)) return;
        if (hidden.has(el)) return;

        if (
          selectors.some((selector) => {
            try {
              return el.matches(selector);
            } catch (err) {
              return false;
            }
          })
        ) {
          hideElement(el);
          return;
        }

        const styles = window.getComputedStyle(el);
        if (['fixed', 'sticky'].includes(styles.position) || Number(styles.zIndex) > 999) {
          if (shouldHideByText(el)) {
            hideElement(el);
          }
        }
      };

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => scanElement(el));
      });

      document
        .querySelectorAll('div, section, aside, dialog, footer, header')
        .forEach((el) => scanElement(el));

      if (document.body) {
        document.body.style.setProperty('overflow', 'auto', 'important');
        document.body.style.setProperty('position', 'relative', 'important');
      }

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              scanElement(node);
              node.querySelectorAll?.('*').forEach((child) => {
                if (child instanceof HTMLElement) scanElement(child);
              });
            }
          });
        });
      });

      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        window.setTimeout(() => observer.disconnect(), 5000);
      }
    });
  } catch (error) {
    if (reporter && reporter.warn) {
      reporter.warn(`Failed to hide cookie banners: ${error.message}`);
    }
  }
}

// Scrolls down to trigger lazy loading, then scrolls back to top
async function autoScroll(page) {
  await page.evaluate(async () => {
    const scrollableHeight = () =>
      document.documentElement.scrollHeight || document.body.scrollHeight || 0;
    const distance = Math.max(window.innerHeight / 2, 200);
    const maxScroll = scrollableHeight();
    if (maxScroll <= window.innerHeight * 1.2) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    await new Promise((resolve) => {
      let total = 0;
      const step = () => {
        window.scrollBy(0, distance);
        total += distance;
        const currentMax = scrollableHeight();
        if (total >= currentMax - window.innerHeight) {
          window.scrollTo({ top: 0, behavior: 'auto' });
          resolve(null);
          return;
        }
        window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    });
  });
}

// Waits briefly for <img> elements to finish loading
async function waitForImages(page, reporter) {
  try {
    await page.evaluate(async (timeout) => {
      const imgs = Array.from(document.images || []);
      if (!imgs.length) return;

      const loadImage = (img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              const done = () => {
                img.removeEventListener('load', done);
                img.removeEventListener('error', done);
                resolve(null);
              };
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
              window.setTimeout(done, timeout);
            });

      await Promise.race([
        Promise.all(imgs.map(loadImage)),
        new Promise((resolve) => window.setTimeout(resolve, timeout)),
      ]);
    }, WAIT_FOR_IMAGES_TIMEOUT);
  } catch (error) {
    if (reporter && reporter.warn) {
      reporter.warn(`Failed waiting for images: ${error.message}`);
    }
  }
}

// Navigates, stabilizes the page, and saves a screenshot; retries on timeouts
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

      await hideCookieBanners(page, reporter);
      await autoScroll(page).catch(() => {});
      await waitForImages(page, reporter);
      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
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
          reporter.warn(
            `Failed final screenshot for ${slug}: ${screenshotError.message}`
          );
        }
      }
    }
  }

  return success;
}

// Uploads a local screenshot to S3
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

// Checks if the screenshot object exists in S3
async function s3HasObject(slug) {
  if (!s3) return false;
  try {
    await s3.headObject({ Bucket: BUCKET_NAME, Key: `${slug}.webp` }).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') return false;
    throw error;
  }
}

// Checks if the S3 screenshot exists and is fresh within CACHE_TIMEOUT
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

// Decides whether to generate a screenshot (dev uses S3 if possible; prod respects cache)
async function shouldGenerateScreenshot(screenshotFullPath, slug, reporter) {
  if (shouldSkipScreenshots) {
    reporter.log('Skipping screenshot generation because SKIP_SCREENSHOTS=true');
    return false;
  }

  if (shouldForceRegenerate) {
    reporter.log(`FORCE_REGENERATE=true → will generate ${slug}.webp`);
    return true;
  }

  const localExists = fs.existsSync(screenshotFullPath);

  if (isDevelopment) {
    if (localExists) {
      return false; // local file is good enough; stay quiet
    }

    if (s3) {
      const exists = await s3HasObject(slug);
      devHint(
        reporter,
        `[dev] remote screenshot ${exists ? 'found' : 'missing'} for ${slug}.webp`
      );
      return !exists; // generate only when not in S3
    }

    devHint(reporter, `[dev] no S3 configured; generating ${slug}.webp`);
    return true;
  }

  if (isProduction) {
    // Prod policy: honor freshness window in S3; generate when stale/missing
    if (s3) {
      const fresh = await screenshotExistsInS3(slug);
      const decision = !fresh;
      reporter.log(`[prod] S3 fresh within ${CACHE_TIMEOUT}ms? ${fresh} → generate: ${decision}`);
      return decision;
    }
    const decision = !localExists;
    reporter.log(`[prod] S3 unavailable; local exists? ${!decision} → generate: ${decision}`);
    return decision;
  }

  // Fallback for other NODE_ENV
  return !fs.existsSync(screenshotFullPath);
}

// Downloads a screenshot from S3 into ./static/screenshots or makes a placeholder
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
    reporter.warn(`Failed to download ${slug}.webp from S3: ${error.message}`);
  }
}

// Lightweight logging helper (choose info/warn/error; dev can be quieter)
function rlog(reporter, level, msg) {
  if (!reporter) return;
  if (level === 'info' && reporter.info) reporter.info(msg);
  else if (level === 'warn' && reporter.warn) reporter.warn(msg);
  else if (level === 'error' && reporter.error) reporter.error(msg);
  else if (reporter.log) reporter.log(msg);
}
// Extra-verbose hints for development runs
function devHint(reporter, msg) {
  if (reporter && reporter.info) reporter.info(`[devhint] ${msg}`);
}

// Processes a chunk of sources with a single Puppeteer page
async function processChunk(sourcesChunk, browser, reporter, blocker) {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: COLOR_SCHEME }]);
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT, deviceScaleFactor: 2 });
  await page.setDefaultNavigationTimeout(PAGE_NAVIGATION_TIMEOUT);
  await page.setDefaultTimeout(PAGE_NAVIGATION_TIMEOUT);
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
  );
  await page.setBypassCSP(true);
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
      const hash = createScreenshotSlug(edge.url || edge.name, edge.name);
      const screenshotFullPath = path.join(SCREENSHOT_PATH, `${hash}.webp`);
      if (!edge.url) {
        reporter.warn(`Skipping source with missing URL: ${edge.name || hash}`);
        continue;
      }

      let localExists = fs.existsSync(screenshotFullPath);

      if (await shouldGenerateScreenshot(screenshotFullPath, hash, reporter)) {
        try {
          rlog(reporter, 'info', `generate: ${edge.url}`);
          const ok = await generateScreenshot(screenshotFullPath, page, edge.url, hash, reporter);
          if (ok) {
            if (isProduction) {
              await uploadToS3(screenshotFullPath, hash, reporter);
            }
            localExists = true;
          } else {
            rlog(reporter, 'warn', `no screenshot captured for ${edge.url}`);
          }
        } catch (error) {
          reporter.warn(`Failed to generate/upload screenshot for ${edge.url}: ${error.message}`);
        }
      } else if (!localExists && s3) {
        try {
          devHint(reporter, `download from S3 for ${edge.url}`);
          await downloadFromS3(hash, reporter);
          localExists = fs.existsSync(screenshotFullPath);
        } catch (error) {
          rlog(reporter, 'warn', `S3 download failed for ${edge.url} — ${error.message}`);
        }
      } else {
        // No-op: do not create placeholders; gallery handles missing images.
      }
    }
  } finally {
    await page.close().catch(() => {});
  }
}

// Splits sources across workers and runs them in parallel
async function processSources(sources, browser, reporter, blocker) {
  const maxParallel = Math.max(1, Number(CONCURRENT_PAGES) || 1);
  if (!sources.length) return;

  const workerCount = Math.min(maxParallel, sources.length);
  const workerChunks = Array.from({ length: workerCount }, () => []);

  sources.forEach((source, index) => {
    workerChunks[index % workerCount].push(source);
  });

  await Promise.all(
    workerChunks
      .filter((chunk) => chunk.length)
      .map((chunk) => processChunk(chunk, browser, reporter, blocker))
  );
}

// Entry point: loads sources, launches browser, and runs the pipeline
const preProcessSources = async (sourcesInput, reporter) => {
  try {
    if (shouldSkipScreenshots) {
      rlog(reporter, 'info', 'screenshots: SKIP_SCREENSHOTS=true — skipping pre-processing');
      return;
    }

    let sourcesData = [];
    if (Array.isArray(sourcesInput)) {
      sourcesData = sourcesInput;
    } else if (
      sourcesInput &&
      typeof sourcesInput === 'object' &&
      Array.isArray(sourcesInput.sources)
    ) {
      sourcesData = sourcesInput.sources;
    } else if (typeof sourcesInput === 'string') {
      // treat as file path
      try {
        if (!fs.existsSync(sourcesInput)) {
          reporter.warn(`Sources file not found at ${sourcesInput}; skipping screenshots.`);
          return;
        }
        const fileContent = fs.readFileSync(sourcesInput, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sources)) {
          sourcesData = parsed.sources;
        } else if (Array.isArray(parsed)) {
          sourcesData = parsed;
        }
      } catch (err) {
        reporter.error(`Failed to read or parse sources file: ${err.message}`);
        return;
      }
    } else {
      sourcesData = [];
    }

    if (!Array.isArray(sourcesData) || sourcesData.length === 0) {
      reporter.info('No sources found for screenshot generation.');
      return;
    }

    rlog(
      reporter,
      'info',
      `screenshots: processing ${sourcesData.length} sources (env=${NODE_ENV}, s3=${!!s3})`
    );

    let blocker = null;
    try {
      blocker = await PuppeteerBlocker.fromLists(
        fetch,
        [
          ...adsAndTrackingLists,
          'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt',
          'https://secure.fanboy.co.nz/fanboy-annoyance.txt',
        ],
        {
          enableCompression: true,
          config: {
            loadCosmeticFilters: true,
            loadGenericCosmeticsFilters: true,
            loadNetworkFilters: true,
          },
        }
      );
    } catch (error) {
      reporter.warn(`Failed to initialize ad blocker: ${error.message}`);
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: HEADLESS_MODE,
      ignoreHTTPSErrors: true,
      protocolTimeout: PAGE_NAVIGATION_TIMEOUT * 2,
    });

    await processSources(sourcesData, browser, reporter, blocker);

    await browser.close();
  } catch (error) {
    reporter.error('Error loading sources data from JSON:', error);
  }
};

module.exports = {
  preProcessSources,
};
