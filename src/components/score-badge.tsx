import * as React from 'react';
import { cn } from '@/lib/utils';

type ScoreBadgeProps = {
  score: number | string | null | undefined;
  className?: string;
};

const colorClass = (n: number): string => {
  if (n >= 70) return 'bg-green-600 text-white dark:bg-green-500 dark:text-stone-950';
  if (n >= 40) return 'bg-amber-500 text-white';
  return 'bg-red-600 text-white dark:bg-red-500';
};

const ScoreBadge = ({ score, className }: ScoreBadgeProps): JSX.Element | null => {
  const n = Math.round(parseFloat(String(score ?? '')));
  if (!Number.isFinite(n)) return null;

  return (
    <span
      className={cn(
        'inline-flex min-w-[2.75rem] items-center justify-center rounded-md px-1.5 py-1 text-sm font-black leading-none tabular-nums',
        colorClass(n),
        className
      )}
      aria-label={`Score: ${n}%`}
    >
      {n}%
    </span>
  );
};

export default ScoreBadge;
