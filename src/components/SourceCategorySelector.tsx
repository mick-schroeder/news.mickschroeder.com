import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { graphql, useStaticQuery } from 'gatsby';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import { useSourceCategoryContext } from './context/SourceCategoryContext';
import { ChevronDown, Filter } from 'lucide-react';

export const SourceCategorySelector: React.FC = () => {
  const { t } = useTranslation();
  const { selectedCategories, setSelectedCategories } = useSourceCategoryContext();
  const data = useStaticQuery(graphql`
    query AllSourceCategories {
      allSourcesJson {
        nodes {
          categories
        }
      }
    }
  `);
  const allCategories = React.useMemo(() => {
    const set = new Set<string>();
    data.allSourcesJson.nodes.forEach((node: any) => {
      (node.categories || []).forEach((cat: string) => set.add(cat));
    });
    return Array.from(set).sort();
  }, [data]);

  const [open, setOpen] = React.useState(false);
  const isAllSelected =
    selectedCategories.length === 0 || selectedCategories.length === allCategories.length;

  // Memoized handlers
  const handleToggle = React.useCallback(
    (cat: string) => {
      let newSelected: string[];
      if (isAllSelected) {
        newSelected = allCategories.filter((c) => c !== cat);
      } else if (selectedCategories.includes(cat)) {
        newSelected = selectedCategories.filter((c) => c !== cat);
      } else {
        newSelected = [...selectedCategories, cat];
      }

      if (newSelected.length === allCategories.length) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(newSelected);
      }
    },
    [isAllSelected, selectedCategories, allCategories, setSelectedCategories]
  );

  const handleSelectAll = React.useCallback(() => {
    setSelectedCategories([]);
  }, [setSelectedCategories]);

  const display = isAllSelected ? (
    <Trans i18nKey="all_categories" defaults="All Categories" />
  ) : (
    selectedCategories.join(', ')
  );

  const tooltipText = isAllSelected
    ? t('all_categories', 'All Categories')
    : selectedCategories.join(', ');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-start text-left whitespace-normal"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select categories"
          title={tooltipText}
        >
          <Filter aria-hidden="true" className="w-4 h-4 me-2" />
          <span className="flex-1 min-w-0 text-left truncate">{display}</span>
          <ChevronDown aria-hidden="true" className="w-4 h-4 ms-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandGroup>
            <CommandItem onSelect={handleSelectAll} role="option" aria-selected={isAllSelected}>
              <Checkbox checked={isAllSelected} className="mr-2" />
              <span>
                <Trans i18nKey="all_categories" defaults="All Categories" />
              </span>
            </CommandItem>
            {allCategories.map((cat) => (
              <CommandItem
                key={cat}
                onSelect={() => handleToggle(cat)}
                role="option"
                aria-selected={isAllSelected || selectedCategories.includes(cat)}
              >
                <Checkbox
                  checked={isAllSelected || selectedCategories.includes(cat)}
                  className="mr-2"
                />
                <span>{cat}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
