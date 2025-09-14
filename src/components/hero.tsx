import React from "react";
import Logo from "../components/logo";
import { Button } from "./ui/button";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import RedirectButton from "../components/redirect-button";
import { Trans } from "gatsby-plugin-react-i18next";
const SideBar = () => {
  

  return (
    <div className="p-4 md:p-8">
      <div className="flex-col content-center mx-auto text-center">
         <Badge
          variant="secondary"
          className="rounded-full py-2 px-6 border-border"
          asChild
        >
          <Logo showAuthor />
        </Badge>
        <h2 className="my-2 text-4xl sm:text-5xl md:text-6xl tracking-tight font-extrabold leading-[1.15] md:leading-[1.05] text-foreground">
           <Trans i18nKey="headline" />
        </h2>
        <p className="mb-6 text-muted-foreground md:text-lg">
                <Trans i18nKey="tagline" />
        </p>
        <div className="flex items-center justify-center gap-4">
          <RedirectButton />
          <Button asChild variant="outline" size="lg">
            <a href="#sources-gallery">
              <Newspaper className="h-5 w-5" /> <Trans i18nKey="sources" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
