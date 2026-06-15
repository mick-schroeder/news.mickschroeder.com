import * as React from 'react';
import LocalizedLink from './LocalizedLink';
import { TAG_CONFIG } from '@/config/tag-config';
import { cn } from '@/lib/utils';

export type SidebarTag = { name: string; count: number; path: string };
export type SidebarList = { id: string; name: string; count: number; path: string };

type SourceBrowserSidebarProps = {
  tags: SidebarTag[];
  lists: SidebarList[];
  activeTag?: string;
  activeList?: string;
};

const SourceBrowserSidebar = ({
  tags,
  lists,
  activeTag,
  activeList,
}: SourceBrowserSidebarProps): JSX.Element => (
  <nav aria-label="Browse sources" className="flex flex-col gap-1 p-3">
    <p className="mb-1 mt-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Tags
    </p>
    {tags.map(({ name, count, path }) => {
      const cfg = TAG_CONFIG[name];
      const Icon = cfg?.icon;
      const isActive = activeTag === name;
      return (
        <LocalizedLink
          key={name}
          to={path}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-foreground/75 hover:bg-accent/50 hover:text-foreground'
          )}
        >
          {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-70" />}
          <span className="flex-1 truncate">{name}</span>
          <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
        </LocalizedLink>
      );
    })}

    <p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Lists
    </p>
    {lists.map(({ id, name, count, path }) => {
      const isActive = activeList === id;
      return (
        <LocalizedLink
          key={id}
          to={path}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-foreground/75 hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <span className="flex-1 truncate">{name}</span>
          <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
        </LocalizedLink>
      );
    })}
  </nav>
);

export default SourceBrowserSidebar;
