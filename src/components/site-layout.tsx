import React from "react";
import { NextSiteProvider } from "./next-site-context";
import Navbar from "./navbar";
import FooterBar from "./footer";

const SiteLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <NextSiteProvider>
    <div className="antialiased bg-background min-h-screen [--nav-h:120px] md:[--nav-h:128px]">
      {/* Body */}
      <div className="h-auto">
        {/* Header */}
        <header className="">
          <Navbar />
        </header>
        {/* Spacer for fixed navbar */}
        <div className="h-[var(--nav-h)]" aria-hidden="true" />

        {/* Content */}
        <main className="container mx-auto px-4 py-4 md:max-w-screen-md lg:max-w-screen-lg">
          {children}
        </main>

        {/* Footer */}
        <FooterBar />
      </div>
    </div>
  </NextSiteProvider>
);

export default SiteLayout;
