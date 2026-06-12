import * as React from 'react';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import LocalizedLink from './LocalizedLink';
import { badgeVariants } from './ui/badge';
import { tagPath } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

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
      {tags.map(([tag, count]) => (
        <LocalizedLink
          key={tag}
          to={tagPath(tag)}
          className={cn(
            badgeVariants({ variant: 'secondary' }),
            'rounded-full px-3 py-1 font-medium hover:bg-secondary/70'
          )}
        >
          {tag}
          <span className="ms-1.5 tabular-nums text-muted-foreground">{count}</span>
        </LocalizedLink>
      ))}
    </nav>
  );
};

export default TagPills;
