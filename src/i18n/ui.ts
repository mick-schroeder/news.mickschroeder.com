import type { Locale } from "./locales"
export type { Locale } from "./locales"

const en = {
  title: "Mick Schroeder's News Shuffle",
  description: "Discover news sites based on your interests.",
  headline: "Shuffle to the news.",
  skip: "Skip to content",
  language: "Language",
  interests: "Your interests",
  interestsHint: "Choose what you’d like to explore.",
  upNext: "Up next",
  shuffle: "Open",
  opensInNewTab: "opens in a new tab",
  refresh: "New pick",
  ready: "Pick at least one interest.",
  empty: "No sites match. Try other interests.",
  catalogError: "Couldn’t load the sites.",
  retry: "Try again",
  noMatchesTitle: "No matching sites",
  noMatchesHint: "Try choosing another interest below.",
  reloadHint: "Refresh the page to try again.",
  choose: "Choose interests",
  noscript: "Enable JavaScript to shuffle.",
  browse: "Browse all sites",
  browseInterests: "Browse all interests",
  sources: "Sources",
  sourcesHint: "A selection of sites you might discover.",
  clearInterests: "Clear interests",
  bookmark: "Shuffle bookmark",
  bookmarkHint: "Save this link to shuffle with your saved interests.",
  copyBookmark: "Copy bookmark link",
  copyBookmarkHint: "Copy the link and save it as a bookmark.",
  dragBookmark: "Drag to your bookmarks bar.",
  bookmarkCopied: "Link copied.",
  copyBookmarkError: "Couldn’t copy the link.",
  redirecting: "Opening a site…",
  notFound: "Page not found",
  home: "Back to News Shuffle",
  privacy: "Privacy",
  privacyDescription: "How News Shuffle uses browser data.",
  privacyChoices: "Privacy and cookie settings",
  terms: "Terms",
  termsDescription: "Terms for using News Shuffle.",
  allSourcesDescription: "Every site News Shuffle can take you to.",
  allInterests: "Interests",
  allInterestsDescription: "Browse News Shuffle sites by interest.",
  sourceDescription:
    "{name} ({host}) on News Shuffle. Visit the site or browse similar sources.",
  interestDescription: "{label} sites on News Shuffle.",
  visit: "Visit",
  shuffleInterest: "Shuffle {label}",
  previous: "Previous",
  next: "Next",
}

export const translations = {
  en,
  ga: {
    title: "News Shuffle as Gaeilge | Mick Schroeder",
    description: "Aimsigh suíomhanna nuachta de réir do chuid spéiseanna.",
    headline: "Nuacht. Casadh nua.",
    skip: "Léim chuig an ábhar",
    language: "Teanga",
    interests: "Do chuid spéiseanna",
    interestsHint: "Roghnaigh na hábhair ar mhaith leat a fhiosrú.",
    upNext: "An chéad suíomh eile",
    shuffle: "Oscail",
    opensInNewTab: "osclaítear i gcluaisín nua",
    refresh: "Rogha nua",
    ready: "Roghnaigh ábhar amháin ar a laghad.",
    empty:
      "Níl aon suíomh ag teacht leis na roghanna. Bain triail as ábhair eile.",
    catalogError: "Níorbh fhéidir na suíomhanna a lódáil.",
    retry: "Bain triail eile as",
    noMatchesTitle: "Níl aon suíomh ag teacht leis na roghanna",
    noMatchesHint: "Bain triail as ábhar eile thíos.",
    reloadHint: "Athlódáil an leathanach chun triail eile a bhaint as.",
    choose: "Roghnaigh ábhair",
    noscript: "Cumasaigh JavaScript chun suíomh a roghnú go randamach.",
    browse: "Brabhsáil gach suíomh",
    browseInterests: "Brabhsáil gach spéis",
    sources: "Foinsí",
    sourcesHint: "Rogha de na suíomhanna a d’fhéadfá aimsiú.",
    clearInterests: "Glan na spéiseanna",
    bookmark: "Leabharmharc Shuffle",
    bookmarkHint:
      "Sábháil an nasc seo chun suíomh a roghnú de réir do roghanna sábháilte.",
    copyBookmark: "Cóipeáil nasc an leabharmhairc",
    copyBookmarkHint: "Cóipeáil an nasc agus sábháil mar leabharmharc é.",
    dragBookmark: "Tarraing go barra na leabharmharcanna é.",
    bookmarkCopied: "Cóipeáladh an nasc.",
    copyBookmarkError: "Níorbh fhéidir an nasc a chóipeáil.",
    redirecting: "Suíomh á oscailt…",
    notFound: "Níor aimsíodh an leathanach",
    home: "Ar ais chuig News Shuffle",
    privacy: "Príobháideachas",
    privacyDescription:
      "An chaoi a n-úsáideann News Shuffle sonraí brabhsálaí.",
    privacyChoices: "Socruithe príobháideachais agus fianán",
    terms: "Téarmaí",
    termsDescription: "Téarmaí úsáide News Shuffle.",
    allSourcesDescription:
      "Gach suíomh ar féidir le News Shuffle tú a thabhairt chuige.",
    allInterests: "Spéiseanna",
    allInterestsDescription:
      "Brabhsáil suíomhanna News Shuffle de réir spéise.",
    sourceDescription:
      "{name} ({host}) ar News Shuffle. Tabhair cuairt ar an suíomh nó brabhsáil foinsí cosúla.",
    interestDescription: "Suíomhanna {label} ar News Shuffle.",
    visit: "Tabhair cuairt",
    shuffleInterest: "Suíomh randamach: {label}",
    previous: "Roimhe seo",
    next: "Ar aghaidh",
  },
} satisfies Record<Locale, Record<keyof typeof en, string>>

/** Fills {placeholders} in a translation string. */
export function format(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  )
}
