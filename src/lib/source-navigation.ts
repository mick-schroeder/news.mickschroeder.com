/**
 * Browsing between source pages without a full page load.
 *
 * Every source is still its own static page (for search engines and shared
 * links). When a visitor moves to the previous or next source, the page is
 * fetched and only #source-page and the per-page head tags are swapped, so the
 * rest of the document — including ads — stays loaded.
 */

const pageSelector = "#source-page"
const sourcePath = /^\/(?:[a-z]{2}\/)?sources\/[^/]+\/$/

// Head tags that change from source to source, matched by position.
const headTags = [
  'meta[name="description"]',
  'link[rel="canonical"]',
  'link[rel="alternate"][hreflang]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
]

const pages = new Map<string, Promise<Document>>()

function load(url: string) {
  let page = pages.get(url)
  if (!page) {
    page = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.text()
      })
      .then((html) => new DOMParser().parseFromString(html, "text/html"))
    page.catch(() => pages.delete(url))
    pages.set(url, page)
  }
  return page
}

const current = () => document.querySelector<HTMLElement>(pageSelector)

function prefetchNeighbours() {
  const { previous, next } = current()?.dataset ?? {}
  for (const url of [previous, next]) if (url) load(url).catch(() => {})
}

function swap(next: Document) {
  const incoming = next.querySelector(pageSelector)
  const page = current()
  if (!incoming || !page) throw new Error("Not a source page")

  // Keep keyboard focus on the arrow the visitor used.
  const focusedRel = (document.activeElement as HTMLElement | null)
    ?.closest(`${pageSelector} a[rel]`)
    ?.getAttribute("rel")

  // Copy rather than move, so the cached page can be shown again (Back/Forward).
  page.replaceWith(document.importNode(incoming, true))
  document.title = next.title

  for (const selector of headTags) {
    const fresh = next.head.querySelectorAll(selector)
    document.head.querySelectorAll(selector).forEach((tag, index) => {
      const source = fresh[index]
      if (!source) return
      for (const name of ["content", "href", "hreflang"]) {
        const value = source.getAttribute(name)
        if (value !== null) tag.setAttribute(name, value)
      }
    })
  }

  // The language menu links to this page in each language.
  const options = next.querySelectorAll<HTMLOptionElement>(
    "#site-language option"
  )
  document
    .querySelectorAll<HTMLOptionElement>("#site-language option")
    .forEach((option, index) => {
      if (options[index]) option.value = options[index].value
    })

  if (focusedRel) {
    current()?.querySelector<HTMLElement>(`a[rel="${focusedRel}"]`)?.focus()
  }
}

async function go(url: string, push = true) {
  let next: Document
  try {
    next = await load(url)
  } catch {
    location.assign(url)
    return
  }
  if (push) history.pushState({ source: true }, "", url)

  try {
    swap(next)
  } catch {
    // Something unexpected: fall back to a normal page load.
    location.assign(url)
    return
  }
  prefetchNeighbours()
}

export function enableSourceNavigation() {
  prefetchNeighbours()

  document.addEventListener("click", (event) => {
    const link = (
      event.target as HTMLElement | null
    )?.closest<HTMLAnchorElement>("a[data-source-nav]")
    if (!link || event.defaultPrevented || event.button !== 0) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    go(link.href)
  })

  // Left and right arrow keys go to the previous and next source.
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.repeat) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const target = event.target as HTMLElement | null
    if (target?.closest("input, select, textarea, [contenteditable]")) return

    const { previous, next } = current()?.dataset ?? {}
    const url =
      event.key === "ArrowLeft"
        ? previous
        : event.key === "ArrowRight"
          ? next
          : undefined
    if (!url) return
    event.preventDefault()
    go(url)
  })

  // Back and forward between sources swap too; anything else reloads.
  history.replaceState({ source: true }, "")
  window.addEventListener("popstate", () => {
    if (sourcePath.test(location.pathname)) go(location.href, false)
    else location.reload()
  })
}
