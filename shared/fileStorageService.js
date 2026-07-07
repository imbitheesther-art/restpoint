"use strict";
/**
 * Global File Storage Service
 *
 * Re-export from shared-services package for backward compatibility.
 * This file exists at the legacy path `services/global/services/fileStorageService.ts`
 * and re-exports from `packages/shared-services/src/fileStorageService.ts`.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.FileType = exports.FolderCategory = exports.fileStorageService = void 0;
var fileStorageService_1 = require("../packages/shared-services/src/fileStorageService");
Object.defineProperty(exports, "fileStorageService", { enumerable: true, get: function () { return fileStorageService_1.fileStorageService; } });
Object.defineProperty(exports, "FolderCategory", { enumerable: true, get: function () { return fileStorageService_1.FolderCategory; } });
Object.defineProperty(exports, "FileType", { enumerable: true, get: function () { return fileStorageService_1.FileType; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(fileStorageService_1).default; } });
//# sourceMappingURL=fileStorageService.js.map