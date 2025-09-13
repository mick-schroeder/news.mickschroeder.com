//import PropTypes from "prop-types"
import React from "react";
import { Link } from "gatsby";
import logo from "../images/logo.svg";
import { Trans } from "gatsby-plugin-react-i18next";

type LogoProps = { showAuthor?: boolean };

const Logo = ({ showAuthor = false }: LogoProps) => {
  return (
    <Link to="/" className="inline-flex items-center">
      <img
        src={logo}
        className="h-6 mr-2"
        alt="Logo"
      />
      <span className="text-xl font-black tracking-tighter self-center whitespace-nowrap text-foreground">
        <Trans i18nKey="brand" />
        {showAuthor && (
          <>
            &nbsp;
            <span className="text-foreground/80 font-medium">
              <Trans i18nKey="by_author" />
            </span>
          </>
        )}
      </span>
    </Link>
  );
};
    
    export default Logo;
