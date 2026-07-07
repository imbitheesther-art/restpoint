"use strict";
/**
 * @file packages/shared-services/src/index.ts
 * CENTRALIZED: Exports all shared services
 */
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
exports.FolderCategory = exports.fileStorageService = void 0;
const fileStorageService_1 = require("./fileStorageService");
Object.defineProperty(exports, "fileStorageService", { enumerable: true, get: function () { return fileStorageService_1.fileStorageService; } });
Object.defineProperty(exports, "FolderCategory", { enumerable: true, get: function () { return fileStorageService_1.FolderCategory; } });
__exportStar(require("./redisService"), exports);
__exportStar(require("./rabbitmqService"), exports);
//# sourceMappingURL=index.js.map