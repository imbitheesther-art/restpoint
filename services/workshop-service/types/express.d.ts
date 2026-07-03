import { Request } from 'express';

export interface WorkshopRequest extends Request {
    tenantSlug?: string;
    branchId?: string | null;
    tenant?: {
        db_name: string;
        tenant_id: number;
        name: string;
    };
}
