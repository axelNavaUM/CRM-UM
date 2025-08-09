import { useSearch } from '@/context/SearchContext';
import React from 'react';
import SearchBar from './SearchBar';

const GlobalSearchBar: React.FC = () => {
  const { isSearchVisible, closeSearch } = useSearch();

  return (
    <SearchBar
      isVisible={isSearchVisible}
      onClose={closeSearch}
    />
  );
};

export default GlobalSearchBar; 