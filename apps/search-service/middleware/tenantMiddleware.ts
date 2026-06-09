import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string | number;
      userId?: string | number;
      user?: any;
    }
  }
}

export async function validateTenant(req: Request, res: Response, next: NextFunction) {
  try {
    // Get tenant from multiple sources
    const tenantId = 
      req.headers['x-tenant-id'] ||
      req.headers['x-tenant-slug'] ||
      req.query.tenantId ||
      req.body?.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required. Provide via x-tenant-id header or query parameter.'
      });
    }

    // Get JWT token
    const authHeader = req.headers.authorization;
    let userId = req.headers['x-user-id'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
        
        // Verify tenant in token matches requested tenant
        if (decoded.tenantId && decoded.tenantId !== tenantId && !isNaN(decoded.tenantId)) {
          return res.status(403).json({
            success: false,
            message: 'Tenant ID mismatch with JWT token'
          });
        }
      } catch (err) {
        // Token validation optional, but tenant still required
        console.warn('JWT validation warning:', (err as any).message);
      }
    }

    // Attach to request
    req.tenantId = tenantId;
    req.userId = userId;

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

/**
 * Require authenticated user
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required'
    });
  }

  next();
}
