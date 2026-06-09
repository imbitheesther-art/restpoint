/**
 * @file shared/fileUpload.ts
 * PRODUCTION-READY: File upload isolation per tenant
 *
 * KEY FEATURES:
 * - Each tenant has isolated upload directory: /uploads/{tenant_slug}/
 * - File type validation (whitelist approach)
 * - File size limits
 * - Safe filename generation
 * - Automatic directory creation
 * - Cleanup utilities
 *
 * USAGE:
 * import { uploadFile, getFilePath, deleteFile } from '../shared/fileUpload';
 * const filePath = await uploadFile(tenantSlug, buffer, 'documents');
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================
// CONFIGURATION
// ============================================================

const BASE_UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || String(50 * 1024 * 1024)); // 50MB default
const ALLOWED_CATEGORIES = ['documents', 'images', 'videos', 'files'];

interface AllowedFileType {
  ext: string;
  mimetype: string;
  category: string;
}

const ALLOWED_FILE_TYPES: Record<string, AllowedFileType[]> = {
  documents: [
    { ext: 'pdf', mimetype: 'application/pdf', category: 'documents' },
    { ext: 'doc', mimetype: 'application/msword', category: 'documents' },
    { ext: 'docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'documents' },
    { ext: 'xls', mimetype: 'application/vnd.ms-excel', category: 'documents' },
    { ext: 'xlsx', mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'documents' },
    { ext: 'csv', mimetype: 'text/csv', category: 'documents' },
    { ext: 'txt', mimetype: 'text/plain', category: 'documents' },
  ],
  images: [
    { ext: 'jpg', mimetype: 'image/jpeg', category: 'images' },
    { ext: 'jpeg', mimetype: 'image/jpeg', category: 'images' },
    { ext: 'png', mimetype: 'image/png', category: 'images' },
    { ext: 'gif', mimetype: 'image/gif', category: 'images' },
    { ext: 'webp', mimetype: 'image/webp', category: 'images' },
    { ext: 'svg', mimetype: 'image/svg+xml', category: 'images' },
  ],
  videos: [
    { ext: 'mp4', mimetype: 'video/mp4', category: 'videos' },
    { ext: 'webm', mimetype: 'video/webm', category: 'videos' },
    { ext: 'mov', mimetype: 'video/quicktime', category: 'videos' },
    { ext: 'avi', mimetype: 'video/x-msvideo', category: 'videos' },
  ],
  files: [
    // Any file type not in above categories
    { ext: '*', mimetype: 'application/octet-stream', category: 'files' },
  ],
};

// ============================================================
// TYPES
// ============================================================

export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string; // Relative path from upload dir
  url: string; // Public URL
  uploadedAt: string; // ISO timestamp
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================
// VALIDATION
// ============================================================

/**
 * Validate tenant slug
 */
function validateTenantSlug(tenantSlug: string): void {
  if (!tenantSlug || tenantSlug.trim() === '') {
    throw new Error('❌ Tenant slug is required');
  }
  if (!/^[a-z0-9-]+$/.test(tenantSlug)) {
    throw new Error('❌ Invalid tenant slug format');
  }
  if (tenantSlug.includes('..') || tenantSlug.includes('/')) {
    throw new Error('❌ Invalid tenant slug: path traversal detected');
  }
}

/**
 * Validate category
 */
