import React from "react";
import Logo from "../components/logo";
import RedirectButton from "../components/redirect-button";
import { Trans } from "gatsby-plugin-react-i18next";
const SideBar = () => {
  

  return (
    <div className="p-4 md:p-8">
      <div className="flex-col content-center mx-auto text-center">
        <span className="hidden sm:block">
          <Logo showAuthor />
        </span>
        <h2 className="my-2 text-4xl tracking-tight font-extrabold leading-tight text-foreground">
           <Trans i18nKey="headline" />
        </h2>
        <p className="mb-6 font-light text-muted-foreground md:text-lg">
                <Trans i18nKey="tagline" />
        </p>

        <RedirectButton />
      </div>
    </div>
  );
};

export default SideBar;
