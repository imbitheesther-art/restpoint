import { RowDataPacket } from 'mysql2';
import * as mysql from 'mysql2/promise';

export interface Organization extends RowDataPacket {
  id: number;
  organization_name: string;
  slug?: string;
  email: string;
  phone?: string;
  location?: string;
  logo_url?: string;
  is_active: boolean;
  status: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: Date;
  updated_at: Date;
}

export class OrganizationModel {
  
  private async getConnection(): Promise<mysql.Connection> {
    return await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'master_db'
    });
  }

  async findByEmail(email: string): Promise<Organization | null> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute<Organization[]>(
        'SELECT * FROM organizations WHERE email = ? AND deleted_at IS NULL',
        [email]
      );
      return rows[0] || null;
    } finally {
      await connection.end();
    }
  }

  async findById(id: number): Promise<Organization | null> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute<Organization[]>(
        'SELECT * FROM organizations WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      return rows[0] || null;
    } finally {
      await connection.end();
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute<Organization[]>(
        'SELECT * FROM organizations WHERE slug = ? AND deleted_at IS NULL',
        [slug]
      );
      return rows[0] || null;
    } finally {
      await connection.end();
    }
  }

  async create(data: any): Promise<number | null> {
    const connection = await this.getConnection();
    try {
      const slug = data.organization_name.toLowerCase().replace(/\s+/g, '-');
      
      const [result] = await connection.execute(
        `INSERT INTO organizations (organization_name, slug, email, phone, location, is_active, subscription_plan, subscription_status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.organization_name,
          slug,
          data.email,
          data.phone || null,
          data.location || null,
          true,
          'trial',
          'active'
        ]
      );
      return (result as any).insertId;
    } finally {
      await connection.end();
    }
  }

  async update(id: number, data: any): Promise<boolean> {
    const connection = await this.getConnection();
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (data.organization_name) {
        fields.push('organization_name = ?');
        values.push(data.organization_name);
      }
      if (data.email) {
        fields.push('email = ?');
        values.push(data.email);
      }
      if (data.phone) {
        fields.push('phone = ?');
        values.push(data.phone);
      }
      if (data.location) {
        fields.push('location = ?');
        values.push(data.location);
      }
      if (data.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(data.is_active);
      }
      if (data.subscription_status) {
        fields.push('subscription_status = ?');
        values.push(data.subscription_status);
      }

      if (fields.length === 0) return false;

      fields.push('updated_at = NOW()');
      values.push(id);

      const [result] = await connection.execute(
        `UPDATE organizations SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
        values
      );
      
      return (result as any).affectedRows > 0;
    } finally {
      await connection.end();
    }
  }

  async softDelete(id: number): Promise<boolean> {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE organizations SET deleted_at = NOW(), is_active = false WHERE id = ?',
        [id]
      );
      return (result as any).affectedRows > 0;
    } finally {
      await connection.end();
    }
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<Organization[]> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute<Organization[]>(
        'SELECT * FROM organizations WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      return rows;
    } finally {
      await connection.end();
    }
  }

  async count(): Promise<number> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM organizations WHERE deleted_at IS NULL'
      );
      return (rows as any)[0].count;
    } finally {
      await connection.end();
    }
  }
}

export default OrganizationModel;
