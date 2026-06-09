import Fuse from 'fuse.js';
import { tenantDB } from '../config/database';
import {
  cacheSearchResults,
  getCachedSearchResults,
  addRecentSearch,
  getTenantCacheKey
} from '../config/redis';

export interface SearchResult {
  id: string | number;
  type: string;
  title: string;
  description?: string;
  data: any;
  relevance: number;
}

export interface GroupedSearchResults {
  query: string;
  timestamp: number;
  total: number;
  results: {
    [key: string]: SearchResult[];
  };
}

// Search module configuration
const SEARCH_MODULES = {
  deceased: {
    table: 'deceased',
    fields: ['deceased_id', 'admission_number', 'national_id', 'cause_of_death'],
    searchFields: ['deceased_id', 'admission_number', 'national_id'],
    limit: 10,
    fuseOptions: {
      keys: ['deceased_id', 'admission_number', 'national_id'],
      threshold: 0.4,
      includeScore: true,
    }
  },
  documents: {
    table: 'documents',
    fields: ['document_id', 'document_type', 'title', 'file_name'],
    searchFields: ['title', 'file_name', 'document_type'],
    limit: 10,
    fuseOptions: {
      keys: ['title', 'file_name', 'document_type'],
      threshold: 0.4,
      includeScore: true,
    }
  },
  invoices: {
    table: 'invoices',
    fields: ['invoice_id', 'invoice_number', 'status'],
    searchFields: ['invoice_number', 'status'],
    limit: 10,
    fuseOptions: {
      keys: ['invoice_number', 'status'],
      threshold: 0.5,
      includeScore: true,
    }
  },
  payments: {
    table: 'invoice_payments',
    fields: ['payment_id', 'payment_method', 'reference_number'],
    searchFields: ['reference_number', 'payment_method'],
    limit: 10,
    fuseOptions: {
      keys: ['reference_number', 'payment_method'],
      threshold: 0.5,
      includeScore: true,
    }
  },
  dispatches: {
    table: 'hearse_dispatches',
    fields: ['dispatch_id', 'destination', 'status'],
    searchFields: ['destination', 'status'],
    limit: 10,
    fuseOptions: {
      keys: ['destination', 'status'],
      threshold: 0.4,
      includeScore: true,
    }
  },
  users: {
    table: 'users',
    fields: ['user_id', 'email', 'name', 'role'],
    searchFields: ['email', 'name', 'role'],
    limit: 10,
    fuseOptions: {
      keys: ['email', 'name', 'role'],
      threshold: 0.4,
      includeScore: true,
    }
  }
};

/**
 * Search a single module
 */
async function searchModule(
  tenantId: string | number,
  moduleName: string,
  query: string,
  useCache: boolean = true
): Promise<SearchResult[]> {
  // Try cache first
  if (useCache) {
    const cached = await getCachedSearchResults(tenantId, moduleName, query);
    if (cached) {
      return cached;
    }
  }

  const moduleConfig = SEARCH_MODULES[moduleName as keyof typeof SEARCH_MODULES];
  if (!moduleConfig) {
    return [];
  }

  try {
    const conn = await tenantDB.getConnection(String(tenantId));
    
    // Build query with tenant isolation
    let sql = `SELECT ${moduleConfig.fields.join(', ')} FROM ${moduleConfig.table} WHERE 1=1`;
    const params: any[] = [];

    // Add search condition using OR on search fields
    const searchConditions = moduleConfig.searchFields
      .map(field => `${field} LIKE ?`)
      .join(' OR ');
    sql += ` AND (${searchConditions})`;
    
    for (let i = 0; i < moduleConfig.searchFields.length; i++) {
      params.push(`%${query}%`);
    }

    sql += ` LIMIT ${moduleConfig.limit}`;

    const rows = await conn.query(sql, params);
    conn.release();

    // Apply fuzzy search for better ranking
    const fuse = new Fuse(rows, moduleConfig.fuseOptions);
    const fuseResults = fuse.search(query);

    // Format results
    const results: SearchResult[] = fuseResults.map((result) => ({
      id: result.item[moduleConfig.fields[0]],
      type: moduleName,
      title: result.item[moduleConfig.searchFields[0]] || result.item[moduleConfig.fields[0]],
      description: result.item[moduleConfig.searchFields[1]],
      data: result.item,
      relevance: 1 - (result.score || 0) // Convert Fuse score to relevance (higher is better)
    }));

    // Cache results
    if (results.length > 0) {
      await cacheSearchResults(tenantId, moduleName, query, results, 1800); // 30 min cache
    }

    return results;
  } catch (error) {
    console.error(`Error searching ${moduleName}:`, error);
    return [];
  }
}

/**
 * Global search across all modules
 */
export async function globalSearch(
  tenantId: string | number,
  query: string,
  useCache: boolean = true
): Promise<GroupedSearchResults> {
  const startTime = Date.now();

  // Trim and validate query
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) {
    return {
      query: cleanQuery,
      timestamp: startTime,
      total: 0,
      results: {}
    };
  }

  try {
    // Add to recent searches
    await addRecentSearch(tenantId, cleanQuery);

    // Search all modules in parallel
    const searchPromises = Object.keys(SEARCH_MODULES).map(moduleName =>
      searchModule(tenantId, moduleName, cleanQuery, useCache)
        .then(results => ({ module: moduleName, results }))
        .catch(err => {
          console.error(`Error in ${moduleName} search:`, err);
          return { module: moduleName, results: [] };
        })
    );

    const moduleResults = await Promise.all(searchPromises);

    // Group results by module
    const grouped: GroupedSearchResults = {
      query: cleanQuery,
      timestamp: startTime,
      total: 0,
      results: {}
    };

    for (const { module, results } of moduleResults) {
      if (results.length > 0) {
        grouped.results[module] = results;
        grouped.total += results.length;
      }
    }

    return grouped;
  } catch (error) {
    console.error('Global search error:', error);
    throw error;
  }
}

/**
 * Get suggestions for a partial query
 */
export async function getSuggestions(
  tenantId: string | number,
  query: string,
  limit: number = 5
): Promise<string[]> {
  try {
    const conn = await tenantDB.getConnection(String(tenantId));
    
    // Get recent searches first
    const suggestions: Set<string> = new Set();
    
    // Search deceased names/IDs
    const results = await conn.query(
      `SELECT DISTINCT deceased_id, admission_number FROM deceased 
       WHERE deceased_id LIKE ? OR admission_number LIKE ?
       LIMIT ?`,
      [`${query}%`, `${query}%`, limit]
    );

    results.forEach((row: any) => {
      suggestions.add(row.deceased_id);
      suggestions.add(row.admission_number);
    });

    conn.release();

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
}

/**
 * Search with analytics tracking
 */
export async function searchWithAnalytics(
  tenantId: string | number,
  query: string,
  userId?: string | number
): Promise<GroupedSearchResults> {
  const results = await globalSearch(tenantId, query);

  // Log search activity (for analytics)
  try {
    const conn = await tenantDB.getConnection(String(tenantId));
    await conn.query(
      `INSERT INTO search_logs (tenant_id, user_id, query, result_count, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [tenantId, userId || null, query, results.total]
    );
    conn.release();
  } catch (error) {
    console.warn('Failed to log search activity:', error);
  }

  return results;
}
