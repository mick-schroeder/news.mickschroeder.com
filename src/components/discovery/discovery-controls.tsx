import { InterestSelector } from "./interest-selector"
import { ShuffleBookmark } from "./shuffle-bookmark"
import { UpNextCard } from "./up-next-card"
import { useDiscovery } from "./use-discovery"
import { translations, type Locale } from "@/i18n/ui"

export function DiscoveryControls({ locale }: { locale: Locale }) {
  const discovery = useDiscovery()
  const t = translations[locale]

  return (
    <div id="discovery-controls" className="contents">
      <UpNextCard locale={locale} discovery={discovery} />
      <section
        className="discovery-section-grid"
        aria-labelledby="interests-title"
      >
        <div className="space-y-1">
          <h2 id="interests-title" className="discovery-section-title">
            {t.interests}
          </h2>
          <p className="discovery-section-subtitle">{t.interestsHint}</p>
        </div>
        <div>
          <InterestSelector
            locale={locale}
            selected={discovery.interests}
            onChange={discovery.selectInterests}
          />
        </div>
      </section>
      <ShuffleBookmark locale={locale} ready={Boolean(discovery.interests)} />
    </div>
  )
}
