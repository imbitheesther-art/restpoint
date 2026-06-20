import { Request, Response, NextFunction } from 'express';

export const validateOnboarding = (req: Request, res: Response, next: NextFunction) => {
  const data = req.body || {};
  
  // Accept both frontend field names (organizationName) and backend field names (tenant_name)
  const organizationName = data.organizationName || data.tenant_name || '';
  const email = data.email || '';
  const location = data.location || '';
  const password = data.password || '';
  const full_name = data.full_name || data.fullName || 'Admin';
  const termsAccepted = data.termsAccepted === true || data.termsAccepted === 'true' || data.termsAccepted === 1;

  const errors: string[] = [];

  if (!organizationName) errors.push('Organization name is required');
  if (!email) errors.push('Email is required');
  if (!location) errors.push('Location is required');
  if (!password) errors.push('Password is required');
  if (!termsAccepted) errors.push('You must accept terms and conditions');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Map to what controller.createOrganization expects
  req.body = {
    tenant_name: organizationName,
    email,
    location,
    password,
    full_name,
    phone: data.phone || '',
    country: data.country || 'Kenya',
    branches: data.branches || [],
    termsAccepted
  };

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const data = req.body || {};
  const identifier = data.identifier || data.email || '';
  const password = data.password || '';

  const errors: string[] = [];

  if (!identifier) errors.push('Email or username is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Pass identifier through to the controller (not just email)
  req.body = { identifier, password };

  next();
};
