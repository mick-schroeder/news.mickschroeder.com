import * as React from 'react';
import LocalizedLink from './LocalizedLink';
import SourceBrowserSidebar, { type SidebarTag, type SidebarList } from './source-browser-sidebar';
import { TAG_CONFIG } from '@/config/tag-config';
import { cn } from '@/lib/utils';

type SourceBrowserShellProps = {
  children: React.ReactNode;
  tags: SidebarTag[];
  lists: SidebarList[];
  activeTag?: string;
  activeList?: string;
};

const SourceBrowserShell = ({
  children,
  tags,
  lists,
  activeTag,
  activeList,
}: SourceBrowserShellProps): JSX.Element => (
  <div className="flex w-full">
    {/* Desktop sidebar */}
    <aside className="hidden lg:block lg:w-52 xl:w-56 shrink-0 border-r border-border sticky top-32 self-start overflow-y-auto max-h-[calc(100vh-8rem)]">
      <SourceBrowserSidebar
        tags={tags}
        lists={lists}
        activeTag={activeTag}
        activeList={activeList}
      />
    </aside>

    {/* Main content */}
    <div className="min-w-0 flex-1">
      {/* Mobile chip strip — visible only below lg */}
      <div className="lg:hidden overflow-x-auto border-b border-border px-3 py-2">
        <div className="flex gap-1.5 whitespace-nowrap">
          <LocalizedLink
            to="/sources/"
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              !activeTag && !activeList
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
            )}
          >
            All
          </LocalizedLink>
          {tags.map(({ name, path }) => {
            const cfg = TAG_CONFIG[name];
            const Icon = cfg?.icon;
            const isActive = activeTag === name;
            return (
              <LocalizedLink
                key={name}
                to={path}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isActive
                    ? cfg?.colorClass ?? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                {Icon && <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />}
                {name}
              </LocalizedLink>
            );
          })}
          {lists.map(({ id, name, path }) => {
            const isActive = activeList === id;
            return (
              <LocalizedLink
                key={id}
                to={path}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                {name}
              </LocalizedLink>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  </div>
);

export default SourceBrowserShell;
