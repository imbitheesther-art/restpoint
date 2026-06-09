"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateOnboarding = void 0;
const validateOnboarding = (req, res, next) => {
    const { organizationName, email, location, password, termsAccepted } = req.body;
    const errors = [];
    if (!organizationName)
        errors.push('Organization name is required');
    if (!email)
        errors.push('Email is required');
    if (!location)
        errors.push('Location is required');
    if (!password)
        errors.push('Password is required');
    if (!termsAccepted)
        errors.push('You must accept terms and conditions');
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
};
exports.validateOnboarding = validateOnboarding;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email)
        errors.push('Email is required');
    if (!password)
        errors.push('Password is required');
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
};
exports.validateLogin = validateLogin;
