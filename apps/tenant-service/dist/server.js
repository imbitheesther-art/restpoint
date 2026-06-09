"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const onboardingRoutes_1 = __importDefault(require("./routes/onboardingRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 8102;
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/onboarding', onboardingRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'tenant-service',
        timestamp: new Date().toISOString()
    });
});
// Root endpoint
app.get('/api/v1/restpoint/tenant', (req, res) => {
    res.json({
        success: true,
        message: 'Hello from tenant-service!'
    });
});
// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Tenant service running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Onboarding: http://localhost:${PORT}/api/onboarding/organization`);
});
exports.default = app;
