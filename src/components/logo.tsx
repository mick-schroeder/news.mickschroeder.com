import * as React from 'react';
import logo from '../images/logo-circle.svg';
import { getSiteConfig } from '../config/getSiteConfig';
import LocalizedLink from './LocalizedLink';

const site = getSiteConfig();

const Logo: React.FC = ({}) => {
  return (
    <span className="inline-flex items-center">
      <LocalizedLink to="/" className="inline-flex items-center">
        <img src={logo} className="h-6 mr-2" alt={`${site.siteName} logo`} />
        <span className="text-md md:text-xl font-black tracking-tighter self-center whitespace-nowrap">
          {site.navbarBrandLabel}
        </span>
      </LocalizedLink>
    </span>
  );
};

export default Logo;
