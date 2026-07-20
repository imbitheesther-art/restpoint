
import crypto from 'crypto'

const generateUniqueDeceasedId = (fullName: string, tenantSlug: string): string => {
    const sanitizedTenant = tenantSlug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    const namePart = fullName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'XXX';
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${sanitizedTenant}-${namePart}-${timestamp}-${random}`;
};


export default generateUniqueDeceasedId;


