import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../../api/axios';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Get tenant ID from localStorage
  const getTenantId = () => {
    return localStorage.getItem('tenantId') || localStorage.getItem('tenant_slug') || '';
  };

  const { data, isLoading } = useQuery(
    ['recentSearches', getTenantId()],
    async () => {
      const tenantId = getTenantId();
      if (!tenantId) return [];

      const response = await api.get<{ success: boolean; data: string[] }>(
        '/api/v1/search/recent?limit=10',
        {
          headers: {
            'x-tenant-id': tenantId,
          }
        }
      );

      return response.data.data || [];
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
    }
  );

  useEffect(() => {
    if (data) {
      setRecentSearches(data);
    }
  }, [data]);

  return {
    recentSearches,
    isLoading
  };
}
