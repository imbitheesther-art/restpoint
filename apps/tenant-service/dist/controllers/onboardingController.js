"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Simple in-memory storage
const organizations = [];
const users = [];
class OnboardingController {
    async createOrganization(req, res) {
        try {
            const { organizationName, email, location, password, termsAccepted } = req.body;
            if (!organizationName || !email || !location || !password) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
            if (!termsAccepted) {
                return res.status(400).json({ success: false, message: 'You must accept terms and conditions' });
            }
            // Check if exists
            const existingOrg = organizations.find(org => org.email === email);
            if (existingOrg) {
                return res.status(409).json({ success: false, message: 'Organization already exists' });
            }
            // Create organization
            const organizationId = organizations.length + 1;
            organizations.push({
                id: organizationId,
                organizationName,
                email,
                location,
                termsAccepted,
                isActive: true,
                createdAt: new Date()
            });
            // Hash password and create user
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const userId = users.length + 1;
            users.push({
                id: userId,
                organizationId,
                email,
                passwordHash: hashedPassword,
                role: 'admin',
                isActive: true,
                isVerified: true,
                fullName: organizationName,
                createdAt: new Date()
            });
            // Generate JWT token
            const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
            const token = jsonwebtoken_1.default.sign({ userId, email, organizationId, role: 'admin' }, jwtSecret, { expiresIn: '7d' });
            return res.status(201).json({
                success: true,
                message: 'Organization setup completed!',
                organizationId,
                userId,
                token,
                user: {
                    id: userId,
                    organizationId,
                    email,
                    role: 'admin',
                    isActive: true,
                    isVerified: true,
                    fullName: organizationName,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = users.find(u => u.email === email);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            const isValidPassword = await bcrypt_1.default.compare(password, user.passwordHash);
            if (!isValidPassword) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, organizationId: user.organizationId, role: user.role }, jwtSecret, { expiresIn: '7d' });
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    organizationId: user.organizationId,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    isVerified: user.isVerified,
                    fullName: user.fullName,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt || user.createdAt
                }
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async logout(req, res) {
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    async getOrganization(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            }
            catch (err) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }
            const organization = organizations.find(org => org.id === decoded.organizationId);
            const orgUsers = users.filter(u => u.organizationId === decoded.organizationId);
            return res.status(200).json({
                success: true,
                data: {
                    organization,
                    users: orgUsers,
                    totalUsers: orgUsers.length
                }
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
exports.OnboardingController = OnboardingController;
