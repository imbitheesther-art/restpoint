/**
 * Authentication Security Guard
 * Blocks access during high-risk hours (midnight to 4am)
 * Protects high-profile data from unauthorized access
 */

const redis = require('redis');

class AuthSecurityGuard {
  constructor(redisConfig, highProfileRoles = ['admin', 'mortuary_director', 'finance']) {
    this.redis = redis.createClient(redisConfig);
    this.highProfileRoles = highProfileRoles;
    
    // High-risk hours: 00:00 - 04:00 (midnight to 4am)
    this.blockStartHour = 0;
    this.blockEndHour = 4;
  }

  /**
   * Check if current time is in restricted window
   */
  isRestrictedHour() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= this.blockStartHour && currentHour < this.blockEndHour;
  }

  /**
   * Authenticate user with security checks
   */
  async authenticateUser(userId, roles = []) {
    // Check if restricted hour and user has high-profile role
    if (this.isRestrictedHour()) {
      const hasHighProfileRole = roles.some(role => 
        this.highProfileRoles.includes(role)
      );

      if (hasHighProfileRole) {
        return {
          success: false,
          code: 'RESTRICTED_HOURS',
          message: 'Access denied. High-profile operations not allowed between midnight and 4am.',
          restrictedUntil: this.getNextAccessTime()
        };
      }
    }

    return { success: true };
  }

  /**
   * Get next allowed access time
   */
  getNextAccessTime() {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= this.blockStartHour && currentHour < this.blockEndHour) {
      // We're in restricted window, allow at 4am
      const nextAccess = new Date(now);
      nextAccess.setHours(this.blockEndHour, 0, 0, 0);
      return nextAccess.toISOString();
    }

    // Not in restricted window
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(this.blockStartHour, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Log access attempt
   */
  async logAccessAttempt(userId, roles, result) {
    const logKey = `auth:access:${userId}`;
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      roles: roles.join(','),
      result: result.success ? 'success' : result.code,
      ip: result.ip || 'unknown'
    };

    // Store in Redis with 24-hour expiry
    await this.redis.setex(logKey, 86400, JSON.stringify(logEntry));
  }

  /**
   * Get access attempt history
   */
  async getAccessHistory(userId, days = 7) {
    const pattern = `auth:access:${userId}:*`;
    // Implementation would fetch from database/Redis
    return [];
  }

  /**
   * Lock account after multiple failed attempts
   */
  async lockAccountIfNeeded(userId, failedAttempts) {
    if (failedAttempts >= 5) {
      const lockKey = `auth:locked:${userId}`;
      // Lock for 30 minutes
      await this.redis.setex(lockKey, 1800, 'locked');
      return { locked: true, unlockTime: new Date(Date.now() + 1800000).toISOString() };
    }
    return { locked: false };
  }

  /**
   * Generate audit log entry
   */
  generateAuditLog(userId, action, result, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      userId,
      action,
      result: result.success ? 'success' : result.code,
      restrictedHour: this.isRestrictedHour(),
      ...metadata
    };
  }

  /**
   * Enable/disable security for specific hours
   */
  setRestrictedHours(startHour, endHour) {
    this.blockStartHour = startHour;
    this.blockEndHour = endHour;
  }
}

module.exports = AuthSecurityGuard;
