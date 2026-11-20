import type { ReactNode } from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

/** The header and footer link rows; `path` marks the current page. */
export function SiteNav({
  links,
  path,
  label,
  className,
  children,
}: {
  links: { href: string; label: string }[]
  path: string
  label: string
  className?: string
  /** Extra items after the links. */
  children?: ReactNode
}) {
  const active = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href)
  return (
    <NavigationMenu aria-label={label} className={cn("max-w-none", className)}>
      <NavigationMenuList className="flex-wrap gap-1">
        {links.map(({ href, label }) => (
          <NavigationMenuItem key={href}>
            <NavigationMenuLink
              href={href}
              active={active(href)}
              className={cn(
                navigationMenuTriggerStyle(),
                "h-8 font-normal text-muted-foreground hover:text-foreground data-active:font-medium data-active:text-foreground"
              )}
            >
              {label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        {children}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
