import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../api/axios';

export interface SearchResult {
  id: string | number;
  type: string;
  title: string;
  description?: string;
  data: any;
  relevance: number;
}

export interface SearchResults {
  [key: string]: SearchResult[];
}

export interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    timestamp: number;
    total: number;
    results: SearchResults;
  };
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Get tenant ID from localStorage
  const getTenantId = () => {
    return localStorage.getItem('tenantId') || localStorage.getItem('tenant_slug') || '';
  };

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults({});
        return;
      }

      const tenantId = getTenantId();
      if (!tenantId) {
        console.error('Tenant ID not found');
        return;
      }

      setIsLoading(true);

      try {
        const response = await api.post<SearchResponse>(
          '/api/v1/search/global',
          { query: searchQuery, track: true },
          {
            headers: {
              'x-tenant-id': tenantId,
            }
          }
        );

        if (response.data.success) {
          setResults(response.data.data.results);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults({});
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer
      if (searchQuery.length >= 2) {
        debounceTimer.current = setTimeout(() => {
          search(searchQuery);
        }, 300); // 300ms debounce
      } else {
        setResults({});
      }
    },
    [search]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    results,
    isLoading,
    search: debouncedSearch,
    totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
  };
}
