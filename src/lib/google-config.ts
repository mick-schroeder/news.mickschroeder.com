import {
  ADSENSE_CLIENT_ID,
  GA4_MEASUREMENT_ID,
  ADSENSE_SLOT_ID,
  GOOGLE_TAGS_ENABLED,
} from "astro:env/server"

export const adsenseClient = ADSENSE_CLIENT_ID ?? "ca-pub-6344797609391119"
export const adsenseSlot = ADSENSE_SLOT_ID
export const ga4MeasurementId = GA4_MEASUREMENT_ID
export const googleTagsEnabled = import.meta.env.PROD && GOOGLE_TAGS_ENABLED

if (!/^ca-pub-\d{16}$/.test(adsenseClient)) {
  throw new Error("ADSENSE_CLIENT_ID must be a valid ca-pub publisher ID.")
}
if (ga4MeasurementId !== undefined && !/^G-[A-Z0-9]+$/.test(ga4MeasurementId)) {
  throw new Error("GA4_MEASUREMENT_ID must be a valid G- measurement ID.")
}
if (adsenseSlot !== undefined && !/^\d{10}$/.test(adsenseSlot)) {
  throw new Error("ADSENSE_SLOT_ID must be a 10-digit ad unit ID.")
}
if (googleTagsEnabled && !ga4MeasurementId) {
  throw new Error("Set GA4_MEASUREMENT_ID before enabling Google tags.")
}
