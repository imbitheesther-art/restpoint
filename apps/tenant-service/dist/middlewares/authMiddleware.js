"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            userId: decoded.userId,
            organizationId: decoded.organizationId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
