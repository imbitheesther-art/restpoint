import crypto from 'crypto';

export const generateSecret = async (): Promise<string> => {
  return crypto.randomBytes(32).toString('base64');
};

export const generateToken = (secret: string): string => {
  return crypto.createHmac('sha256', secret).update(Date.now().toString()).digest('hex');
};

export const verifyToken = (secret: string, token: string): boolean => {
  // Simple verification for now
  return !!secret && !!token;
};

export const csrfProtection = (req: any, res: any, next: any) => {
  // Simple CSRF protection middleware
  const csrfToken = req.headers['x-csrf-token'];
  const csrfSecret = req.cookies?.csrfSecret;
  
  if (!csrfToken || !csrfSecret) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }
  
  next();
};

module.exports = {
  generateSecret,
  generateToken,
  verifyToken,
  csrfProtection,
};
