/**
 * Auth Controller - TypeScript
 * Handles user authentication with enterprise-grade security
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import mysql from 'mysql2/promise';

// ============================================
// GLOBAL SECRETS (validated at startup)
// ============================================
const GLOBAL_JWT_SECRET: string = process.env.JWT_SECRET || '';
const GLOBAL_REFRESH_SECRET: string = process.env.REFRESH_TOKEN_SECRET || '';

if (!GLOBAL_JWT_SECRET || !GLOBAL_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be set in environment variables');
}

// ============================================
// CONNECTION POOL
// ============================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export { pool };

// ============================================
// TYPES
// ============================================

interface Tenant {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_slug: string;
  db_name: string;
  email: string;
  status: string;
  jwt_secret?: string;
  refresh_secret?: string;
  deployment_type?: string;
  [key: string]: any;
}

interface User {
  user_id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  role: string;
  is_active: number;
  is_verified: number;
  branch_id?: number | null;
  [key: string]: any;
}

interface TokenResult {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// DATABASE HELPERS
// ============================================

const queryServer = async (sql: string, params: any[] = []): Promise<any[]> => {
  const [rows] = await pool.query(sql, params);
  return rows as any[];
};

const queryTenantDB = async (dbName: string, sql: string, params: any[] = []): Promise<any[]> => {
  if (!dbName || typeof dbName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(dbName)) {
    throw new Error('Invalid database name');
  }
  const escapedDbName = `\`${dbName}\``;
  const qualifiedSQL = sql
    .replace(/\bFROM\s+users\b/gi, `FROM ${escapedDbName}.users`)
    .replace(/\bINTO\s+users\b/gi, `INTO ${escapedDbName}.users`)
    .replace(/\bUPDATE\s+users\b/gi, `UPDATE ${escapedDbName}.users`);
  const [rows] = await pool.query(qualifiedSQL, params);
  return rows as any[];
};

// ============================================
// JWT SECRET HELPERS
// ============================================

const getTenantJwtSecret = async (tenantId: number): Promise<{ jwtSecret: string; refreshSecret: string }> => {
  try {
    const [columns]: any = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = 'tenant_tracking' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'jwt_secret'`
    );
    if (!columns || columns.length === 0) {
      return { jwtSecret: GLOBAL_JWT_SECRET, refreshSecret: GLOBAL_REFRESH_SECRET };
    }
    const [tenants]: any = await pool.query(
      'SELECT jwt_secret, refresh_secret FROM tenant_tracking.tenants WHERE id = ?',
      [tenantId]
    );
    if (tenants.length > 0 && tenants[0].jwt_secret) {
      return {
        jwtSecret: tenants[0].jwt_secret,
        refreshSecret: tenants[0].refresh_secret || tenants[0].jwt_secret,
      };
    }
  } catch (error: any) {
    console.error('Error fetching tenant JWT secret:', error.message);
  }
  return { jwtSecret: GLOBAL_JWT_SECRET, refreshSecret: GLOBAL_REFRESH_SECRET };
};

// ============================================
// FIND HELPERS
// ============================================

const findTenantByEmail = async (email: string): Promise<Tenant | null> => {
  try {
    const [databases]: any = await pool.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'tenant_tracking'"
    );
    if (databases.length === 0) return null;

    const [tenants]: any = await pool.query(
      `SELECT * FROM tenant_tracking.tenants WHERE email = ? AND status = 'active'`,
      [email.toLowerCase()]
    );
    return tenants.length > 0 ? tenants[0] : null;
  } catch (error: any) {
    if (error?.code === 'ER_ACCESS_DENIED_ERROR') throw error;
    console.error('Error finding tenant:', error.message);
    return null;
  }
};

const findTenantByUserEmail = async (email: string): Promise<Tenant | null> => {
  try {
    const [dbs]: any = await pool.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'tenant_tracking'"
    );
    if (dbs.length === 0) return null;

    const [tenants]: any = await pool.query(
      "SELECT * FROM tenant_tracking.tenants WHERE status = 'active'"
    );
    for (const t of tenants) {
      try {
        const [users]: any = await pool.query(
          'SELECT user_id FROM `' + t.db_name + '`.users WHERE email = ? AND is_active = 1 LIMIT 1',
          [email.toLowerCase()]
        );
        if (users.length > 0) return t;
      } catch { continue; }
    }
    return null;
  } catch (e: any) {
    if (e?.code === 'ER_ACCESS_DENIED_ERROR') throw e;
    return null;
  }
};

const findUserInTenantDB = async (dbName: string, email: string): Promise<User | null> => {
  try {
    const rows = await queryTenantDB(dbName, 'SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error: any) {
    if (error?.code === 'ER_ACCESS_DENIED_ERROR') throw error;
    console.error('Error finding user:', error.message);
    return null;
  }
};

// ============================================
// TOKEN GENERATION
// ============================================

const generateTokens = async (
  user: User,
  tenant: Tenant,
  branchDbName: string | null = null
): Promise<TokenResult> => {
  const effectiveSlug = branchDbName || tenant.tenant_slug;
  const payload = {
    userId: user.user_id,
    email: user.email,
    tenantId: tenant.tenant_id,
    tenantName: tenant.tenant_name,
    tenantSlug: effectiveSlug,
    dbName: tenant.db_name,
    role: user.role || 'admin',
    branchDbName,
  };
  const { jwtSecret, refreshSecret } = await getTenantJwtSecret(tenant.tenant_id);
  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

// ============================================
// CSRF HELPER
// ============================================

const validateCsrf = (req: Request): boolean => {
  // In development, CSRF can be bypassed
  if (process.env.NODE_ENV !== 'production') return true;
  const headerToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;
  return !!(headerToken && sessionToken && headerToken === sessionToken);
};

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * POST /auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const emailInput: string = req.body.email || req.body.identifier;
  const { password } = req.body;

  if (!emailInput || !validator.isEmail(emailInput)) {
    res.status(400).json({ success: false, message: 'Valid email is required' });
    return;
  }
  if (!password) {
    res.status(400).json({ success: false, message: 'Password is required' });
    return;
  }

  try {
    let tenant: Tenant | null = await findTenantByEmail(emailInput);
    if (!tenant) {
      tenant = await findTenantByUserEmail(emailInput);
    }
    if (!tenant) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const user: User | null = await findUserInTenantDB(tenant.db_name, emailInput);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Update last login
    try {
      await queryTenantDB(tenant.db_name, 'UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [user.user_id]);
    } catch { /* non-critical */ }

    // Branch resolution
    let branchId = user.branch_id || null;
    let branchDbName: string | null = null;
    let dbName = tenant.db_name;

    if (branchId) {
      try {
        const [branches]: any = await pool.query(
          `SELECT branch_slug, branch_db_name FROM \`${tenant.db_name}\`.branches WHERE branch_id = ? AND is_active = 1`,
          [branchId]
        );
        if (branches.length > 0) {
          branchDbName = branches[0].branch_db_name;
          dbName = branchDbName || tenant.db_name;
        } else {
          branchId = null;
        }
      } catch { /* non-critical */ }
    }

    // Deployment type
    let deploymentType = tenant.deployment_type || 'single';
    try {
      const [tenantRows]: any = await pool.query(
        'SELECT deployment_type FROM tenant_tracking.tenants WHERE id = ?',
        [tenant.tenant_id]
      );
      if (tenantRows.length > 0 && tenantRows[0].deployment_type) {
        deploymentType = tenantRows[0].deployment_type;
      }
    } catch { /* non-critical */ }

    const { accessToken, refreshToken } = await generateTokens(user, tenant, branchDbName);
    const effectiveSlug = branchDbName || tenant.tenant_slug;

    // Set session
    req.session.userId = user.user_id;
    req.session.tenantId = tenant.tenant_id;
    req.session.tenantSlug = effectiveSlug;
    req.session.dbName = dbName;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      deploymentType,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone || '',
        role: user.role,
        branchId,
        branchDbName,
        dbName,
        isActive: user.is_active === 1,
        isVerified: user.is_verified === 1,
      },
      tenant: {
        tenantId: tenant.tenant_id,
        tenantName: tenant.tenant_name,
        tenantSlug: effectiveSlug,
        dbName: tenant.db_name,
      },
    });
  } catch (error: any) {
    if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
      res.status(503).json({
        success: false,
        message: 'Database access denied',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /auth/register
 */
export const register = async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Please use /api/onboarding/organization endpoint for registration',
  });
};

