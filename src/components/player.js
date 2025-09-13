import React from "react";
//import { GatsbyImage } from "gatsby-plugin-image";
import { useNextSiteContext } from "./next-site-context";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
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
        <CardHeader className="p-2 pb-0">
          <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
            <div className="w-9 h-9" aria-hidden="true" />
            <div className="min-w-0 text-center pb-2">
              <CardTitle className="truncate text-sm font-bold text-card-foreground text-center">
                {nextSiteName ? (
                  <a
                    href={nextSite}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {nextSiteName}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Loading…</span>
                )}
              </CardTitle>
              <CardDescription className="mt-0.5">
                {nextSite ? (
                  <Button asChild variant="link" aria-label={`Open site: ${nextSiteName}`} className="h-auto p-0">
                    <a
                      onClick={handleClick}
                      href={nextSite}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center text-primary hover:text-primary truncate"
                    >
                      {nextSite.length > 48 ? nextSite.slice(0, 48) + "..." : nextSite}
                      <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                    </a>
                  </Button>
                ) : (
                  <div className="h-4 w-48 mx-auto rounded bg-muted animate-pulse" />
                )}
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={refreshNextSite}
                    variant="ghost"
                    size="icon"
                    aria-label="Shuffle next site"
                  >
                    <RefreshCw className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Shuffle next site</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default WebShufflePlayer;
