import { useState, useCallback, useRef } from 'react';
import api from '../../../api/axios';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Get tenant ID from localStorage
  const getTenantId = () => {
    return localStorage.getItem('tenantId') || localStorage.getItem('tenant_slug') || '';
  };

  const getSuggestions = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      const tenantId = getTenantId();
      if (!tenantId) {
        console.error('Tenant ID not found');
        return;
      }

      setIsLoading(true);

      try {
        const response = await api.get<{ success: boolean; data: string[] }>(
          '/api/v1/search/suggestions',
          {
            params: { q: query, limit: 10 },
            headers: {
              'x-tenant-id': tenantId,
            }
          }
        );

        if (response.data.success) {
          setSuggestions(response.data.data);
        }
      } catch (error) {
        console.error('Suggestions error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced suggestions
  const debouncedGetSuggestions = useCallback(
    (query: string) => {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer
      if (query.length >= 2) {
        debounceTimer.current = setTimeout(() => {
          getSuggestions(query);
        }, 200); // 200ms debounce
      } else {
        setSuggestions([]);
      }
    },
    [getSuggestions]
  );

  return {
    suggestions,
    isLoading,
    getSuggestions: debouncedGetSuggestions
  };
}
