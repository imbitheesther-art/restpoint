const { safeQuery, safeQueryOne } = require('../config/database');

class Tenant {
  // Find tenant by subdomain
  static async findBySubdomain(subdomain) {
    console.log('[Tenant.findBySubdomain] Searching for:', subdomain);
    const result = await safeQueryOne(
      `SELECT * FROM tenants WHERE subdomain = ? AND deleted_at IS NULL`,
      [subdomain]
    );
    console.log('[Tenant.findBySubdomain] Result:', result);
    return result;
  }

  // Find tenant by email - ADD THIS METHOD
  static async findByEmail(email) {
    console.log('[Tenant.findByEmail] Searching for email:', email);
    try {
      const result = await safeQueryOne(
        `SELECT * FROM tenants WHERE email = ? AND deleted_at IS NULL`,
        [email.toLowerCase()]
      );
      console.log('[Tenant.findByEmail] Result:', result);
      return result;
    } catch (error) {
      console.error('[Tenant.findByEmail] Error:', error);
      return null;
    }
  }

  // Find tenant by ID
  static async findById(tenantId) {
    console.log('[Tenant.findById] Searching for ID:', tenantId);
    const result = await safeQueryOne(
      `SELECT * FROM tenants WHERE tenant_id = ? AND deleted_at IS NULL`,
      [tenantId]
    );
    console.log('[Tenant.findById] Result:', result);
    return result;
  }

  // Create new tenant
  static async create(tenantData) {
    const {
      tenant_name,
      subdomain,
      email,
      phone = null,
      address = null,
      status = 'active'
    } = tenantData;

    const result = await safeQuery(
      `INSERT INTO tenants (tenant_name, subdomain, email, phone, address, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tenant_name, subdomain, email.toLowerCase(), phone, address, status]
    );
    
    return result.insertId;
  }

  // Get all tenants
  static async getAll() {
    return await safeQuery(
      `SELECT tenant_id, tenant_name, subdomain, email, status, created_at 
       FROM tenants 
       WHERE deleted_at IS NULL 
       ORDER BY created_at DESC`
    );
  }

  // Update tenant status
  static async updateStatus(tenantId, status) {
    await safeQuery(
      'UPDATE tenants SET status = ?, updated_at = NOW() WHERE tenant_id = ?',
      [status, tenantId]
    );
  }

  // Update last login
  static async updateLastLogin(tenantId) {
    await safeQuery(
      'UPDATE tenants SET last_login_at = NOW() WHERE tenant_id = ?',
      [tenantId]
    );
  }
}

module.exports = Tenant;