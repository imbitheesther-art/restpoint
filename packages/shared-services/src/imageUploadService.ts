/**
 * Centralized Image Upload Service
 *
 * Provides a unified image upload pipeline for ALL services:
 * - Deceased signatures & documents
 * - Coffin inventory images
 * - Flower booking images
 * - Workshop/hearse images
 *
 * Pipeline:
 *   1. Validate file type & size
 *   2. Resize to optimal dimensions (configurable per category)
 *   3. Convert to efficient format (WebP preferred, JPEG fallback)
 *   4. Compress with quality optimization
 *   5. Store in unified uploads/ directory
 *   6. Return relative URL path
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// ============================================
// CONFIGURATION
// ============================================

const UPLOADS_BASE_DIR = process.env.UPLOADS_BASE_DIR
  ? path.resolve(process.env.UPLOADS_BASE_DIR)
  : path.resolve(process.cwd(), 'uploads');

export const UPLOADS_BASE_PATH = UPLOADS_BASE_DIR;

export interface ImageOptimizationConfig {
  /** Max width in pixels (null = no resize) */
  maxWidth: number | null;
  /** Max height in pixels (null = no resize) */
  maxHeight: number | null;
  /** Output quality (1-100) */
  quality: number;
  /** Output format */
  format: 'jpeg' | 'png' | 'webp';
  /** Whether to use progressive JPEG / interlaced PNG */
  progressive: boolean;
  /** PNG compression level (only for PNG output) */
  pngCompressionLevel?: number;
  /** Whether to strip EXIF metadata */
  stripMetadata: boolean;
}

export interface UploadResult {
  /** Relative URL path (e.g. /uploads/signatures/sig_xxx.webp) */
  urlPath: string;
  /** Absolute filesystem path */
  absolutePath: string;
  /** Original uploaded filename */
  originalName: string;
  /** Final stored filename */
  storedName: string;
  /** Final file size in bytes */
  size: number;
  /** MIME type of the stored file */
  mimeType: string;
}

export type UploadCategory =
  | 'signatures'
  | 'coffins'
  | 'flower-bookings'
  | 'deceased-documents'
  | 'hearses'
  | 'workshops'
  | 'tenant-logos'
  | 'general';

// ============================================
// PER-CATEGORY DEFAULTS
// ============================================

const CATEGORY_CONFIGS: Record<UploadCategory, ImageOptimizationConfig> = {
  signatures: {
    maxWidth: 800,
    maxHeight: 300,
    quality: 80,
    format: 'webp',
    progressive: false,
    stripMetadata: true,
  },
  coffins: {
    maxWidth: 1200,
    maxHeight: null,
    quality: 80,
    format: 'webp',
    progressive: true,
    stripMetadata: true,
  },
  'flower-bookings': {
    maxWidth: 1200,
    maxHeight: null,
    quality: 80,
    format: 'webp',
    progressive: true,
    stripMetadata: true,
  },
  'deceased-documents': {
    maxWidth: 2000,
    maxHeight: null,
    quality: 85,
    format: 'jpeg',
    progressive: true,
    stripMetadata: true,
  },
  hearses: {
    maxWidth: 1400,
    maxHeight: null,
    quality: 80,
    format: 'webp',
    progressive: true,
    stripMetadata: true,
  },
  workshops: {
    maxWidth: 1400,
    maxHeight: null,
    quality: 80,
    format: 'webp',
    progressive: true,
    stripMetadata: true,
  },
  'tenant-logos': {
    maxWidth: 400,
    maxHeight: 400,
    quality: 90,
    format: 'webp',
    progressive: false,
    stripMetadata: true,
  },
  general: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    format: 'webp',
    progressive: true,
    stripMetadata: true,
  },
};

// ============================================
// ALLOWED MIME TYPES
// ============================================

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB default

// ============================================
// SERVICE
// ============================================

class ImageUploadService {
  /**
   * Upload and optimize a single image.
   *
   * @param buffer - Raw image buffer (from multer or base64 decode)
   * @param originalName - Original filename (for extension detection)
   * @param category - Upload category (determines size/quality presets)
   * @param tenantSlug - Tenant slug for folder organization
   * @param customId - Optional custom ID for subfolder (e.g. deceasedId, coffinId)
   * @param overrides - Optional config overrides
   */
  async uploadImage(
    buffer: Buffer,
    originalName: string,
    category: UploadCategory,
    tenantSlug: string,
    customId?: string,
    overrides?: Partial<ImageOptimizationConfig>
  ): Promise<UploadResult> {
    // Validate file type
    const mimeType = this.detectMimeType(buffer, originalName);
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      const mb = (MAX_FILE_SIZE / 1024 / 1024).toFixed(1);
      throw new Error(`File too large. Maximum size is ${mb} MB`);
    }

    // Build config
    const baseConfig = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.general;
    const config: ImageOptimizationConfig = { ...baseConfig, ...overrides };

