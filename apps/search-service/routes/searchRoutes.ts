import express, { Request, Response } from 'express';
import { globalSearch, getSuggestions, searchWithAnalytics } from '../services/searchService';
import { getRecentSearches, clearTenantCache } from '../config/redis';
import { requireAuth } from '../middleware/tenantMiddleware';

const router = express.Router();

/**
 * Global search endpoint
 * POST /api/v1/search/global
 * Body: { query: string, track?: boolean }
 */
router.post('/global', requireAuth, async (req: Request, res: Response) => {
  try {
    const { query, track = true } = req.body;
    const tenantId = req.tenantId;
    const userId = req.userId;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const results = track
      ? await searchWithAnalytics(tenantId, query, userId)
      : await globalSearch(tenantId, query);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * Search a specific module
 * POST /api/v1/search/:module
 */
router.post('/:module', requireAuth, async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const { module } = req.params;
    const tenantId = req.tenantId;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Import the search service function
    const { globalSearch } = await import('../services/searchService');
    const results = await globalSearch(tenantId, query);

    // Filter to only requested module
    if (results.results[module]) {
      res.json({
        success: true,
        data: {
          query: results.query,
          timestamp: results.timestamp,
          module,
          results: results.results[module]
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          query: results.query,
          timestamp: results.timestamp,
          module,
          results: []
        }
      });
    }
  } catch (error: any) {
    console.error('Module search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * Get suggestions
 * GET /api/v1/search/suggestions?q=query&limit=5
 */
router.get('/suggestions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { q, limit = 5 } = req.query;
    const tenantId = req.tenantId;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
    }

    const suggestions = await getSuggestions(tenantId, q, parseInt(limit as string));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
});

/**
 * Get recent searches
 * GET /api/v1/search/recent
 */
router.get('/recent', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const recentSearches = await getRecentSearches(tenantId);

    res.json({
      success: true,
      data: recentSearches.slice(0, limit)
    });
  } catch (error: any) {
    console.error('Recent searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent searches',
      error: error.message
    });
  }
});

/**
 * Clear search cache (admin only)
 * DELETE /api/v1/search/cache
 */
router.delete('/cache', requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;

    // Check if user has admin role (you may want to add role checking)
    await clearTenantCache(tenantId);

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error: any) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

export default router;
