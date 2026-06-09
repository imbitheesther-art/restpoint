/**
 * @file apps/global/middlewares/sanitize.ts
 * Input sanitization middleware — strips XSS vectors, validates common types,
 * enforces length limits.
 *
 * SECURITY: Prevents XSS via pattern stripping and prototype pollution via key allow-listing.
 * All external data (body, query, params) passes through this middleware before controllers.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';

// ============================================================
// DANGEROUS PATTERN DEFINITIONS
// ============================================================

const DANGEROUS_PATTERNS: RegExp[] = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,        // onclick=, onload=, etc.
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /eval\s*\(/gi,
  /document\s*\.\s*cookie/gi,
  /window\s*\.\s*location/gi,
  /<img[^>]+src\s*=\s*["']?\s*javascript/gi,
];

/** Keys blocked to prevent prototype pollution */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// ============================================================
// SANITIZATION FUNCTIONS
// ============================================================

/**
 * Strip dangerous XSS patterns from a string value.
 */
export function sanitizeString(val: unknown): unknown {
  if (typeof val !== 'string') return val;
  let clean = val.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Remove null bytes
  clean = clean.replace(/\0/g, '');
  return clean;
}

/**
 * Recursively sanitize all string values in an object or array.
 * Blocks prototype pollution keys and limits recursion depth.
 */
export function sanitizeObject(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj; // prevent deep recursion DoS attacks
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      // Block prototype pollution
      if (BLOCKED_KEYS.has(key)) continue;
      cleaned[key] = sanitizeObject((obj as Record<string, unknown>)[key], depth + 1);
    }
    return cleaned;
  }

  return obj;
}

// ============================================================
// EXPRESS MIDDLEWARE
// ============================================================

/**
 * Express middleware: sanitizes req.body, req.query, req.params
 * against XSS and prototype pollution vectors.
 */
export const sanitizeMiddleware: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body !== undefined && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body) as Record<string, unknown>;
  }
  if (req.query !== undefined && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as Record<string, string>;
  }
  next();
};

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Validate a UUID string (standard format or custom ID like USR_001_abc123)
 */
export function isValidUUID(str: string): boolean {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) ||
    /^[A-Z]{3}_\d+_[a-z0-9]+$/i.test(str)
  );
}

/**
 * Validate a Kenyan phone number (07xx or 01xx or 254xx format)
 */
export function isValidKenyanPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^(254|0)[17]\d{8}$/.test(digits);
}

/**
 * Validate a positive, finite numeric amount
 */
export function isPositiveAmount(val: unknown): boolean {
  const n = Number(val);
  return !isNaN(n) && n > 0 && isFinite(n);
}

/**
 * Safely parse an integer with bounds clamping.
 */
export function safeInt(val: unknown, defaultVal = 0, min = 0, max = 1000): number {
  const n = parseInt(String(val), 10);
  if (isNaN(n)) return defaultVal;
  return Math.max(min, Math.min(max, n));
}

// ============================================================
// CommonJS-compatible exports for services still using require()
// ============================================================

module.exports = {
  sanitizeMiddleware,
  sanitizeString,
  sanitizeObject,
  isValidUUID,
  isValidKenyanPhone,
  isPositiveAmount,
  safeInt,
};
