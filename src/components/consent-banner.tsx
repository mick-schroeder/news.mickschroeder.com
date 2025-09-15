import * as React from "react";
import { readConsent, setConsent } from "@/lib/consent";
import { loadAdSense } from "@/lib/adsense";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trans, Link } from "gatsby-plugin-react-i18next";

const ADSENSE_ID = process.env.GATSBY_GOOGLE_ADSENSE_ID as string | undefined;

const ConsentBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(false);
  const [ads, setAds] = React.useState(false);

  // On mount, read current consent and decide if we need to show the banner
  React.useEffect(() => {
    // SSR guard is inside readConsent()
    const c = readConsent();
    if (!c) return;
    const firstTime = !c.analytics && !c.ads; // tweak if you want different logic
    setAnalytics(!!c.analytics);
    setAds(!!c.ads);
    setVisible(firstTime);
  }, []);

  // If user already granted Ads earlier, load AdSense on mount
  React.useEffect(() => {
    const c = readConsent();
    if (c?.ads && ADSENSE_ID) {
      loadAdSense(ADSENSE_ID);
    }
  }, []);

  const handleDecline = () => {
    setConsent("analytics", false);
    setConsent("ads", false);
    setVisible(false);
  };

  const handleSave = () => {
    setConsent("analytics", analytics);
    setConsent("ads", ads);

    // If user granted Ads, load AdSense (only once; helper guards repeat loads)
    if (ads && ADSENSE_ID) {
      loadAdSense(ADSENSE_ID);
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-50 max-w-3xl">
      <Card role="dialog" aria-labelledby="consent-title" className="border border-neutral-200 dark:border-neutral-800 shadow-lg">
        <CardContent className="p-4">
          <h2 id="consent-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            <Trans i18nKey="consent.title">We use cookies</Trans>
          </h2>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
            <Trans i18nKey="consent.body">
              We use cookies to improve your experience. Analytics help us understand usage; Ads enable personalized ads and conversion measurement. You can change this anytime in cookie settings.
            </Trans>
          </p>

          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="consent-analytics"
                  checked={analytics}
                  onCheckedChange={setAnalytics}
                />
                <Label htmlFor="consent-analytics">
                  <Trans i18nKey="consent.analytics">Analytics</Trans>
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch id="consent-ads" checked={ads} onCheckedChange={setAds} />
                <Label htmlFor="consent-ads">
                  <Trans i18nKey="consent.ads">Ads</Trans>
                </Label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleDecline}>
              <Trans i18nKey="consent.decline">Decline</Trans>
            </Button>
            <Button onClick={handleSave}>
              <Trans i18nKey="consent.save">Save</Trans>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAnalytics(true);
                setAds(true);
                setConsent("analytics", true);
                setConsent("ads", true);
                if (ADSENSE_ID) {
                  loadAdSense(ADSENSE_ID);
                }
                setVisible(false);
              }}
            >
              <Trans i18nKey="consent.acceptAll">Accept all</Trans>
            </Button>
          </div>

          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Trans i18nKey="consent.privacy">
              See our <Link to="/privacy">Privacy Policy</Link> for more details.
            </Trans>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentBanner;