import React from 'react';
import { NextSiteProvider } from './next-site-context';
import { SourceCategoryProvider } from './context/SourceCategoryContext';
import Navbar from './navbar';
import FooterBar from './footer';

const SiteLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <SourceCategoryProvider>
    <NextSiteProvider>
      <div className="relative isolate min-h-screen overflow-hidden bg-background antialiased [--nav-h:120px] md:[--nav-h:128px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        >
          <div className="absolute left-[-20%] top-[-15%] h-[40vh] w-[60vw] rounded-full bg-primary/25 blur-3xl sm:h-[55vh] sm:w-[55vw]" />
          <div className="absolute right-[-15%] top-1/3 hidden h-[45vh] w-[55vw] rounded-full bg-emerald-400/20 blur-[140px] dark:bg-emerald-500/20 sm:block" />
          <div className="absolute left-1/2 bottom-[-20%] h-[50vh] w-[70vw] -translate-x-1/2 rounded-full bg-sky-400/20 blur-[150px] dark:bg-sky-500/25 sm:h-[60vh] sm:w-[65vw]" />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-gradient-to-br from-background via-background/70 to-background"
        />

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
