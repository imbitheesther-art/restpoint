/**
 * Tenant Branding Loader
 * Fetches tenant-specific branding data (name, logo, signature, contact info)
 * from the tracking database for multi-tenant invoice generation.
 */
import { safeQuery } from '../../../shared/config/db';
import path from 'path';
import fs from 'fs';

interface BrandingData {
  tenant_name: string;
  email: string;
  phone: string;
  location: string;
  country: string;
  logo_path: string | null;
  signature_path: string | null;
  invoice_prefix: string;
  company_address: string;
  company_phone: string;
  company_email: string;
}

/**
 * Load tenant branding/organization data from tenant_tracking.tenants
 * @param tenantSlug - The tenant slug (e.g., 'lee-funeral-home')
 * @param tenantDbName - The tenant database name for mortuary settings
 * @returns Branding data with tenant name, logo paths, contact info
 */
async function loadTenantBranding(tenantSlug: string, tenantDbName: string | null): Promise<BrandingData> {
  const defaults: BrandingData = {
    tenant_name: tenantSlug || 'Funeral Home',
    email: 'info@restpoint.co.ke',
    phone: '+254 740 045 355',
    location: 'Nairobi, Kenya',
    country: 'Kenya',
    logo_path: null,
    signature_path: null,
    invoice_prefix: 'INV',
    company_address: '',
    company_phone: '',
    company_email: '',
  };

  try {
    // 1. Try to get from tenants (central tracking DB)
    const tenantRows: any[] = await safeQuery(
      'SELECT tenant_name, email, phone, location, country FROM tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
      [tenantSlug]
    );

    if (tenantRows && tenantRows.length > 0) {
      const t = tenantRows[0];
      defaults.tenant_name = t.tenant_name || defaults.tenant_name;
      defaults.email = t.email || defaults.email;
      defaults.phone = t.phone || defaults.phone;
      defaults.location = t.location || defaults.location;
      defaults.country = t.country || defaults.country;
    }

    // 2. Try to get from mortuaries table in tenant database
    if (tenantDbName) {
      try {
        const mortRows: any[] = await safeQuery(
          'SELECT name, phone, address, email FROM mortuaries LIMIT 1',
          [],
          tenantSlug
        );
        if (mortRows && mortRows.length > 0) {
          const m = mortRows[0];
          defaults.company_address = m.address || defaults.location;
          defaults.company_phone = m.phone || defaults.phone;
          defaults.company_email = m.email || defaults.email;
          if (m.name) defaults.tenant_name = m.name;
        }
      } catch (e) {
        // mortuaries table may not exist
      }
    }

    // 3. Resolve logo path (check tenant uploads dir first, then default)
    const baseUploads = path.join(__dirname, '../../uploads');
    const tenantDir = path.join(baseUploads, 'tenants', tenantSlug);

    const possibleLogoPaths = [
      path.join(tenantDir, 'logo.png'),
      path.join(tenantDir, 'logo.jpg'),
      path.join(baseUploads, 'logo', `${tenantSlug}.png`),
      path.join(baseUploads, 'logo', `${tenantSlug}.jpg`),
    ];

    const possibleSignaturePaths = [
      path.join(tenantDir, 'signature.png'),
      path.join(tenantDir, 'signature.jpg'),
      path.join(baseUploads, 'signature', `${tenantSlug}.png`),
    ];

    // Find existing logo
    for (const p of possibleLogoPaths) {
      if (fs.existsSync(p)) {
        defaults.logo_path = p;
        break;
      }
    }

    // Find existing signature
    for (const p of possibleSignaturePaths) {
      if (fs.existsSync(p)) {
        defaults.signature_path = p;
        break;
      }
    }

    defaults.invoice_prefix = `${tenantSlug.replace(/[^A-Z0-9]/gi, '').substring(0, 4).toUpperCase() || 'INV'}-INV`;
  } catch (err: any) {
    console.warn(`⚠️ Could not load branding for tenant "${tenantSlug}": ${err.message}`);
  }

  return defaults;
}

export { loadTenantBranding };