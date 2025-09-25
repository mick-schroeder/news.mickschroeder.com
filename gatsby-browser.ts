import type { GatsbyBrowser } from 'gatsby';
import './src/styles/global.css';

export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister().catch(() => {
          // ignore unregister failures; next navigation will retry
        });
      });
    });
  }

  if ('caches' in window) {
    void caches.keys().then((keys) => {
      keys
        .filter((key) => key.includes('gatsby-plugin-offline'))
        .forEach((key) => {
          void caches.delete(key).catch(() => {
            // best effort; ignore failures so app still loads
          });
        });
    });
  }
};
