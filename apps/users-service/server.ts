import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8003', 10);

// ============ DATABASE CONNECTION ============

const pool = mysql.createPool({
  host: process.env.MASTER_DB_HOST || 'localhost',
  port: parseInt(process.env.MASTER_DB_PORT || '3306'),
  user: process.env.MASTER_DB_USER || 'root',
  password: process.env.MASTER_DB_PASSWORD || 'root',
  database: process.env.MASTER_DB_NAME || 'master_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ============ MIDDLEWARE ============

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Tenant middleware - extract from header or JWT
app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      (req as any).tenantId = decoded.tenantId;
      (req as any).tenantSlug = decoded.tenantSlug;
      (req as any).userId = decoded.userId;
      (req as any).user = decoded;
    } catch (error) {
      // Token invalid, but continue
    }
  }
  
  // Also check x-tenant-slug header
  const tenantSlug = req.headers['x-tenant-slug'] as string;
  if (tenantSlug) {
    (req as any).tenantSlug = tenantSlug;
  }
  
  next();
});

// ============ TYPES ============

interface TenantRequest extends Request {
  tenantId?: number;
  tenantSlug?: string;
  userId?: number;
  user?: any;
}

// ============ ROUTES ============

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'users-service',
    timestamp: new Date().toISOString(),
    database: process.env.MASTER_DB_NAME || 'master_db'
  });
});

/**
 * POST /api/v1/restpoint/users/register
 * Register a new user within a tenant
 */
app.post('/api/v1/restpoint/users/register', async (req: TenantRequest, res: Response) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID required - pass JWT token or x-tenant-slug header'
      });
    }
    
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full_name are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user already exists
      const [existing]: any = await connection.execute(
        'SELECT user_id FROM users WHERE email = ? AND tenant_id = ?',
        [email, tenantId]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const [result]: any = await connection.execute(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, phone, role, is_active, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
        [tenantId, email, passwordHash, full_name, phone || null, role || 'staff']
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user_id: result.insertId,
          email,
          full_name,
          role: role || 'staff'
        }
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'User registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/v1/restpoint/users/:userId
 * Get user details
 */
app.get('/api/v1/restpoint/users/:userId', async (req: TenantRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [users]: any = await connection.execute(
        `SELECT user_id, tenant_id, email, full_name, phone, role, is_active, is_verified, last_login_at
         FROM users WHERE user_id = ? AND tenant_id = ?`,
        [userId, tenantId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: users[0]
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/v1/restpoint/users/:userId
 * Update user details
 */
app.put('/api/v1/restpoint/users/:userId', async (req: TenantRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { full_name, phone, role } = req.body;
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result]: any = await connection.execute(
        `UPDATE users SET full_name = ?, phone = ?, role = ? WHERE user_id = ? AND tenant_id = ?`,
        [full_name, phone, role, userId, tenantId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

/**
 * GET /api/v1/restpoint/users
 * List all users in a tenant
 */
app.get('/api/v1/restpoint/users', async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [users]: any = await connection.execute(
        `SELECT user_id, email, full_name, phone, role, is_active, is_verified, last_login_at
         FROM users WHERE tenant_id = ? ORDER BY created_at DESC`,
        [tenantId]
      );
      
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list users'
    });
  }
});

/**
 * DELETE /api/v1/restpoint/users/:userId
 * Soft delete a user
 */
app.delete('/api/v1/restpoint/users/:userId', async (req: TenantRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result]: any = await connection.execute(
        `UPDATE users SET is_active = 0 WHERE user_id = ? AND tenant_id = ?`,
        [userId, tenantId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// ============ 404 HANDLER ============

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ============ ERROR HANDLER ============

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============ START SERVER ============

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Users Service running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Database: ${process.env.MASTER_DB_NAME || 'master_db'}`);
  console.log(`\n📚 Endpoints:`);
  console.log(`   POST   /api/v1/restpoint/users/register`);
  console.log(`   GET    /api/v1/restpoint/users`);
  console.log(`   GET    /api/v1/restpoint/users/:userId`);
  console.log(`   PUT    /api/v1/restpoint/users/:userId`);
  console.log(`   DELETE /api/v1/restpoint/users/:userId`);
  console.log(`   GET    /health\n`);
});

export default app;