    // Build folder path
    const relativeDir = this.buildRelativeDir(category, tenantSlug, customId);
    const absoluteDir = path.join(UPLOADS_BASE_DIR, relativeDir);
    await fs.mkdir(absoluteDir, { recursive: true });

    // Generate unique filename
    const ext = config.format === 'jpeg' ? '.jpg' : `.${config.format}`;
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(8).toString('hex');
    const storedName = `${timestamp}-${randomHex}${ext}`;
    const absolutePath = path.join(absoluteDir, storedName);
    const urlPath = `/uploads/${relativeDir.replace(/\\/g, '/')}/${storedName}`;

    // Process with sharp
    let pipeline = sharp(buffer);

    // Strip EXIF metadata
    if (config.stripMetadata) {
      // sharp strips metadata by default when re-encoding
    }

    // Resize
    const resizeOptions: sharp.ResizeOptions = {};
    if (config.maxWidth || config.maxHeight) {
      resizeOptions.fit = 'inside';
      resizeOptions.withoutEnlargement = true;
    }
    if (config.maxWidth) resizeOptions.width = config.maxWidth;
    if (config.maxHeight) resizeOptions.height = config.maxHeight;

    if (resizeOptions.width || resizeOptions.height) {
      pipeline = pipeline.resize(resizeOptions);
    }

    // Apply format-specific output options
    switch (config.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality: config.quality,
          progressive: config.progressive,
          mozjpeg: true,
        });
        break;
      case 'webp':
        pipeline = pipeline.webp({
          quality: config.quality,
          effort: 6,
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality: config.quality,
          compressionLevel: config.pngCompressionLevel ?? 9,
          palette: true,
          adaptiveFiltering: true,
          progressive: config.progressive,
        });
        break;
    }

    // Write to disk
    await pipeline.toFile(absolutePath);

    // Get stats
    const stat = await fs.stat(absolutePath);

    const resultMimeType =
      config.format === 'jpeg'
        ? 'image/jpeg'
        : config.format === 'webp'
          ? 'image/webp'
          : 'image/png';

    return {
      urlPath,
      absolutePath,
      originalName,
      storedName,
      size: stat.size,
      mimeType: resultMimeType,
    };
  }

  /**
   * Upload multiple images.
   */
  async uploadImages(
    files: { buffer: Buffer; originalname: string }[],
    category: UploadCategory,
    tenantSlug: string,
    customId?: string,
    overrides?: Partial<ImageOptimizationConfig>
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await this.uploadImage(
        file.buffer,
        file.originalname,
        category,
        tenantSlug,
        customId,
        overrides
      );
      results.push(result);
    }
    return results;
  }

  /**
   * Process a base64-encoded image (for signatures from canvas).
   */
  async uploadBase64Image(
    base64Data: string,
    category: UploadCategory,
    tenantSlug: string,
    filename: string,
    customId?: string,
    overrides?: Partial<ImageOptimizationConfig>
  ): Promise<UploadResult> {
    // Strip data URL prefix if present
    const stripped = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(stripped, 'base64');
    return this.uploadImage(buffer, filename, category, tenantSlug, customId, overrides);
  }

  /**
   * Delete an uploaded image by its URL path.
   */
  async deleteImage(urlPath: string): Promise<boolean> {
    // Convert /uploads/... to filesystem path
    const relativePart = urlPath.replace(/^\/uploads\//, '');
    const absolutePath = path.join(UPLOADS_BASE_DIR, relativePart);

    try {
      await fs.unlink(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Build the relative directory path for a category.
   */
  private buildRelativeDir(
    category: UploadCategory,
    tenantSlug: string,
    customId?: string
  ): string {
    const sanitizedSlug = this.sanitize(tenantSlug);
    const parts = ['tenants', sanitizedSlug, category];

    if (customId) {
      parts.push(this.sanitize(customId));
    }

    return parts.join('/');
  }

  /**
   * Sanitize a folder name (no special chars, lowercase).
   */
  private sanitize(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  /**
   * Detect MIME type from magic bytes buffer + extension fallback.
   */
  private detectMimeType(buffer: Buffer, originalName: string): string {
    // Check magic bytes
    if (buffer.length > 2) {
      // JPEG: FF D8 FF
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
      }
      // PNG: 89 50 4E 47
      if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      ) {
        return 'image/png';
      }
      // WEBP: 52 49 46 46 ... 57 45 42 50
      if (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46
      ) {
        const webpMarker = buffer.toString('ascii', 8, 12);
        if (webpMarker === 'WEBP') {
          return 'image/webp';
        }
      }
      // GIF: 47 49 46 38
      if (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38
      ) {
        return 'image/gif';
      }
    }

    // Fallback to extension
    const ext = path.extname(originalName).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.avif':
        return 'image/avif';
      default:
        return 'application/octet-stream';
    }
  }
}

// Export singleton
export const imageUploadService = new ImageUploadService();
export default imageUploadService;