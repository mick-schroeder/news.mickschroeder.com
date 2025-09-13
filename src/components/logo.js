//import PropTypes from "prop-types"
import React from "react";
import { Link } from "gatsby";
import logo from "../images/logo.svg";
import { Trans } from "gatsby-plugin-react-i18next";

const Logo = () => {
  return(  
  <Link to="/" className="inline-flex items-center">
          <img
            src={logo}
            className="h-6 mr-2"
            alt={`${<Trans i18nKey="brand" />} Logo`}
          />
          <span className="text-xl font-black tracking-tighter self-center whitespace-nowrap text-foreground">
            {<Trans i18nKey="brand" />}
          </span>
        </Link>
      );
    };
    
    export default Logo;
