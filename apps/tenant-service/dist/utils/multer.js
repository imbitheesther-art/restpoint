"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const uuid_1 = require("uuid");
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
// Ensure upload directory exists
fs_extra_1.default.ensureDirSync(UPLOAD_DIR);
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const tenantId = req.body.tenantId || req.tenantId || 'temp';
        const tenantUploadDir = path_1.default.join(UPLOAD_DIR, tenantId, 'logos');
        fs_extra_1.default.ensureDirSync(tenantUploadDir);
        cb(null, tenantUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        cb(null, filename);
    },
});
// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPG, PNG, and SVG images are allowed'), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2MB
    },
});
