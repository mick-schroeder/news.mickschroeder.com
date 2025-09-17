import './src/styles/global.css';

export const onClientEntry = () => {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => {
          // ignore unregister failures; next navigation will retry
        });
      });
    });
  }

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys
        .filter((key) => key.includes('gatsby-plugin-offline'))
        .forEach((key) => {
          caches.delete(key).catch(() => {
            // best effort; ignore failures so app still loads
          });
        });
    });
  }
};
