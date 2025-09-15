// src/lib/adsense.ts
let injected = false;

export function loadAdSense(client: string, opts?: { nonce?: string }) {
  if (typeof window === "undefined" || !client) return;

  // If script already present (e.g., from a previous route), mark injected.
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
  );
  if (existing) {
    injected = true;
  }

  if (injected) return;

  // Prepare global before the script loads to avoid race conditions
  (window as any).adsbygoogle = (window as any).adsbygoogle || [];

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    client
  )}`;
  s.crossOrigin = "anonymous";
  if (opts?.nonce) s.nonce = opts.nonce;

  // Only mark injected on successful append (keeps us from locking out on errors)
  s.addEventListener("load", () => {
    injected = true;
  });
  s.addEventListener("error", () => {
    // You could log this somewhere; we keep injected = false so a retry is possible
  });

  document.head.appendChild(s);
}