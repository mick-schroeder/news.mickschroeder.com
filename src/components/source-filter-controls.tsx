import * as React from 'react';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import { ChevronDown, ListFilter, Tags } from 'lucide-react';
import sourceListsJson from '../data/source-lists.json';
import sourcesJson from '../data/sources.json';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNextSiteContext } from './context/next-site-context';
import { useSourceFilterContext } from './context/source-filter-context';
import { cn } from '@/lib/utils';

type SourceList = {
  id: string;
  name: string;
};

type SourceNode = {
  tags?: string[] | null;
  lists?: string[] | null;
};

const joinDisplay = (values: string[], fallback: React.ReactNode): React.ReactNode =>
  values.length ? values.join(', ') : fallback;

type SourceFilterControlsProps = {
  className?: string;
};

export const SourceFilterControls: React.FC<SourceFilterControlsProps> = ({ className }) => {
  const { t } = useTranslation();
  const { availableCount } = useNextSiteContext();
  const { selectedLists, selectedTags, setSelectedLists, setSelectedTags } =
    useSourceFilterContext();
  const [listsOpen, setListsOpen] = React.useState(false);
  const [tagsOpen, setTagsOpen] = React.useState(false);

  const lists = React.useMemo(() => sourceListsJson as SourceList[], []);
  const tags = React.useMemo(() => {
    const set = new Set<string>();
    for (const source of sourcesJson as SourceNode[]) {
      for (const tag of source.tags ?? []) set.add(tag);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const listIds = React.useMemo(() => lists.map((list) => list.id), [lists]);
  const listNameById = React.useMemo(
    () => new Map(lists.map((list) => [list.id, list.name])),
    [lists]
  );
  const allListsSelected = selectedLists.length === 0 || selectedLists.length === listIds.length;
  const allTagsSelected = selectedTags.length === 0 || selectedTags.length === tags.length;

  const selectedListNames = selectedLists.map((id) => listNameById.get(id) || id);
  const listDisplay = allListsSelected ? (
    <Trans i18nKey="filter_selector.all_lists" defaults="All Lists" />
  ) : (
    joinDisplay(
      selectedListNames,
      <Trans i18nKey="filter_selector.all_lists" defaults="All Lists" />
    )
  );
  const tagDisplay = allTagsSelected ? (
    <Trans i18nKey="filter_selector.all_tags" defaults="All Tags" />
  ) : (
    joinDisplay(selectedTags, <Trans i18nKey="filter_selector.all_tags" defaults="All Tags" />)
  );

  const toggleList = React.useCallback(
    (id: string) => {
      let next: string[];
      if (allListsSelected) {
        next = listIds.filter((item) => item !== id);
      } else if (selectedLists.includes(id)) {
        next = selectedLists.filter((item) => item !== id);
      } else {
        next = [...selectedLists, id];
      }

      setSelectedLists(next.length === listIds.length ? [] : next);
    },
    [allListsSelected, listIds, selectedLists, setSelectedLists]
  );

  const toggleTag = React.useCallback(
    (tag: string) => {
      let next: string[];
      if (allTagsSelected) {
        next = tags.filter((item) => item !== tag);
      } else if (selectedTags.includes(tag)) {
        next = selectedTags.filter((item) => item !== tag);
      } else {
        next = [...selectedTags, tag];
      }

      setSelectedTags(next.length === tags.length ? [] : next);
    },
    [allTagsSelected, selectedTags, setSelectedTags, tags]
  );

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      <Popover open={listsOpen} onOpenChange={setListsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full min-w-0 justify-start text-left xl:w-[210px]"
            aria-haspopup="listbox"
            aria-expanded={listsOpen}
            aria-label={String(t('filter_selector.select_lists_label'))}
            title={allListsSelected ? t('filter_selector.all_lists') : selectedListNames.join(', ')}
          >
            <ListFilter aria-hidden="true" className="w-4 h-4 me-2" />
            <span className="flex-1 min-w-0 truncate">{listDisplay}</span>
            <ChevronDown aria-hidden="true" className="w-4 h-4 ms-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setSelectedLists([])}
                  role="option"
                  aria-selected={allListsSelected}
                >
                  <Checkbox checked={allListsSelected} className="mr-2" />
                  <span>
                    <Trans i18nKey="filter_selector.all_lists" defaults="All Lists" />
                  </span>
                </CommandItem>
                {lists.map((list) => (
                  <CommandItem
                    key={list.id}
                    onSelect={() => toggleList(list.id)}
                    role="option"
                    aria-selected={allListsSelected || selectedLists.includes(list.id)}
                  >
                    <Checkbox
                      checked={allListsSelected || selectedLists.includes(list.id)}
                      className="mr-2"
                    />
                    <span>{list.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full min-w-0 justify-start text-left xl:w-[180px]"
            aria-haspopup="listbox"
            aria-expanded={tagsOpen}
            aria-label={String(t('filter_selector.select_tags_label'))}
            title={allTagsSelected ? t('filter_selector.all_tags') : selectedTags.join(', ')}
          >
            <Tags aria-hidden="true" className="w-4 h-4 me-2" />
            <span className="flex-1 min-w-0 truncate">{tagDisplay}</span>
            <ChevronDown aria-hidden="true" className="w-4 h-4 ms-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setSelectedTags([])}
                  role="option"
                  aria-selected={allTagsSelected}
                >
                  <Checkbox checked={allTagsSelected} className="mr-2" />
                  <span>
                    <Trans i18nKey="filter_selector.all_tags" defaults="All Tags" />
                  </span>
                </CommandItem>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => toggleTag(tag)}
                    role="option"
                    aria-selected={allTagsSelected || selectedTags.includes(tag)}
                  >
                    <Checkbox
                      checked={allTagsSelected || selectedTags.includes(tag)}
                      className="mr-2"
                    />
                    <span>{tag}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <span className="inline-flex h-9 shrink-0 items-center rounded-md border px-3 text-sm tabular-nums text-muted-foreground">
        <Trans
          i18nKey="filter_selector.source_count"
          defaults="{{count}} sources"
          values={{ count: availableCount }}
        />
      </span>
    </div>
  );
};

export default SourceFilterControls;
