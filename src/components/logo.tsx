import * as React from 'react';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import logo from '../images/logo-circle.svg';
import LocalizedLink from './LocalizedLink';

const Logo: React.FC = ({}) => {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center">
      <LocalizedLink to="/" className="inline-flex items-center">
        <img src={logo} className="h-6 mr-2" alt={String(t('logo_alt'))} />
        <span className="text-xl font-black tracking-tighter self-center whitespace-nowrap">
          <Trans i18nKey="brand" />
        </span>
      </LocalizedLink>
    </span>
  );
};

export default Logo;
