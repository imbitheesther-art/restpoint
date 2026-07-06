import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';
import { TenantModel } from '../models/Tenant.model';
import { Request, Response } from 'express';
import logger from '@montezuma/shared-logger';

export class UserController {
    /**
     * POST /tenant/users/register - Register a new user for a specific branch
     * Only accessible by admin/manager
     */
    async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, full_name, phone, role, branch_id } = req.body;
            const user = (req as any).user;

            if (!email || !password || !full_name || !role) {
                res.status(400).json({ success: false, message: 'Missing required fields: email, password, full_name, role' });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
                return;
            }

            const validRoles = ['admin', 'manager', 'staff', 'user', 'driver'];
            if (!validRoles.includes(role)) {
                res.status(400).json({ success: false, message: 'Invalid role. Must be one of: admin, manager, staff, user, driver' });
                return;
            }

            const tenant = await TenantModel.findBySubdomain(user.tenantSlug);
            if (!tenant) {
                res.status(404).json({ success: false, message: 'Tenant not found' });
                return;
            }

            const conn = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenant.db_name
            });

            try {
                // Check if email already exists
                const [existing] = await conn.query(
                    'SELECT user_id FROM users WHERE email = ? AND is_active = TRUE',
                    [email]
                );
                if ((existing as any[]).length > 0) {
                    res.status(409).json({ success: false, message: 'User with this email already exists' });
                    return;
                }

                // Validate branch_id if provided
                let finalBranchId = null;
                if (branch_id && role !== 'driver') {
                    const [branches] = await conn.query(
                        'SELECT branch_id FROM branches WHERE branch_id = ? AND is_active = TRUE',
                        [branch_id]
                    );
                    if ((branches as any[]).length === 0) {
                        res.status(400).json({ success: false, message: 'Invalid branch_id' });
                        return;
                    }
                    finalBranchId = branch_id;
                }

                // Hash password
                const password_hash = await bcrypt.hash(password, 10);

                // Create user
                const [result] = await conn.query(
                    `INSERT INTO users (email, password_hash, full_name, phone, role, branch_id, is_verified, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
                    [email, password_hash, full_name, phone || null, role, finalBranchId]
                );

                const userId = (result as any).insertId;

                // Log activity (optional - don't fail if it errors)
                try {
                    await conn.query(
                        'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
                        [user.userId || 1, 'USER_CREATED', `User ${email} created with role ${role}${finalBranchId ? ` for branch ${finalBranchId}` : ''}`]
                    );
                } catch (logError) {
                    // Ignore activity log errors
                    console.warn('Failed to log activity:', logError);
                }

                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: {
                        user_id: userId,
                        email,
                        full_name,
                        role,
                        branch_id: finalBranchId
                    }
                });
            } finally {
                await conn.end();
            }
        } catch (error: any) {
            logger.error({
                service: "tenant-service",
                controller: "UserController",
                function: "registerUser",
                message: "User registration failed",
                error: error.message,
                stack: error.stack,
            });
            res.status(500).json({ success: false, message: 'User registration failed', error: error.message });
        }
    }

    /**
     * GET /tenant/users - Get all users in the tenant
     */
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const tenant = await TenantModel.findBySubdomain(user.tenantSlug);

            if (!tenant) {
                res.status(404).json({ success: false, message: 'Tenant not found' });
                return;
            }

            const conn = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenant.db_name
            });

            try {
                const [users] = await conn.query(`
          SELECT 
            u.user_id,
            u.email,
            u.full_name,
            u.phone,
            u.role,
            u.branch_id,
            u.is_active,
            u.last_login_at,
            u.created_at,
            b.branch_name,
            b.branch_slug
          FROM users u
          LEFT JOIN branches b ON u.branch_id = b.branch_id
          WHERE u.is_active = TRUE
          ORDER BY u.created_at DESC
        `);

                res.json({
                    success: true,
                    data: users
                });
            } finally {
                await conn.end();
            }
        } catch (error: any) {
            logger.error({
                service: "tenant-service",
                controller: "UserController",
                function: "getUsers",
                message: "Failed to fetch users",
                error: error.message,
                stack: error.stack,
            });
            res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
        }
    }

    /**
     * GET /tenant/branches - Get all branches for user assignment
     */
    async getBranches(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const tenant = await TenantModel.findBySubdomain(user.tenantSlug);

            if (!tenant) {
                res.status(404).json({ success: false, message: 'Tenant not found' });
                return;
            }

            const branches = await TenantModel.getBranches(tenant.db_name);

            res.json({
                success: true,
                data: branches
            });
        } catch (error: any) {
            logger.error({
                service: "tenant-service",
                controller: "UserController",
                function: "getBranches",
                message: "Failed to fetch branches",
                error: error.message,
                stack: error.stack,
            });
            res.status(500).json({ success: false, message: 'Failed to fetch branches', error: error.message });
        }
    }
}