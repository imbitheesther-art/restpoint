import mysql from 'mysql2/promise';

export interface BranchData {
    branch_id?: number;
    branch_name: string;
    branch_slug: string;
    branch_db_name: string;
    branch_location: string;
    branch_phone: string;
    branch_email: string;
    is_active: boolean;
    created_at?: Date;
}

export class BranchModel {
    static async create(tenantDbName: string, data: {
        branch_name: string;
        branch_slug: string;
        branch_db_name: string;
        branch_location: string;
        branch_phone: string;
        branch_email: string;
    }): Promise<number> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
        try {
            const [result] = await conn.query(
                `INSERT INTO branches (branch_name, branch_slug, branch_db_name, branch_location, branch_phone, branch_email, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
                [data.branch_name, data.branch_slug, data.branch_db_name, data.branch_location, data.branch_phone, data.branch_email]
            );
            return (result as any).insertId;
        } finally {
            await conn.end();
        }
    }

    static async findBySlug(tenantDbName: string, slug: string): Promise<BranchData | null> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
        try {
            const [rows] = await conn.query(
                'SELECT * FROM branches WHERE branch_slug = ? AND is_active = TRUE LIMIT 1',
                [slug]
            );
            const list = rows as any[];
            return list.length > 0 ? list[0] as BranchData : null;
        } finally {
            await conn.end();
        }
    }

    static async getAll(tenantDbName: string): Promise<BranchData[]> {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: tenantDbName
        });
        try {
            const [rows] = await conn.query(
                'SELECT * FROM branches WHERE is_active = TRUE ORDER BY branch_name'
            );
            return rows as BranchData[];
        } finally {
            await conn.end();
        }
    }
}