function validateCategory(category: string): void {
  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new Error(`❌ Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
  }
}

/**
 * Validate file size
 */
function validateFileSize(size: number): FileValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `❌ File too large. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type
 */
function validateFileType(
  filename: string,
  mimetype: string,
  category: string
): FileValidationResult {
  const ext = path.extname(filename).toLowerCase().slice(1);
  const types = ALLOWED_FILE_TYPES[category] || [];

  const allowed = types.find(
    (t) => t.ext === ext || (t.ext === '*' && category === 'files')
  );

  if (!allowed) {
    return {
      valid: false,
      error: `❌ File type .${ext} not allowed in category: ${category}`,
    };
  }

  return { valid: true };
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Generate safe random filename
 */
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const randomStr = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomStr}${ext}`;
}

/**
 * Sanitize filename (remove special characters)
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9._-]/gi, '_');
}

/**
 * Get tenant directory path
 */
function getTenantDir(tenantSlug: string): string {
  validateTenantSlug(tenantSlug);
  return path.join(BASE_UPLOAD_DIR, tenantSlug);
}

/**
 * Get category directory path
 */
function getCategoryDir(tenantSlug: string, category: string): string {
  validateCategory(category);
  return path.join(getTenantDir(tenantSlug), category);
}

// ============================================================
// CORE OPERATIONS
// ============================================================

/**
 * Ensure upload directories exist
 */
export async function ensureDirectories(tenantSlug: string, category: string = ''): Promise<void> {
  try {
    validateTenantSlug(tenantSlug);

    // Create tenant directory
    const tenantDir = getTenantDir(tenantSlug);
    await fs.mkdir(tenantDir, { recursive: true });

    // Create category subdirectory
    if (category) {
      validateCategory(category);
      const categoryDir = getCategoryDir(tenantSlug, category);
      await fs.mkdir(categoryDir, { recursive: true });
      console.log(`✅ Upload directory ready: ${categoryDir}`);
    } else {
      console.log(`✅ Tenant upload directory ready: ${tenantDir}`);
    }
  } catch (error) {
    console.error('❌ Failed to create upload directories:', error);
    throw error;
  }
}

/**
 * Upload file to tenant directory
 */
export async function uploadFile(
  tenantSlug: string,
  fileBuffer: Buffer,
  originalFilename: string,
  category: string = 'files',
  mimeType: string = 'application/octet-stream'
): Promise<FileUploadResult> {
  try {
    // Validate inputs
    validateTenantSlug(tenantSlug);
    validateCategory(category);

    // Validate file
    const sizeValidation = validateFileSize(fileBuffer.length);
    if (!sizeValidation.valid) {
      throw new Error(sizeValidation.error);
    }

    const typeValidation = validateFileType(originalFilename, mimeType, category);
    if (!typeValidation.valid) {
      throw new Error(typeValidation.error);
    }

    // Ensure directory exists
    await ensureDirectories(tenantSlug, category);

    // Generate safe filename
    const safeFilename = generateSafeFilename(originalFilename);
    const categoryDir = getCategoryDir(tenantSlug, category);
    const fullPath = path.join(categoryDir, safeFilename);

    // Write file
    await fs.writeFile(fullPath, fileBuffer);

    // Construct relative path and URL
    const relativePath = path.relative(BASE_UPLOAD_DIR, fullPath);
    const url = `/uploads/${relativePath.replace(/\\/g, '/')}`;

    console.log(`✅ File uploaded: ${safeFilename} (${fileBuffer.length} bytes)`);

    return {
      filename: safeFilename,
      originalName: sanitizeFilename(originalFilename),
      size: fileBuffer.length,
      mimetype: mimeType,
      path: relativePath,
      url: url,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ File upload failed:', error);
    throw error;
  }
}

/**
 * Get file path
 */
export function getFilePath(tenantSlug: string, relativePath: string): string {
  validateTenantSlug(tenantSlug);
  
  // Prevent path traversal
  if (relativePath.includes('..') || relativePath.startsWith('/')) {
    throw new Error('❌ Invalid file path');
  }

  return path.join(BASE_UPLOAD_DIR, tenantSlug, relativePath);
}

/**
 * Read file
 */
export async function readFile(tenantSlug: string, relativePath: string): Promise<Buffer> {
  try {
    const fullPath = getFilePath(tenantSlug, relativePath);
    const buffer = await fs.readFile(fullPath);
    console.log(`✅ File read: ${relativePath} (${buffer.length} bytes)`);
    return buffer;
  } catch (error) {
    console.error('❌ Failed to read file:', error);
    throw error;
  }
}

/**
 * Delete file
 */
export async function deleteFile(tenantSlug: string, relativePath: string): Promise<void> {
  try {
    validateTenantSlug(tenantSlug);
    const fullPath = getFilePath(tenantSlug, relativePath);
    await fs.unlink(fullPath);
    console.log(`✅ File deleted: ${relativePath}`);
  } catch (error) {
    console.error('❌ Failed to delete file:', error);
    throw error;
  }
}

/**
 * List files in category
 */
export async function listFiles(
  tenantSlug: string,
  category: string = 'files'
): Promise<string[]> {
  try {
    validateTenantSlug(tenantSlug);
    validateCategory(category);
    
    const categoryDir = getCategoryDir(tenantSlug, category);
    const files = await fs.readdir(categoryDir);
    console.log(`✅ Listed ${files.length} files in ${category}`);
    return files;
  } catch (error) {
    console.error('❌ Failed to list files:', error);
    throw error;
  }
}

/**
 * Get file info
 */
export async function getFileInfo(
  tenantSlug: string,
  relativePath: string
): Promise<{ size: number; createdAt: Date; modifiedAt: Date }> {
  try {
    const fullPath = getFilePath(tenantSlug, relativePath);
    const stats = await fs.stat(fullPath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    console.error('❌ Failed to get file info:', error);
    throw error;
  }
}

/**
 * Clear all tenant files (use with caution!)
 */
export async function clearTenant(tenantSlug: string): Promise<void> {
  try {
    validateTenantSlug(tenantSlug);
    const tenantDir = getTenantDir(tenantSlug);
    
    await fs.rm(tenantDir, { recursive: true, force: true });
    console.log(`✅ Cleared all files for tenant: ${tenantSlug}`);
  } catch (error) {
    console.error('❌ Failed to clear tenant files:', error);
    throw error;
  }
}

/**
 * Get storage usage for tenant
 */
export async function getTenantStorageUsage(tenantSlug: string): Promise<number> {
  try {
    validateTenantSlug(tenantSlug);
    const tenantDir = getTenantDir(tenantSlug);

    let totalSize = 0;

    async function getSize(dir: string): Promise<void> {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          await getSize(fullPath);
        } else {
          totalSize += stats.size;
        }
      }
    }

    try {
      await getSize(tenantDir);
    } catch (error) {
      // Directory doesn't exist yet
      totalSize = 0;
    }

    return totalSize;
  } catch (error) {
    console.error('❌ Failed to calculate storage usage:', error);
    throw error;
  }
}

export default {
  ensureDirectories,
  uploadFile,
  getFilePath,
  readFile,
  deleteFile,
  listFiles,
  getFileInfo,
  clearTenant,
  getTenantStorageUsage,
};
