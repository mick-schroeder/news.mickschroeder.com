import React from 'react';
import { NextSiteProvider } from './context/next-site-context';
import { SourceFilterProvider } from './context/source-filter-context';
import Navbar from './navbar';
import FooterBar from './footer';

const SiteLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <SourceFilterProvider>
    <NextSiteProvider>
      <div className="relative isolate min-h-screen overflow-hidden antialiased">
        <div className="flex min-h-screen flex-col">
          <header>
            <Navbar />
          </header>
          <main className="container mx-auto flex-1 px-4 py-4 md:max-w-screen-md lg:max-w-screen-lg">
            {children}
          </main>
          <FooterBar />
        </div>
      </div>
    </NextSiteProvider>
  </SourceFilterProvider>
);

export default SiteLayout;