/**
 * POST /auth/users
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, full_name, phone, role } = req.body;
  const tenantDbName: string | undefined = req.user?.dbName;
  const tenantId: number | undefined = req.user?.tenantId;

  if (!tenantDbName) {
    res.status(400).json({ success: false, message: 'Tenant database not found in token' });
    return;
  }
  if (!email || !password || !full_name) {
    res.status(400).json({ success: false, message: 'Email, password, and full name are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    return;
  }

  try {
    const existingUser = await findUserInTenantDB(tenantDbName, email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await queryTenantDB(
      tenantDbName,
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, is_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [email.toLowerCase(), password_hash, full_name, phone || null, role || 'staff']
    );

    const newUser = await findUserInTenantDB(tenantDbName, email);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        userId: newUser?.user_id,
        email: newUser?.email,
        fullName: newUser?.full_name,
        phone: newUser?.phone,
        role: newUser?.role,
        isActive: newUser?.is_active === 1,
        isVerified: newUser?.is_verified === 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /auth/refresh
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token is required' });
    return;
  }

  try {
    let verified: any;
    let jwtSecret: string, refreshSecret: string;

    try {
      verified = jwt.verify(refreshToken, GLOBAL_REFRESH_SECRET);
      const tenantSecret = await getTenantJwtSecret(verified.tenantId);
      jwtSecret = tenantSecret.jwtSecret;
      refreshSecret = tenantSecret.refreshSecret;
    } catch {
      const payload: any = jwt.decode(refreshToken);
      if (!payload || !payload.tenantId) throw new Error('Invalid refresh token payload');
      const tenantSecret = await getTenantJwtSecret(payload.tenantId);
      jwtSecret = tenantSecret.jwtSecret;
      refreshSecret = tenantSecret.refreshSecret;
      verified = jwt.verify(refreshToken, refreshSecret);
    }

    const [tenants]: any = await pool.query(
      "SELECT * FROM tenant_tracking.tenants WHERE id = ? AND status = 'active'",
      [verified.tenantId]
    );
    if (tenants.length === 0) {
      res.status(401).json({ success: false, message: 'Tenant not found or inactive' });
      return;
    }

    const rows = await queryTenantDB(tenants[0].db_name, 'SELECT * FROM users WHERE user_id = ? AND is_active = 1', [
      verified.userId,
    ]);
    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'User not found or inactive' });
      return;
    }

    let branchDbName: string | null = null;
    if (rows[0].branch_id) {
      try {
        const [branches]: any = await pool.query(
          `SELECT branch_db_name FROM \`${tenants[0].db_name}\`.branches WHERE branch_id = ? AND is_active = 1`,
          [rows[0].branch_id]
        );
        if (branches.length > 0) branchDbName = branches[0].branch_db_name;
      } catch { /* non-critical */ }
    }

    const result = await generateTokens(rows[0], tenants[0], branchDbName);
    res.status(200).json({ success: true, message: 'Token refreshed successfully', accessToken: result.accessToken });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * POST /auth/logout
 */
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('restpoint.sid');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};

/**
 * GET /auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.decode(token);
    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }
    const { jwtSecret } = await getTenantJwtSecret(decoded.tenantId);
    const verified: any = jwt.verify(token, jwtSecret);
    res.status(200).json({
      success: true,
      user: {
        userId: verified.userId,
        email: verified.email,
        tenantId: verified.tenantId,
        tenantName: verified.tenantName,
        role: verified.role,
      },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * POST /auth/change-password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;

  if (!email || !currentPassword || !newPassword || !confirmPassword) {
    res.status(400).json({ success: false, message: 'All fields are required' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    return;
  }
  if (newPassword !== confirmPassword) {
    res.status(400).json({ success: false, message: 'New passwords do not match' });
    return;
  }
  if (currentPassword === newPassword) {
    res.status(400).json({ success: false, message: 'New password must be different from current password' });
    return;
  }

  try {
    const tenant = await findTenantByUserEmail(email);
    if (!tenant) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const user = await findUserInTenantDB(tenant.db_name, email);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await queryTenantDB(tenant.db_name, 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?', [
      newPasswordHash,
      user.user_id,
    ]);

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};