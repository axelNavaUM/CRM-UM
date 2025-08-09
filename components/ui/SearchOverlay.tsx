import { useSearch } from '@/context/SearchContext';
import { useWeb } from '@/context/WebContext';
import { usePlatform } from '@/hooks/usePlatform';
import React from 'react';
import ResponsiveSearch from './ResponsiveSearch';

const SearchOverlay: React.FC = () => {
  const { isWeb } = usePlatform();
  const { isSearchVisible, closeSearch } = useSearch();
  const { isSearchVisible: isWebSearchVisible, closeSearch: closeWebSearch } = useWeb();

  // En web, usar el contexto de web
  if (isWeb) {
    return null; // Los componentes web se manejan en WebComponents
  }

  // En móvil, usar el contexto de búsqueda normal
  return (
    <ResponsiveSearch
      visible={isSearchVisible}
      onClose={closeSearch}
    />
  );
};

export default SearchOverlay; 