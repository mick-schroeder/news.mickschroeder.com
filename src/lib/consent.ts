type ConsentCategory = "analytics" | "ads";

interface ConsentState {
  analytics: boolean;
  ads: boolean;
}

const CONSENT_KEY = "gdpr-consent";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return { analytics: false, ads: false };
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored ? JSON.parse(stored) : { analytics: false, ads: false };
  } catch {
    return { analytics: false, ads: false };
  }
}

export function setConsent(category: ConsentCategory, value: boolean) {
  if (typeof window === "undefined") return;
  const current = readConsent();
  const updated = { ...current, [category]: value };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: updated.ads ? "granted" : "denied",
      analytics_storage: updated.analytics ? "granted" : "denied",
    });
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent()[category];
}
