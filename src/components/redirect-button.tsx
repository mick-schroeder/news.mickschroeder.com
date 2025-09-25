import React from 'react';
import { useNextSiteContext } from './next-site-context';
import WebShuffleIcon from '../images/web-shuffle.svg';
import { Trans } from 'gatsby-plugin-react-i18next';
import { Button } from './ui/button';

const RedirectButton: React.FC = () => {
  const { nextSite, refreshNextSite } = useNextSiteContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.open(nextSite, '_blank');
    refreshNextSite();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      className="text-foreground inline-flex items-center py-3 px-5 font-bold shadow cursor-pointer"
    >
      <img src={WebShuffleIcon} className="w-3.5 h-3.5 mr-2" alt="Website Icon" />
      <Trans i18nKey="shuffle" />
    </Button>
  );
};

export default RedirectButton;
