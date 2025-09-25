import React, { type ReactNode } from 'react';

// Type for the context value
interface SourceCategoryContextType {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

// Default: all categories selected (empty array means 'all')
const SourceCategoryContext = React.createContext<SourceCategoryContextType | undefined>(undefined);

export const useSourceCategoryContext = () => {
  const context = React.useContext(SourceCategoryContext);
  if (!context) {
    throw new Error('useSourceCategoryContext must be used within a SourceCategoryProvider');
  }
  return context;
};

export const SourceCategoryProvider = ({
  children,
  defaultCategories = [],
}: {
  children: ReactNode;
  defaultCategories?: string[];
}) => {
  const [selectedCategories, setSelectedCategoriesState] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedCategories');
      if (stored) return JSON.parse(stored);
    }
    return defaultCategories;
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  // Wrap setter to persist
  const setSelectedCategories = (categories: string[]) => {
    setSelectedCategoriesState(categories);
  };

  return (
    <SourceCategoryContext.Provider value={{ selectedCategories, setSelectedCategories }}>
      {children}
    </SourceCategoryContext.Provider>
  );
};
