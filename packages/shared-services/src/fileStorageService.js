"use strict";
/**
 * Global File Storage Service
 *
 * Centralized service for managing all file uploads across the application.
 * Provides a unified folder structure for each tenant:
 *
 * uploads/
 *   {tenantSlug}/
 *     deceased/
 *       {deceasedId}/
 *         documents/
 *         images/
 *         exports/
 *     marketplace/
 *       products/
 *       categories/
 *     documents/
 *     invoices/
 *     misc/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStorageService = exports.FileType = exports.FolderCategory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
// Base uploads directory
const UPLOADS_BASE_DIR = process.env.UPLOADS_BASE_DIR || path_1.default.join(process.cwd(), 'uploads');
// Folder categories
var FolderCategory;
(function (FolderCategory) {
    FolderCategory["DECEASED"] = "deceased";
    FolderCategory["MARKETPLACE"] = "marketplace";
    FolderCategory["DOCUMENTS"] = "documents";
    FolderCategory["INVOICES"] = "invoices";
    FolderCategory["EXPORTS"] = "exports";
    FolderCategory["MISC"] = "misc";
})(FolderCategory || (exports.FolderCategory = FolderCategory = {}));
// File types for validation
var FileType;
(function (FileType) {
    FileType["IMAGE"] = "image";
    FileType["DOCUMENT"] = "document";
    FileType["SPREADSHEET"] = "spreadsheet";
    FileType["PDF"] = "pdf";
    FileType["ARCHIVE"] = "archive";
    FileType["OTHER"] = "other";
})(FileType || (exports.FileType = FileType = {}));
// Allowed MIME types
const ALLOWED_MIME_TYPES = {
    [FileType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    [FileType.DOCUMENT]: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    [FileType.SPREADSHEET]: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    [FileType.PDF]: ['application/pdf'],
    [FileType.ARCHIVE]: ['application/zip', 'application/x-rar-compressed'],
    [FileType.OTHER]: ['*']
};
// File extension to type mapping
const EXTENSION_TO_TYPE = {
    '.jpg': FileType.IMAGE,
    '.jpeg': FileType.IMAGE,
    '.png': FileType.IMAGE,
    '.gif': FileType.IMAGE,
    '.webp': FileType.IMAGE,
    '.doc': FileType.DOCUMENT,
    '.docx': FileType.DOCUMENT,
    '.xls': FileType.SPREADSHEET,
    '.xlsx': FileType.SPREADSHEET,
    '.csv': FileType.SPREADSHEET,
    '.pdf': FileType.PDF,
    '.zip': FileType.ARCHIVE,
    '.rar': FileType.ARCHIVE
};
/**
 * File Storage Service
 * Centralized service for all file operations
 */
class FileStorageService {
    static instance;
    constructor() {
        this.initializeBaseDirectory();
    }
    static getInstance() {
        if (!FileStorageService.instance) {
            FileStorageService.instance = new FileStorageService();
        }
        return FileStorageService.instance;
    }
    /**
     * Initialize the base uploads directory
     */
    initializeBaseDirectory() {
        if (!fs_1.default.existsSync(UPLOADS_BASE_DIR)) {
            fs_1.default.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
            console.log(`[FileStorage] Created base uploads directory: ${UPLOADS_BASE_DIR}`);
        }
    }
    /**
     * Get the root path for a tenant
     */
    getTenantRootPath(tenantSlug) {
        const sanitizedSlug = this.sanitizeFolderName(tenantSlug);
        return path_1.default.join(UPLOADS_BASE_DIR, sanitizedSlug);
    }
    /**
     * Get the upload path for a specific category
     */
    getUploadPath(config) {
        const { tenantSlug, category, subFolder } = config;
        const sanitizedSlug = this.sanitizeFolderName(tenantSlug);
        let basePath = path_1.default.join(UPLOADS_BASE_DIR, sanitizedSlug, category);
        if (subFolder) {
            basePath = path_1.default.join(basePath, this.sanitizeFolderName(subFolder));
        }
        if (!fs_1.default.existsSync(basePath)) {
            fs_1.default.mkdirSync(basePath, { recursive: true });
        }
        return basePath;
    }
    /**
     * Sanitize folder name
     */
    sanitizeFolderName(name) {
        return name
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase();
    }
    /**
     * Generate unique filename
     */
    generateFileName(originalName) {
        const ext = path_1.default.extname(originalName).toLowerCase();
        const randomBytes = crypto_1.default.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        return `${timestamp}-${randomBytes}${ext}`;
    }
    /**
     * Detect file type
     */
    detectFileType(mimeType, fileName) {
        for (const [type, mimeTypes] of Object.entries(ALLOWED_MIME_TYPES)) {
            if (mimeTypes.includes(mimeType)) {
                return type;
            }
        }
        const ext = path_1.default.extname(fileName).toLowerCase();
        return EXTENSION_TO_TYPE[ext] || FileType.OTHER;
    }
    /**
     * Validate file
     */
    validateFile(file, allowedTypes, maxFileSize) {
        if (maxFileSize && file.size > maxFileSize) {
            return {
                valid: false,
                error: `File size exceeds maximum of ${this.formatFileSize(maxFileSize)}`
            };
        }
        if (allowedTypes && allowedTypes.length > 0) {
            const fileType = this.detectFileType(file.mimetype, file.originalname);
            if (!allowedTypes.includes(fileType)) {
                return {
                    valid: false,
                    error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
                };
            }
        }
        return { valid: true };
    }
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Delete file
     */
    async deleteFile(relativePath) {
        const fullPath = path_1.default.join(UPLOADS_BASE_DIR, relativePath);
        if (!fs_1.default.existsSync(fullPath)) {
            return false;
        }
        await fs_1.default.promises.unlink(fullPath);
        return true;
    }
    /**
     * Check if file exists
     */
    fileExists(relativePath) {
        const fullPath = path_1.default.join(UPLOADS_BASE_DIR, relativePath);
        return fs_1.default.existsSync(fullPath);
    }
}
// Export singleton instance
exports.fileStorageService = FileStorageService.getInstance();
exports.default = exports.fileStorageService;
//# sourceMappingURL=fileStorageService.js.map