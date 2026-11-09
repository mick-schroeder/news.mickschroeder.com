const $ = (id) => document.getElementById(id)
const storageKey = "news-shuffle.catalog-review.v1"
const pageSize = 20
const pageButtons = document.querySelectorAll("[data-page-step]")
let workspace
let draft
let editing
let previewed
let page = 0

async function api(path, body) {
  const response = await fetch(
    `/api/${path}`,
    body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
  )
  const result = await response.json()
  if (!response.ok) throw new Error(result.error)
  return result
}

function emptyDraft() {
  return {
    revision: workspace.revision,
    decisions: {},
    checks: {},
    candidates: [],
    feedErrors: [],
    approvedOnly: false,
  }
}

function saveDraft() {
  localStorage.setItem(storageKey, JSON.stringify(draft))
}

function element(tag, text) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  return node
}

function link(value) {
  const url = URL.canParse(value) ? new URL(value) : null
  if (!url || !["http:", "https:"].includes(url.protocol))
    return element("span", value)
  const anchor = element("a", value)
  anchor.href = url.href
  anchor.target = "_blank"
  anchor.rel = "noopener noreferrer"
  return anchor
}

function button(label, onClick) {
  const node = element("button", label)
  node.addEventListener("click", () => onClick(node))
  return node
}

function payload() {
  return {
    revision: draft.revision,
    decisions: Object.values(draft.decisions),
    approvedOnly: draft.approvedOnly,
  }
}

function visibleRows() {
  const updates = new Map(
    draft.candidates
      .filter(({ original }) => original)
      .map((candidate) => [candidate.original, candidate])
  )
  const rows = workspace.sites.map((site) => ({
    key: site.url,
    site,
    original: site.url,
    suggestedTags: updates
      .get(site.url)
      ?.source.tags.filter((tag) => !site.tags.includes(tag)),
    discoveredVia: updates.get(site.url)?.discoveredVia,
  }))
  for (const { source, discoveredVia, original } of draft.candidates) {
    if (!original) rows.push({ key: source.url, site: source, discoveredVia })
  }
  const keys = new Set(rows.map(({ key }) => key))
  for (const [key, decision] of Object.entries(draft.decisions)) {
    if (!keys.has(key) && !decision.original)
      rows.push({ key, site: decision.site })
  }
  return rows
}

function aliasesFor(rows) {
  const groups = new Map()
  for (const { key, site } of rows) {
    const host = new URL(site.url).hostname.replace(/^www\./, "")
    const name = site.name.toLowerCase()
    const finalUrl = draft.checks[site.url]?.finalUrl
    const target = finalUrl && new URL(finalUrl).hostname.replace(/^www\./, "")
    for (const alias of new Set([
      `name:${name}`,
      `host:${host}`,
      ...(target ? [`host:${target}`] : []),
    ])) {
      if (!groups.has(alias)) groups.set(alias, new Set())
      groups.get(alias).add(key)
    }
  }
  const aliases = new Map()
  for (const group of groups.values()) {
    if (group.size < 2) continue
    for (const key of group) {
      if (!aliases.has(key)) aliases.set(key, new Set())
      for (const other of group) if (other !== key) aliases.get(key).add(other)
    }
  }
  return aliases
}

function reachableWithoutAliases(rows, aliases) {
  return rows.filter(
    ({ key, site, original }) =>
      original &&
      !draft.decisions[key] &&
      !aliases.has(key) &&
      draft.checks[site.url]?.issue === "reachable"
  )
}

