import { useRef } from "react"
import { InterestSelector } from "./interest-selector"
import { ShuffleBookmark } from "./shuffle-bookmark"
import { UpNextCard } from "./up-next-card"
import { useDiscovery } from "./use-discovery"
import { translations, type Locale } from "@/i18n/ui"

export function DiscoveryControls({ locale }: { locale: Locale }) {
  const discovery = useDiscovery()
  const interestsHeading = useRef<HTMLHeadingElement>(null)

  function chooseInterests() {
    const heading = interestsHeading.current
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView({ block: "start" })
  }

  return (
    <div id="discovery-controls" className="contents">
      <UpNextCard
        locale={locale}
        discovery={discovery}
        onChooseInterests={chooseInterests}
      />
      <section
        className="discovery-section-grid border-t border-border py-8"
        aria-labelledby="interests-title"
      >
        <div>
          <h2
            id="interests-title"
            ref={interestsHeading}
            tabIndex={-1}
            className="w-fit scroll-mt-8 rounded-sm text-xl font-bold tracking-tight text-foreground"
          >
            {translations[locale].interests}
          </h2>
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
