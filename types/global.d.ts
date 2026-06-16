/**
 * @file types/global.d.ts
 * Global type declarations for the entire project
 * Resolves missing ambient types for Node.js, Express, etc.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    JWT_SECRET?: string;
    REDIS_URL?: string;
    RABBITMQ_URL?: string;
    SOCKETIO_SERVICE_URL?: string;
    NOTIFICATION_SERVICE_URL?: string;
    CORS_ORIGIN?: string;
    TRACKING_DB_NAME?: string;
    REDIS_DEFAULT_TTL?: string;
    SOCKET_PORT?: string;
  }
}

// Fix for CommonJS modules without type definitions
declare module 'slugify' {
  interface SlugifyOptions {
    lower?: boolean;
    strict?: boolean;
    remove?: RegExp;
    trim?: boolean;
  }
  function slugify(str: string, options?: SlugifyOptions): string;
  export default slugify;
}

declare module 'bcryptjs' {
  export function hash(password: string, salt: number): Promise<string>;
  export function compare(password: string, hash: string): Promise<boolean>;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string;
  export function verify(token: string, secret: string): any;
}

// Fix for mysql2/promise RowDataPacket
declare module 'mysql2/promise' {
  import { Connection as BaseConnection, Pool as BasePool } from 'mysql2';
  
  interface RowDataPacket {
    [column: string]: any;
  }
  
  interface ResultSetHeader {
    insertId: number;
    affectedRows: number;
    changedRows: number;
    warningStatus: number;
  }
  
  export function createConnection(config: any): Promise<Connection>;
  export function createPool(config: any): Pool;
  
  interface Connection {
    query(sql: string, params?: any[]): Promise<[any[], any]>;
    execute(sql: string, params?: any[]): Promise<[any[], any]>;
    end(): Promise<void>;
    release(): void;
  }
  
  interface Pool {
    query(sql: string, params?: any[]): Promise<[any[], any]>;
    execute(sql: string, params?: any[]): Promise<[any[], any]>;
    getConnection(): Promise<Connection>;
    end(): Promise<void>;
  }
}