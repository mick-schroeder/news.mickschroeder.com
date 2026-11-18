import { useEffect, useState } from "react"
import { Check, Link, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type State = "idle" | "copied" | "failed"

export function CopyLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<State>("idle")

  useEffect(() => {
    if (state === "idle") return
    const timer = setTimeout(() => setState("idle"), 2000)
    return () => clearTimeout(timer)
  }, [state])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setState("copied")
    } catch {
      setState("failed")
    }
  }

  const Icon = { idle: Link, copied: Check, failed: X }[state]
  return (
    <Button variant="outline" size="lg" onClick={copy}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      <span aria-live="polite">
        {
          { idle: "Copy link", copied: "Copied", failed: "Couldn't copy" }[
            state
          ]
        }
      </span>
    </Button>
  )
}
