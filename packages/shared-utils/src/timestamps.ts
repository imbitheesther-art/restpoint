/**
 * @file packages/shared-utils/src/timestamps.ts
 * CENTRALIZED: All services MUST use this for timestamps
 * Uses Luxon with Africa/Nairobi timezone
 * All DB timestamp fields should be nullable; values set here at application level
 */

import { DateTime } from 'luxon';

const DEFAULT_TZ = 'Africa/Nairobi';

/**
 * Get current Kenya time as ISO string (YYYY-MM-DD HH:mm:ss)
 * This is the ONE source of truth for all timestamps across all services
 */
export function getKenyaTimeISO(): string {
  try {
    const luxonTime = DateTime.now()
      .setZone(DEFAULT_TZ)
      .toFormat('yyyy-LL-dd HH:mm:ss');

    if (luxonTime) return luxonTime;
  } catch (err) {
    console.error('⚠️ Luxon failed in getKenyaTimeISO:', (err as Error).message);
  }

  // Native fallback
  try {
    const date = new Date();
    const fmt = new Intl.DateTimeFormat('en-KE', {
      timeZone: DEFAULT_TZ,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

    const [d, m, y] = fmt.split(',')[0].split('/');
    const [hh, mm, ss] = fmt.split(', ')[1].split(':');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  } catch (err) {
    console.error('⚠️ Native TZ fallback failed:', (err as Error).message);
  }

  // Manual Kenya time (UTC + 3)
  try {
    const now = new Date();
    const kenyaMs = now.getTime() + 3 * 60 * 60 * 1000;
    const kenyaDate = new Date(kenyaMs);
    const pad = (n: number): string => (n < 10 ? '0' + n : n.toString());

    return `${kenyaDate.getUTCFullYear()}-${pad(kenyaDate.getUTCMonth() + 1)}-${pad(kenyaDate.getUTCDate())} ${pad(kenyaDate.getUTCHours())}:${pad(kenyaDate.getUTCMinutes())}:${pad(kenyaDate.getUTCSeconds())}`;
  } catch (err) {
    console.error('❌ Manual Kenya fallback failed:', (err as Error).message);
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }
}

/**
 * Get current Kenya time as a formatted string
 */
export function getKenyaTimeFormatted(format: string = 'dd-LLL-yyyy HH:mm:ss'): string {
  try {
    return DateTime.now().setZone(DEFAULT_TZ).toFormat(format);
  } catch {
    const iso = getKenyaTimeISO();
    return iso.replace(/-/g, '/');
  }
}

/**
 * Get current Kenya time as a Luxon DateTime object
 */
export function getKenyaDateTime(): DateTime {
  return DateTime.now().setZone(DEFAULT_TZ);
}

/**
 * Get current Kenya timestamp in milliseconds
 */
export function getKenyaTimeMs(): number {
  return DateTime.now().setZone(DEFAULT_TZ).toMillis();
}

/**
 * Format a Date or ISO string to Kenya timezone
 */
export function toKenyaTime(input: Date | string, format: string = 'yyyy-LL-dd HH:mm:ss'): string {
  try {
    const dt = typeof input === 'string' ? DateTime.fromISO(input) : DateTime.fromJSDate(input);
    return dt.setZone(DEFAULT_TZ).toFormat(format);
  } catch {
    return getKenyaTimeISO();
  }
}

/**
 * Get current date portion only (YYYY-MM-DD)
 */
export function getKenyaDate(): string {
  return DateTime.now().setZone(DEFAULT_TZ).toFormat('yyyy-LL-dd');
}

export default {
  getKenyaTimeISO,
  getKenyaTimeFormatted,
  getKenyaDateTime,
  getKenyaTimeMs,
  toKenyaTime,
  getKenyaDate,
};