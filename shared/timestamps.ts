/**
 * @file shared/timestamps.ts
 * PRODUCTION-READY: UTC timestamp utilities for consistent time across all services
 *
 * KEY FEATURES:
 * - All timestamps in UTC by default
 * - ISO 8601 format for consistency
 * - Database ready (MySQL DATETIME format)
 * - Timezone conversions for different regions
 * - Millisecond precision where needed
 *
 * USAGE:
 * import { now, formatForDB, formatForAPI, parseISO } from '../shared/timestamps';
 * const timestamp = now(); // UTC timestamp
 */

/**
 * Get current UTC timestamp (ISO 8601 format)
 * Example: 2026-06-02T10:30:45.123Z
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Get current UTC timestamp in milliseconds since epoch
 */
export function nowMs(): number {
  return Date.now();
}

/**
 * Get current UTC timestamp in seconds since epoch
 */
export function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Format timestamp for MySQL DATETIME column (UTC)
 * Example: 2026-06-02 10:30:45
 */
export function formatForDB(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format timestamp for API responses (ISO 8601)
 * Example: 2026-06-02T10:30:45.123Z
 */
export function formatForAPI(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  return d.toISOString();
}

/**
 * Parse ISO 8601 string to UTC Date object
 */
export function parseISO(isoString: string): Date {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO 8601 date: ${isoString}`);
  }
  return date;
}

/**
 * Parse MySQL DATETIME string (assumes UTC)
 * Example: "2026-06-02 10:30:45" → Date
 */
export function parseDBDatetime(dbDateTime: string): Date {
  // MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
  // Treat as UTC
  const date = new Date(`${dbDateTime}Z`);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid MySQL DATETIME: ${dbDateTime}`);
  }
  return date;
}

/**
 * Get start of day (00:00:00 UTC)
 */
export function startOfDay(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Get end of day (23:59:59.999 UTC)
 */
export function endOfDay(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

/**
 * Get start of month (first day, 00:00:00 UTC)
 */
export function startOfMonth(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

/**
 * Get end of month (last day, 23:59:59.999 UTC)
 */
export function endOfMonth(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string = new Date(), days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date | string = new Date(), hours: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d.getTime());
  result.setUTCHours(result.getUTCHours() + hours);
  return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date | string = new Date(), minutes: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d.getTime());
  result.setUTCMinutes(result.getUTCMinutes() + minutes);
  return result;
}

/**
 * Calculate difference in days between two dates
 */
export function diffDays(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((d2.getTime() - d1.getTime()) / msPerDay);
}

/**
 * Calculate difference in hours between two dates
 */
export function diffHours(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const msPerHour = 60 * 60 * 1000;
  return Math.floor((d2.getTime() - d1.getTime()) / msPerHour);
}

/**
 * Convert UTC date to local timezone display (e.g., East Africa Time)
 * Format: 2026-06-02 13:30:45 EAT
 */
export function toLocalDisplay(date: Date | string, timezoneName: string = 'Africa/Nairobi'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezoneName,
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const values: Record<string, string> = {};
    
    for (const part of parts) {
      if (part.type !== 'literal') {
        values[part.type] = part.value;
      }
    }

    return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
  } catch (error) {
    console.error(`⚠️  Invalid timezone: ${timezoneName}, falling back to UTC`);
    return formatForDB(d);
  }
}

/**
 * Get human-readable relative time
 * Example: "2 hours ago", "in 3 days", "just now"
 */
export function toRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 0) {
    const absSeconds = Math.abs(seconds);
    if (absSeconds < 60) return 'in a few seconds';
    if (absSeconds < 3600) return `in ${Math.floor(absSeconds / 60)} minute(s)`;
    if (absSeconds < 86400) return `in ${Math.floor(absSeconds / 3600)} hour(s)`;
    return `in ${Math.floor(absSeconds / 86400)} day(s)`;
  }

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minute(s) ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour(s) ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day(s) ago`;
  
  return `${Math.floor(seconds / 604800)} week(s) ago`;
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Check if two dates are the same day (UTC)
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

export default {
  now,
  nowMs,
  nowSec,
  formatForDB,
  formatForAPI,
  parseISO,
  parseDBDatetime,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
  addHours,
  addMinutes,
  diffDays,
  diffHours,
  toLocalDisplay,
  toRelativeTime,
  isPast,
  isFuture,
  isSameDay,
};
