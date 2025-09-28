import React from 'react';
import { useNextSiteContext } from './next-site-context';
import { Trans } from 'gatsby-plugin-react-i18next';
import { Button } from './ui/button';
import { Shuffle } from 'lucide-react';

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
      size="lg"
      className="font-extrabold"
    >
      <Shuffle className="w-3 h-3 mr-2" aria-hidden="true" strokeWidth={2.5} />
      <Trans i18nKey="shuffle" />
    </Button>
  );
};

export default RedirectButton;
