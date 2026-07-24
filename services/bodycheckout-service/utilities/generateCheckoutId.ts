import crypto from 'crypto';

/**
 * Generate a dated checkout ID with RLS prefix
 * Format: RLS-YYMMDD-XXXXXXXX (where X is hex)
 * Example: RLS-240715-A3F5E8D9
 */
const generateDatedCheckoutId = (): string => {
    const date = new Date();
    const dateStr = date.getFullYear().toString().slice(2) + 
                   String(date.getMonth() + 1).padStart(2, '0') +
                   String(date.getDate()).padStart(2, '0');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `RLS-${dateStr}-${random}`;
};

/**
 * Generate a timestamp-based ID with random suffix
 * Format: RLS-XXXXXXXXXX-XXXX (timestamp in base36 + random)
 * Example: RLS-K4X8F2M9N7-3A5F
 */
const generateTimestampCheckoutId = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `RLS-${timestamp}-${random}`;
};

// Export only the two functions
export {
    generateDatedCheckoutId,
    generateTimestampCheckoutId
};