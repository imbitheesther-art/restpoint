export interface DailyBilling {
  id?: number;
  deceased_id: number;
  tenant_slug: string;
  days_admitted: number;
  daily_rate: number;
  base_charges: number;
  additional_charges: number;
  total_charge: number;
  billing_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface BillingJobLog {
  id?: number;
  job_type: string;
  total_tenants: number;
  total_processed: number;
  total_succeeded: number;
  total_failed: number;
  results?: any;
  executed_at: string;
}

export interface TenantSettings {
  id?: number;
  tenant_slug: string;
  daily_rate: number;
  embalming_rate: number;
  storage_rate: number;
  currency: string;
  tax_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeceasedCharge {
  deceasedId: number;
  tenantSlug: string;
  daysAdmitted: number;
  dailyRate: number;
  baseCharges: number;
  additionalCharges: number;
  totalDailyCharge: number;
  calculatedAt: string;
}

export interface BillingResult {
  success: boolean;
  tenant: string;
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    deceasedId: number;
    name: string;
    error: string;
  }>;
  timestamp: string;
  fatalError?: string;
  fallbackUsed?: boolean;
}