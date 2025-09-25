declare module '*.svg' {
  import type * as React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module './processSources' {
  import type { Reporter } from 'gatsby';
  export function preProcessSources(
    jsonPath: string,
    concurrency: number,
    reporter: Reporter
  ): Promise<void>;
}

declare module './processSources.js' {
  import type { Reporter } from 'gatsby';
  export function preProcessSources(
    jsonPath: string,
    concurrency: number,
    reporter: Reporter
  ): Promise<void>;
}
