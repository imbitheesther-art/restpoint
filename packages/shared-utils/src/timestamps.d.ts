/**
 * @file packages/shared-utils/src/timestamps.ts
 * CENTRALIZED: All services MUST use this for timestamps
 * Uses Luxon with Africa/Nairobi timezone
 * All DB timestamp fields should be nullable; values set here at application level
 */
import { DateTime } from 'luxon';
/**
 * Get current Kenya time as ISO string (YYYY-MM-DD HH:mm:ss)
 * This is the ONE source of truth for all timestamps across all services
 */
export declare function getKenyaTimeISO(): string;
/**
 * Get current Kenya time as a formatted string
 */
export declare function getKenyaTimeFormatted(format?: string): string;
/**
 * Get current Kenya time as a Luxon DateTime object
 */
export declare function getKenyaDateTime(): DateTime;
/**
 * Get current Kenya timestamp in milliseconds
 */
export declare function getKenyaTimeMs(): number;
/**
 * Format a Date or ISO string to Kenya timezone
 */
export declare function toKenyaTime(input: Date | string, format?: string): string;
/**
 * Get current date portion only (YYYY-MM-DD)
 */
export declare function getKenyaDate(): string;
declare const _default: {
    getKenyaTimeISO: typeof getKenyaTimeISO;
    getKenyaTimeFormatted: typeof getKenyaTimeFormatted;
    getKenyaDateTime: typeof getKenyaDateTime;
    getKenyaTimeMs: typeof getKenyaTimeMs;
    toKenyaTime: typeof toKenyaTime;
    getKenyaDate: typeof getKenyaDate;
};
export default _default;
//# sourceMappingURL=timestamps.d.ts.map