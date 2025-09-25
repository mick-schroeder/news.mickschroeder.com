import type { Reporter } from 'gatsby';

export declare function preProcessSources(
  jsonPath: string,
  concurrency: number,
  reporter: Reporter
): Promise<void>;
