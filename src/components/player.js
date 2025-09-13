import React from "react";
//import { GatsbyImage } from "gatsby-plugin-image";
import { useNextSiteContext } from "./next-site-context";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ExternalLink, RefreshCw } from "lucide-react";

//import { Link } from "gatsby";

const WebShufflePlayer = () => {
  const {
    nextSite,
    nextSiteName,
    //nextSiteSlug,
    refreshNextSite,
    //nextSiteDescription,
    // nextSiteImage,
  } = useNextSiteContext();

  const handleClick = (event) => {
    event.preventDefault();
    window.open(nextSite, "_blank");
    refreshNextSite();
  };

  return (
    <div className="flex items-center justify-center px-2 shrink-0">
      <Card className="backdrop-blur w-[320px] sm:w-[420px] md:w-[520px] lg:w-[640px]">
        <CardContent className="p-2">
          <div className="flex flex-col items-center w-full">
          <h2 className="truncate text-sm text-center font-bold text-card-foreground">
            <a
              href={nextSite}
              target="_blank"
              rel="noopener"
              className="truncate line-clamp-1"
            >
              {nextSiteName}
            </a>
          </h2>
          <p className="text-xs font-semibold text-muted-foreground">
            <Button asChild variant="link" aria-label={`Open site: ${nextSiteName}`}>
              <a
                onClick={handleClick}
                href={nextSite}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center text-primary hover:text-primary"
              >
                {nextSite.length > 32 ? nextSite.slice(0, 32) + "..." : nextSite}
                <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
              </a>
            </Button>
          </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between items-start mx-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={refreshNextSite}
                variant="ghost"
                size="icon"
                aria-label="Refresh next site"
              >
                <RefreshCw className="w-6 h-6 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Shuffle next site</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default WebShufflePlayer;
