import * as React from 'react';
import logo from '../images/logo-circle.svg';
import { getSiteConfig } from '../config/getSiteConfig';
import LocalizedLink from './LocalizedLink';

const site = getSiteConfig();

const Logo: React.FC = ({}) => {
  return (
    <span className="inline-flex min-w-0 items-center">
      <LocalizedLink to="/" className="inline-flex min-w-0 items-center">
        <img src={logo} className="h-6 mr-2 shrink-0" alt={`${site.siteName} logo`} />
        <span className="min-w-0 truncate text-sm font-black tracking-normal self-center md:text-xl">
          {site.navbarBrandLabel}
        </span>
      </LocalizedLink>
    </span>
  );
};

export default Logo;
