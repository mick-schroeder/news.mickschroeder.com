import type { ReactElement, ReactNode } from "react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { tagLabel, type Tag } from "@/lib/sources"

export type MenuItem<T extends string = string> = { id: T; label: ReactNode }

/** Multi-select menu; nothing selected means any. */
export function FilterMenu<T extends string>({
  trigger,
  children,
  label,
  anyLabel,
  items,
  selected,
  onChange,
  align = "center",
}: {
  trigger: ReactElement
  children: ReactNode
  label: string
  anyLabel: string
  items: MenuItem<T>[]
  selected: T[] | undefined
  onChange: (ids: T[]) => void
  align?: "start" | "center" | "end"
}) {
  const chosen = selected ?? []
  // Keep menu order, so saved ids stay sorted.
  const toggle = (id: T, on: boolean) =>
    onChange(
      items
        .map((item) => item.id)
        .filter((other) => (other === id ? on : chosen.includes(other)))
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} disabled={!selected}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={!chosen.length}
            onCheckedChange={() => onChange([])}
          >
            {anyLabel}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.id}
              checked={chosen.includes(item.id)}
              onCheckedChange={(on) => toggle(item.id, on)}
            >
              {item.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** "news", "news and tech", "news +2"; any when empty. */
export function summary(
  tags: Tag[],
  selected: string[] | undefined,
  any: string,
  and: string,
  lower = false
) {
  const names = (selected ?? [])
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is Tag => Boolean(tag))
    .map((tag) => (lower ? tagLabel(tag).toLowerCase() : tagLabel(tag)))
  if (!names.length) return any
  if (names.length === 2) return `${names[0]} ${and} ${names[1]}`
  return names.length > 2 ? `${names[0]} +${names.length - 1}` : names[0]
}