function render() {
  $("approved-only").checked = draft.approvedOnly
  $("feed-errors").replaceChildren(
    ...draft.feedErrors.map(({ feed, detail }) =>
      element("li", `${feed} · ${detail}`)
    )
  )
  const rows = visibleRows()
  const byKey = new Map(rows.map((row) => [row.key, row.site]))
  const aliases = aliasesFor(rows)
  $("approve-reachable").hidden = !draft.approvedOnly
  $("approve-reachable").disabled = !reachableWithoutAliases(rows, aliases)
    .length
  const query = $("search").value.toLowerCase().trim()
  const filter = $("filter").value
  const filtered = rows.filter(({ key, site, original, discoveredVia }) => {
    const decision = draft.decisions[key]
    const issue = draft.checks[(decision?.site ?? site).url]?.issue
    const searchText = [
      site.name,
      site.url,
      ...site.tags,
      ...(discoveredVia ?? []),
      decision?.site?.name,
      decision?.site?.url,
    ]
      .join(" ")
      .toLowerCase()
    return (
      searchText.includes(query) &&
      (filter === "all" ||
        (filter === "current" && original) ||
        (filter === "current-without-newzit" &&
          original &&
          !(decision?.site ?? site).tags.includes("Newzit")) ||
        (filter === "candidate" && (!original || discoveredVia)) ||
        (filter === "decided" && decision) ||
        (filter === "findings" &&
          ((issue && issue !== "reachable") || aliases.has(key))) ||
        (issue && issue === filter))
    )
  })
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  page = Math.min(page, pages - 1)
  const decisions = Object.keys(draft.decisions).length
  $("summary").textContent =
    `${filtered.length} links · ${decisions} decisions · Page ${page + 1} of ${pages}`
  for (const control of pageButtons) {
    const nextPage = page + Number(control.dataset.pageStep)
    control.disabled = nextPage < 0 || nextPage >= pages
  }
  $("links").replaceChildren(
    ...filtered.slice(page * pageSize, (page + 1) * pageSize).map((row) => {
      const { key, site, original, discoveredVia, suggestedTags } = row
      const decision = draft.decisions[key]
      const displayed = decision?.site ?? site
      const missingTags =
        suggestedTags?.filter((tag) => !displayed.tags.includes(tag)) ?? []
      const check = draft.checks[displayed.url]
      const article = element("article")
      const title = element("h3")
      const icon = element("img")
      icon.alt = ""
      icon.width = icon.height = 24
      icon.loading = "lazy"
      icon.referrerPolicy = "no-referrer"
      icon.src =
        "https://www.google.com/s2/favicons?" +
        new URLSearchParams({
          domain: new URL(displayed.url).hostname,
          sz: "64",
        })
      icon.addEventListener(
        "error",
        () => {
          icon.hidden = true
        },
        { once: true }
      )
      title.append(icon, displayed.name)
      article.append(
        title,
        link(displayed.url),
        element("p", displayed.tags.join(" · "))
      )
      if (original && displayed.url !== original) {
        const previous = element("p", "Previous URL ")
        previous.append(link(original))
        article.append(previous)
      }
      if (check) {
        article.append(
          element(
            "p",
            [check.issue, check.status, check.detail]
              .filter(Boolean)
              .join(" · ")
          )
        )
        if (check.issue === "redirect" && check.finalUrl)
          article.append(link(check.finalUrl))
      }
      if (discoveredVia?.length)
        article.append(
          element(
            "p",
            `Found via ${discoveredVia.map((url) => new URL(url).hostname).join(", ")}`
          )
        )
      if (missingTags.length)
        article.append(
          element("p", `Suggested tags · ${missingTags.join(" · ")}`)
        )
      if (aliases.has(key)) {
        const note = element("p", "Possible matches ")
        for (const other of aliases.get(key)) {
          const match = byKey.get(other)
          const anchor = link(match.url)
          anchor.textContent = `${match.name} (${match.url})`
          note.append(anchor, " · ")
        }
        article.append(note)
      }
      if (decision)
        article.append(
          element(
            "p",
            `Decision · ${{ save: original ? "Keep or update" : "Add", ignore: "Ignore host", remove: "Remove" }[decision.action]}`
          )
        )
      const controls = element("div")
      controls.className = "toolbar"
      if (missingTags.length && decision?.action !== "remove") {
        controls.append(
          button("Stage suggested tags", () =>
            stageDecision(row, "save", {
              ...displayed,
              tags: [...displayed.tags, ...missingTags],
            })
          )
        )
      }
      if (decision?.action !== "save" && (!original || draft.approvedOnly)) {
        controls.append(
          button(original ? "Keep" : "Add", () =>
            stageDecision(row, "save", displayed)
          )
        )
      }
      const redirect = check?.issue === "redirect" && URL.parse(check.finalUrl)
      if (
        redirect &&
        redirect.protocol === "https:" &&
        !redirect.username &&
        !redirect.password
      ) {
        controls.append(
          button("Use redirect URL", () =>
            stageDecision(row, "save", { ...displayed, url: redirect.href })
          )
        )
      }
      if (original && decision?.action !== "remove") {
        controls.append(button("Remove", () => stageDecision(row, "remove")))
      } else if (!original && discoveredVia && decision?.action !== "ignore") {
        controls.append(
          button("Ignore host", () => stageDecision(row, "ignore", site))
        )
      }
      if (decision) {
        controls.append(
          button("Undo decision", () => {
            delete draft.decisions[key]
            saveDraft()
            render()
          })
        )
      }
      controls.append(
        button("Edit", () => edit(row)),
        button("Recheck", (control) =>
          run(
            control,
            async () => {
              draft.checks[displayed.url] = await api("recheck", {
                url: displayed.url,
              })
              saveDraft()
              render()
            },
            "Checking link…"
          )
        )
      )
      article.append(controls)
      return article
    })
  )
}

function edit(row) {
  editing = row
  const site = draft.decisions[row.key]?.site ?? row.site
  const form = $("edit-form")
  form.elements.name.value = site.name
  form.elements.url.value = site.url
  $("save-link").textContent = row.original ? "Stage changes" : "Stage addition"
  $("editor-title").textContent = site.name || "Add a link"
  $("editor-status").textContent = ""
  $("remove").hidden = !row.original
  $("ignore").hidden = Boolean(row.original) || !row.site.url
  $("defer").hidden = !draft.decisions[row.key]
  $("tags").replaceChildren(
    ...workspace.tags.map((tag) => {
      const label = element("label")
      const input = element("input")
      input.type = "checkbox"
      input.name = "tags"
      input.value = tag
      input.checked = site.tags.includes(tag)
      label.append(input, tag)
      return label
    })
  )
  $("editor").showModal()
}

