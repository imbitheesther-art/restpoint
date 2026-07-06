import { Request, Response, NextFunction } from 'express';

export const validateOnboarding = (req: Request, res: Response, next: NextFunction) => {
  const data = req.body || {};

  // Accept both frontend field names (organizationName) and backend field names (tenant_name)
  const organizationName = data.organizationName || data.tenant_name || '';
  const email = data.email || '';
  const location = data.location || '';
  const password = data.password || '';
  const full_name = data.full_name || data.fullName || 'Admin';
  // Accept both termsAccepted and acceptTerms from frontend
  const termsAccepted = (data.termsAccepted === true || data.termsAccepted === 'true' || data.termsAccepted === 1) ||
    (data.acceptTerms === true || data.acceptTerms === 'true' || data.acceptTerms === 1);

  const errors: string[] = [];

  if (!organizationName) errors.push('Organization name is required');
  if (!email) errors.push('Email is required');
  if (!location) errors.push('Location is required');
  if (!password) errors.push('Password is required');
  if (!termsAccepted) errors.push('You must accept terms and conditions');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Parse branches if it's a JSON string (comes from FormData)
  let branches = data.branches || [];
  if (typeof branches === 'string') {
    try {
      branches = JSON.parse(branches);
    } catch (e) {
      branches = [];
    }
  }
  // Ensure branches is an array
  if (!Array.isArray(branches)) {
    branches = [];
  }

  // Handle single-tenant branchName: convert to branch object
  const branchName = data.branchName || data.branch_name || '';
  if (branchName && branches.length === 0) {
    branches.push({
      branch_name: branchName,
      branch_location: location || 'Main Location',
      branch_phone: data.phone || '',
      branch_email: email
    });
  }

  // Map frontend field names to backend field names for branches
  // Frontend sends: { name, location } | Backend expects: { branch_name, branch_location, branch_phone, branch_email }
  const mappedBranches = branches.map((b: any) => ({
    branch_name: b.branch_name || b.name || '',
    branch_location: b.branch_location || b.location || location || '',
    branch_phone: b.branch_phone || b.phone || data.phone || '',
    branch_email: b.branch_email || b.email || email
  })).filter((b: any) => b.branch_name.trim());

  // Map to what controller.createOrganization expects
  req.body = {
    tenant_name: organizationName,
    email,
    location,
    password,
    full_name,
    phone: data.phone || '',
    country: data.country || 'Kenya',
    branches: mappedBranches,
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
