import React from "react";
import { useNextSiteContext } from "./next-site-context";
//import { Link } from "gatsby";
import WebShuffleIcon from "../images/web-shuffle.svg";
import { useStaticQuery, graphql } from "gatsby";
import { Trans } from "gatsby-plugin-react-i18next";

const RedirectButton = () => {
  const { nextSite, refreshNextSite } = useNextSiteContext();

  const handleClick = (event) => {
    event.preventDefault();
    window.open(nextSite, "_blank");
    refreshNextSite();
  };

  return (
    <a
      href="/redirect"
      onClick={handleClick}
      className="
      cursor-pointer inline-flex justify-center items-center py-3 px-5 font-bold 
        text-white rounded-lg transform transition-transform 
        bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 
        focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900 shadow"
    >
      <img
        src={WebShuffleIcon}
        className="w-3.5 h-3.5 mr-2 fill-white"
        alt="Website Icon"
      />
      {<Trans i18nKey="shuffle" />}
    </a>
  );
};

export default RedirectButton;
