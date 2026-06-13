import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson } from './lib/source-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_FILE = path.join(__dirname, '..', 'src/data/sources.json');

const CONCURRENCY = 20;
const TIMEOUT_MS = 8000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; dead-link-checker/1.0; +https://news.mickschroeder.com)';

const checkUrl = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const opts = {
    method: 'HEAD',
    signal: controller.signal,
    redirect: 'follow',
    headers: { 'User-Agent': USER_AGENT },
  };

  try {
    const res = await fetch(url, opts);
    clearTimeout(timer);
    if (res.status === 405) {
      // Site rejected HEAD — retry with GET
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), TIMEOUT_MS);
      try {
        const res2 = await fetch(url, { ...opts, method: 'GET', signal: controller2.signal });
        clearTimeout(timer2);
        return { status: res2.status, ok: res2.ok };
      } catch (err2) {
        clearTimeout(timer2);
        return { status: null, ok: false, error: err2.name === 'AbortError' ? 'timeout' : err2.message };
      }
    }
    return { status: res.status, ok: res.ok };
  } catch (err) {
    clearTimeout(timer);
    return { status: null, ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
};

const runPool = async (tasks, concurrency) => {
  const results = [];
  let i = 0;

  const worker = async () => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
};

const main = async () => {
  const sources = await readJson(SOURCES_FILE);
  console.log(`Checking ${sources.length} sources (${CONCURRENCY} concurrent, ${TIMEOUT_MS / 1000}s timeout)...\n`);

  const tasks = sources.map((source) => async () => {
    const result = await checkUrl(source.url);
    return { source, result };
  });

  const results = await runPool(tasks, CONCURRENCY);

  const dead = [];
  const suspect = [];
  const ok = [];

  for (const { source, result } of results) {
    if (result.ok) {
      ok.push({ source, result });
    } else if (result.error || result.status >= 500) {
      dead.push({ source, result });
    } else {
      // 4xx (except 404/410 which are clearly dead)
      if (result.status === 404 || result.status === 410) {
        dead.push({ source, result });
      } else {
        suspect.push({ source, result });
      }
    }
  }

  if (dead.length) {
    console.log(`DEAD (${dead.length}):`);
    for (const { source, result } of dead) {
      const detail = result.error ?? `HTTP ${result.status}`;
      console.log(`  [${detail}] ${source.name} — ${source.url}`);
    }
    console.log();
  }

  if (suspect.length) {
    console.log(`SUSPECT — may be blocking bots (${suspect.length}):`);
    for (const { source, result } of suspect) {
      console.log(`  [HTTP ${result.status}] ${source.name} — ${source.url}`);
    }
    console.log();
  }

  console.log(`OK: ${ok.length}  Dead: ${dead.length}  Suspect: ${suspect.length}`);

  if (dead.length > 0) process.exit(1);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
