import React from "react";
import { NextSiteProvider } from "./next-site-context";
import Navbar from "./navbar";
import FooterBar from "./footer";

const SiteLayout = ({ children }) => (
  <NextSiteProvider>
    <div className="antialiased bg-background min-h-screen">
     
      {/* Body */}
      <div className="h-auto md:pt-20">
        {/* Header */}
        <header className="">
          <Navbar />
        </header>

        {/* Content */}
        <main className="p-4 md:mt-20 lg:mt-5 md:p-2 sm:mx-10 md:mx-auto container md:max-w-screen-md lg:max-w-screen-lg">
          {children}
        </main>

        {/* Footer */}
        <FooterBar />
      </div>
    </div>
  </NextSiteProvider>
);

export default SiteLayout;
