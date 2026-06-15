import React from 'react';
import { NextSiteProvider } from './context/next-site-context';
import { SourceFilterProvider } from './context/source-filter-context';
import Navbar from './navbar';
import NowPlayingBar from './now-playing-bar';
import FooterBar from './footer';
import { cn } from '@/lib/utils';

type SiteLayoutProps = React.PropsWithChildren<{
  fullWidthMain?: boolean;
}>;

const SiteLayout: React.FC<SiteLayoutProps> = ({ children, fullWidthMain }) => (
  <SourceFilterProvider>
    <NextSiteProvider>
      <div className="relative isolate min-h-screen overflow-hidden antialiased">
        <div className="flex min-h-screen flex-col">
          <header>
            <Navbar />
          </header>
          <NowPlayingBar />
          <main
            className={cn(
              'flex-1',
              !fullWidthMain &&
                'container mx-auto px-4 py-4 md:max-w-screen-md lg:max-w-screen-lg'
            )}
          >
            {children}
          </main>
          <FooterBar />
        </div>
      </div>
    </NextSiteProvider>
  </SourceFilterProvider>
);

export default SiteLayout;
