import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'supersecretjwtkey';
const REFRESH_SECRET: string = process.env.REFRESH_SECRET || 'supersecretrefreshkey';

// Define the shape of your user data
interface UserPayload extends JwtPayload {
  userId: string;
  tenantId: number;
  tenantSlug: string;
  role: string;
  email?: string;
}

// Extend Express Request to include req.user
export interface AuthRequest extends Request {
  user?: UserPayload | string;
}

/**
 * Helper to create access token
 */
export const createAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });
};

/**
 * Helper to create refresh token
 */
export const createRefreshToken = (payload: object): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Middleware to authenticate and auto-refresh tokens
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // 1. Check for Refresh Token if Access Token is missing
    if (!token) {
      const refreshToken = req.cookies?.refresh_token;
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'No token provided' });
      }

      try {
        const decodedRefresh = jwt.verify(refreshToken, REFRESH_SECRET) as UserPayload;
        
        // Issue new access token preserving tenant context
        token = createAccessToken({
          userId: decodedRefresh.userId,
          tenantId: decodedRefresh.tenantId,
          tenantSlug: decodedRefresh.tenantSlug,
          role: decodedRefresh.role,
          email: decodedRefresh.email,
        });

        res.setHeader('x-access-token', token);
        req.user = decodedRefresh;
        return next();
      } catch (err) {
        return res.status(403).json({ 
          message: 'Refresh token expired, please login again' 
        });
      }
    }

    // 2. Verify existing Access Token
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
    
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};