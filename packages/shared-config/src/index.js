"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTenantActive = exports.tenantMiddleware = exports.releaseConnection = exports.getConnection = exports.safeQueryOne = exports.safeQuery = exports.pool = void 0;
var database_1 = require("./database");
Object.defineProperty(exports, "pool", { enumerable: true, get: function () { return database_1.pool; } });
Object.defineProperty(exports, "safeQuery", { enumerable: true, get: function () { return database_1.safeQuery; } });
Object.defineProperty(exports, "safeQueryOne", { enumerable: true, get: function () { return database_1.safeQueryOne; } });
Object.defineProperty(exports, "getConnection", { enumerable: true, get: function () { return database_1.getConnection; } });
Object.defineProperty(exports, "releaseConnection", { enumerable: true, get: function () { return database_1.releaseConnection; } });
var tenancy_1 = require("./tenancy");
Object.defineProperty(exports, "tenantMiddleware", { enumerable: true, get: function () { return tenancy_1.tenantMiddleware; } });
Object.defineProperty(exports, "validateTenantActive", { enumerable: true, get: function () { return tenancy_1.validateTenantActive; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map