import { SearchResult, SearchService } from '@/services/searchService';
import { useCallback, useEffect, useState } from 'react';

interface UseSearchReturn {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const search = useCallback((query: string) => {
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Si la query está vacía, limpiar resultados
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    // Debounce: esperar 300ms antes de hacer la búsqueda
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await SearchService.globalSearch(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setError('Error al realizar la búsqueda');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    setSearchTimeout(timeout as any);
  }, [searchTimeout]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [searchTimeout]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return {
    results,
    isSearching,
    error,
    search,
    clearResults,
  };
}; 