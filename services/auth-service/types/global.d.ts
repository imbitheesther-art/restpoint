/**
 * Auth Service Global Type Declarations
 */

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    userId?: number;
    tenantId?: number;
    tenantSlug?: string;
    dbName?: string;
  }
}

declare module 'express' {
  interface Request {
    user?: {
      userId: number;
      email: string;
      tenantId: number;
      tenantName: string;
      tenantSlug: string;
      dbName: string;
      role: string;
      branchDbName?: string | null;
      [key: string]: any;
    };
    tenant?: {
      db_name: string;
      tenant_slug?: string;
      name?: string;
      [key: string]: any;
    };
    tenantSlug?: string;
    branchId?: string | null;
  }
}