import * as React from 'react';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import LocalizedLink from './LocalizedLink';
import { badgeVariants } from './ui/badge';
import { tagPath } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import { TAG_CONFIG } from '@/config/tag-config';

type TagSource = {
  tags?: string[] | null;
};

type TagPillsProps = {
  sources: TagSource[];
  className?: string;
};

const TagPills = ({ sources, className }: TagPillsProps): JSX.Element | null => {
  const { t } = useTranslation();

  const tags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const source of sources) {
      for (const tag of source.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [sources]);

  if (!tags.length) return null;

  return (
    <nav
      className={cn('flex flex-wrap justify-center gap-2', className)}
      aria-label={String(t('tags'))}
    >
      {tags.map(([tag, count]) => {
        const config = TAG_CONFIG[tag];
        const Icon = config?.icon;
        return (
          <LocalizedLink
            key={tag}
            to={tagPath(tag)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:opacity-80',
              config?.colorClass ?? badgeVariants({ variant: 'secondary' })
            )}
          >
            {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
            {tag}
            <span className="tabular-nums opacity-60">{count}</span>
          </LocalizedLink>
        );
      })}
    </nav>
  );
};

export default TagPills;
