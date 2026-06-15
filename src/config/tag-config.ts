import { BookOpen, Briefcase, Cpu, Flag, FlaskConical, Gamepad2, Globe, Landmark, Layers, Leaf, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TagConfig = {
  icon: LucideIcon;
  /** Full Tailwind class string for badge bg + text + border (light + dark). Written out in full so
   *  the Tailwind v4 content scanner picks up every class without a safelist. */
  colorClass: string;
  description: string;
};

export const TAG_CONFIG: Record<string, TagConfig> = {
  American: {
    icon: Flag,
    colorClass:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    description: 'US-based news outlets',
  },
  British: {
    icon: Flag,
    colorClass:
      'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
    description: 'UK-based news outlets',
  },
  Global: {
    icon: Globe,
    colorClass:
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
    description: 'International news with global reach',
  },
  Irish: {
    icon: Leaf,
    colorClass:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Irish news outlets',
  },
  Gaeilge: {
    icon: BookOpen,
    colorClass:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    description: 'Irish language sources',
  },
  Tech: {
    icon: Cpu,
    colorClass:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
    description: 'Technology and software coverage',
  },
  Business: {
    icon: Briefcase,
    colorClass:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    description: 'Business and financial news',
  },
  Science: {
    icon: FlaskConical,
    colorClass:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
    description: 'Science and research',
  },
  Politics: {
    icon: Landmark,
    colorClass:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    description: 'Political news and analysis',
  },
  Gaming: {
    icon: Gamepad2,
    colorClass:
      'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800',
    description: 'Gaming industry and culture',
  },
  Culture: {
    icon: Palette,
    colorClass:
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
    description: 'Arts, culture, and entertainment',
  },
  Aggregator: {
    icon: Layers,
    colorClass:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
    description: 'News aggregators and link collections',
  },
};

export const KNOWN_TAG_NAMES = new Set(Object.keys(TAG_CONFIG));
