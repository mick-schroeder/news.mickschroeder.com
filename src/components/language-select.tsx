import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { Locale } from "@/i18n/locales"

export function LanguageSelect({
  label,
  currentUrl,
  options,
}: {
  label: string
  currentUrl: string
  options: { code: Locale; label: string; url: string }[]
}) {
  return (
    <NativeSelect
      defaultValue={currentUrl}
      id="site-language"
      aria-label={label}
      autoComplete="off"
    >
      {options.map(({ code, label, url }) => (
        <NativeSelectOption key={code} lang={code} value={url}>
          {label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
