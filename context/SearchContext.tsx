import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SearchContextType {
  isSearchVisible: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const openSearch = () => {
    console.log('🔍 SearchContext: Opening search');
    setIsSearchVisible(true);
  };

  const closeSearch = () => {
    console.log('🔍 SearchContext: Closing search');
    setIsSearchVisible(false);
  };

  return (
    <SearchContext.Provider value={{ isSearchVisible, openSearch, closeSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 