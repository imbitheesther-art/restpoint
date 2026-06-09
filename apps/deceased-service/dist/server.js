"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '8103', 10);
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Tenant middleware
app.use((req, res, next) => {
    const tenantSlug = req.headers['x-tenant-slug'] || 'system_shared';
    req.tenantSlug = tenantSlug;
    console.log(`[Deceased Service] Tenant: ${tenantSlug}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'deceased-service',
        tenant: req.tenantSlug,
        timestamp: new Date().toISOString()
    });
});
// Basic deceased endpoints
app.get('/api/v1/deceased', (req, res) => {
    res.json({
        success: true,
        message: 'Deceased service is running',
        tenant: req.tenantSlug,
        data: []
    });
});
app.get('/api/v1/deceased/:id', (req, res) => {
    res.json({
        success: true,
        message: `Get deceased with ID: ${req.params.id}`,
        tenant: req.tenantSlug,
        data: { id: req.params.id, name: 'Test Deceased' }
    });
});
app.post('/api/v1/deceased', (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Deceased registered successfully',
        tenant: req.tenantSlug,
        data: req.body,
        deceased_id: `DCD-${Date.now()}`
    });
});
// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Deceased service is running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API: http://localhost:${PORT}/api/v1/deceased`);
});
exports.default = app;