function decide(action, site) {
  $("editor").close()
  stageDecision(editing, action, site)
}

function stageDecision(row, action, site) {
  draft.decisions[row.key] = { action, original: row.original, site }
  saveDraft()
  render()
}

function finishEdit() {
  saveDraft()
  $("editor").close()
  render()
}

async function run(control, task, status, output = $("status")) {
  control.disabled = true
  output.textContent = status
  try {
    output.textContent = (await task()) ?? ""
  } catch (error) {
    output.textContent = error.message
  } finally {
    control.disabled = false
  }
}

async function init() {
  workspace = await api("workspace")
  try {
    draft = JSON.parse(localStorage.getItem(storageKey)) ?? emptyDraft()
  } catch {
    draft = emptyDraft()
  }
  if (workspace.revision !== draft.revision) {
    $("status").textContent =
      "The catalog or ignore list changed. Discard this stale draft to start a new review."
  }
  render()
}

$("approve-reachable").onclick = () => {
  const rows = visibleRows()
  const approved = reachableWithoutAliases(rows, aliasesFor(rows))
  for (const { key, original, site } of approved) {
    draft.decisions[key] = { action: "save", original, site }
  }
  saveDraft()
  render()
  $("status").textContent =
    `Marked ${approved.length} reachable links to keep. Preview the batch to review file changes.`
}

$("audit").onclick = () =>
  run(
    $("audit"),
    async () => {
      const checks = await api("audit", {})
      Object.assign(
        draft.checks,
        Object.fromEntries(checks.map((check) => [check.url, check]))
      )
      $("filter").value = "findings"
      page = 0
      saveDraft()
      render()
      const count = (issue) =>
        checks.filter((check) => check.issue === issue).length
      return `Checked ${checks.length} links · ${count("missing")} missing · ${count("redirect")} redirects · ${count("inconclusive")} inconclusive`
    },
    "Auditing links. This may take a minute…"
  )

$("discover").onclick = () =>
  run(
    $("discover"),
    async () => {
      const { candidates, feedErrors } = await api("discover", {})
      draft.candidates = candidates
      draft.feedErrors = feedErrors
      $("filter").value = "candidate"
      page = 0
      saveDraft()
      render()
      return `Found ${candidates.length} candidates · ${feedErrors.length} source errors`
    },
    "Reading discovery sources…"
  )

$("add").onclick = () =>
  edit({ key: crypto.randomUUID(), site: { name: "", url: "", tags: [] } })
$("filter").onchange = $("search").oninput = () => {
  page = 0
  render()
}
for (const control of pageButtons) {
  control.onclick = () => {
    page += Number(control.dataset.pageStep)
    render()
    $("summary").focus({ preventScroll: true })
    $("summary").scrollIntoView({ block: "start" })
  }
}
$("approved-only").onchange = (event) => {
  draft.approvedOnly = event.target.checked
  saveDraft()
  render()
}
$("reset").onclick = () =>
  run(
    $("reset"),
    async () => {
      if (!confirm("Discard all draft decisions and scan results?")) return
      localStorage.removeItem(storageKey)
      await init()
      return "Draft discarded."
    },
    ""
  )

$("edit-form").onsubmit = (event) => {
  event.preventDefault()
  const fields = new FormData(event.target)
  const site = {
    name: fields.get("name").trim(),
    url: fields.get("url").trim(),
    tags: fields.getAll("tags"),
  }
  const url = URL.canParse(site.url) && new URL(site.url)
  if (
    !site.name ||
    !url ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !site.tags.length
  ) {
    $("editor-status").textContent =
      "Enter a name and an HTTPS URL without credentials, and select at least one interest."
    return
  }
  decide("save", site)
}
$("remove").onclick = () => decide("remove")
$("ignore").onclick = () => decide("ignore", editing.site)
$("defer").onclick = () => {
  delete draft.decisions[editing.key]
  finishEdit()
}
$("cancel-edit").onclick = () => $("editor").close()

$("preview").onclick = () =>
  run(
    $("preview"),
    async () => {
      const batch = payload()
      const changes = await api("preview", batch)
      if (!changes.length) return "There are no file changes in this batch."
      previewed = batch
      $("batch-status").textContent = ""
      $("changes").replaceChildren(
        ...changes.map(({ action, before, after, url }) => {
          const describe = (site) =>
            `${site.name} · ${site.url} · ${site.tags.join(", ")}`
          return element(
            "li",
            [action, before && describe(before), after && describe(after), url]
              .filter(Boolean)
              .join(" → ")
          )
        })
      )
      $("batch").showModal()
    },
    "Validating batch…"
  )
$("cancel-batch").onclick = () => $("batch").close()
$("apply").onclick = () =>
  run(
    $("apply"),
    async () => {
      const changes = await api("apply", previewed)
      localStorage.removeItem(storageKey)
      $("batch").close()
      await init()
      $("status").textContent =
        `Applied ${changes.length} changes. Review the Git diff before publishing.`
    },
    "Applying batch…",
    $("batch-status")
  )

await init().catch((error) => {
  $("status").textContent = error.message
})
