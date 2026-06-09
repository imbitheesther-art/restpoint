import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

interface MasterDBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

class MasterDatabase {
  private static instance: MasterDatabase;
  private pool: Pool;

  private constructor() {
    const config: MasterDBConfig = {
      host: process.env.MASTER_DB_HOST || 'localhost',
      port: parseInt(process.env.MASTER_DB_PORT || '3306'),
      user: process.env.MASTER_DB_USER || 'root',
      password: process.env.MASTER_DB_PASSWORD || 'root',
      database: process.env.MASTER_DB_NAME || 'master_db'
    };

    this.pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true
    });

    console.log('📊 Master Database pool created');
  }

  public static getInstance(): MasterDatabase {
    if (!MasterDatabase.instance) {
      MasterDatabase.instance = new MasterDatabase();
    }
    return MasterDatabase.instance;
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const [rows] = await this.pool.promise().execute<RowDataPacket[]>(sql, params);
      return rows as T[];
    } catch (error: any) {
      console.error('❌ Master DB Query Error:', error.message);
      throw error;
    }
  }

  public async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  }

  public async execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
    try {
      const [result] = await this.pool.promise().execute<ResultSetHeader>(sql, params);
      return result;
    } catch (error: any) {
      console.error('❌ Master DB Execute Error:', error.message);
      throw error;
    }
  }

  public async getConnection() {
    return this.pool.promise().getConnection();
  }

  public async end(): Promise<void> {
    await this.pool.end();
  }
}

export const masterDB = MasterDatabase.getInstance();
export const masterQuery = masterDB.query.bind(masterDB);
export const masterQueryOne = masterDB.queryOne.bind(masterDB);
export const masterExecute = masterDB.execute.bind(masterDB);