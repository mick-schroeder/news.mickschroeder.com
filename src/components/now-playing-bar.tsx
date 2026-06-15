import * as React from 'react';
import ShufflePlayer from './player';
import RedirectButton from './redirect-button';
import { SourceFilterControls } from './source-filter-controls';

const NowPlayingBar: React.FC = () => (
  <div className="md:sticky md:top-16 z-40 w-full border-b border-navbar-border bg-navbar/90 backdrop-blur supports-[backdrop-filter]:bg-navbar/70">
    <div className="mx-auto max-w-screen-2xl px-4 py-2">
      <div className="grid gap-2 lg:grid-cols-[minmax(380px,auto)_minmax(280px,1fr)_auto] lg:items-center">
        <SourceFilterControls className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:flex lg:flex-nowrap lg:justify-start" />
        <ShufflePlayer className="min-w-0" />
        <RedirectButton className="h-11 min-w-[150px] px-5 py-2 text-sm sm:w-full sm:px-5 sm:text-sm lg:w-auto" />
      </div>
    </div>
  </div>
);

export default NowPlayingBar;
