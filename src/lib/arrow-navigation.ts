/** Left and right arrow keys follow the page's previous and next links. */
export function bindArrowNavigation() {
  const main = document.querySelector<HTMLElement>("main[data-previous]")
  if (!main) return
  const { previous, next } = main.dataset

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.repeat) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const target = event.target as HTMLElement | null
    if (target?.closest("input, select, textarea, [contenteditable]")) return

    const destination =
      event.key === "ArrowLeft"
        ? previous
        : event.key === "ArrowRight"
          ? next
          : undefined
    if (!destination) return
    event.preventDefault()
    location.assign(destination)
  })
}
