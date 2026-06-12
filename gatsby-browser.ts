import './src/styles/global.css';
import { buildCanonicalWebShuffleUrl, getLegacyListForHostname } from './src/lib/legacy-domains';

export const onClientEntry = () => {
  if (typeof window === 'undefined') return;

  const legacyList = getLegacyListForHostname(window.location.hostname);
  if (!legacyList) return;

  window.location.replace(buildCanonicalWebShuffleUrl(window.location.href, legacyList));
};
