import React from 'react';
import { NextSiteProvider } from './next-site-context';
import { SourceCategoryProvider } from './context/SourceCategoryContext';
import Navbar from './navbar';
import FooterBar from './footer';

const SiteLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <SourceCategoryProvider>
    <NextSiteProvider>
      <div className="antialiased bg-background min-h-screen [--nav-h:120px] md:[--nav-h:128px]">
        {/* Body */}
        <div className="h-auto">
          {/* Header */}
          <header className="">
            <Navbar />
          </header>
          <div className="hidden md:block h-[var(--nav-h)]" aria-hidden="true" />
          {/* Content */}
          <main className="container mx-auto px-4 py-4 md:max-w-screen-md lg:max-w-screen-lg">
            {children}
          </main>

          {/* Footer */}
          <FooterBar />
        </div>
      </div>
    </NextSiteProvider>
  </SourceCategoryProvider>
);

export default SiteLayout;
