import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES AND INTERFACES
// ============================================

export interface TenantInfo {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export interface DeceasedInfo {
  deceasedId: string;
  deceasedName?: string;
  tenantId: string;
}

export interface UploadContext {
  tenantId: string;
  tenantName?: string;
  tenantSlug?: string;
  deceasedId?: string;
  category?: UploadCategory;
  subCategory?: string;
}

export type UploadCategory = 
  | 'coffins'
  | 'documents'
  | 'postmortem'
  | 'certificates'
  | 'images'
  | 'videos'
  | 'audio'
  | 'other';

export interface UploadOptions {
  category: UploadCategory;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  preserveOriginalName?: boolean;
  generateThumbnails?: boolean;
}

// ============================================
// FILE TYPE DEFINITIONS
// ============================================

export const CategoryFileTypes = {
  coffins: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: 'Coffin images and specifications'
  },
  documents: {
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxSize: 20 * 1024 * 1024, // 20MB
    description: 'Legal documents, contracts, agreements'
  },
  postmortem: {
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'],
    maxSize: 25 * 1024 * 1024, // 25MB
    description: 'Post-mortem reports and findings'
  },
  certificates: {
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Death certificates, permits'
  },
  images: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    maxSize: 15 * 1024 * 1024, // 15MB
    description: 'General images and photos'
  },
  videos: {
    allowedMimeTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    maxSize: 100 * 1024 * 1024, // 100MB
    description: 'Video recordings'
  },
  audio: {
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 30 * 1024 * 1024, // 30MB
    description: 'Audio recordings'
  },
  other: {
    allowedMimeTypes: ['*/*'],
    maxSize: 50 * 1024 * 1024, // 50MB
    description: 'Other file types'
  }
};

// ============================================
// TENANT STORAGE ENGINE
// ============================================

class MultiTenantStorageEngine implements StorageEngine {
  private baseUploadDir: string;
  
  constructor() {
    this.baseUploadDir = path.resolve(process.cwd(), 'uploads', 'tenants');
    this.ensureBaseDirectory();
  }
  
  private ensureBaseDirectory(): void {
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }
  
  /**
   * Get tenant directory path
   */
  private getTenantDir(tenantId: string, tenantSlug?: string): string {
    const tenantFolder = tenantSlug ? `${tenantId}-${tenantSlug}` : tenantId;
    return path.join(this.baseUploadDir, tenantFolder);
  }
  
  /**
   * Get deceased directory path
   */
  private getDeceasedDir(tenantId: string, deceasedId: string, tenantSlug?: string): string {
    const tenantDir = this.getTenantDir(tenantId, tenantSlug);
    return path.join(tenantDir, 'deceased', deceasedId);
  }
  
  /**
   * Get category directory path
   */
  private getCategoryDir(
    tenantId: string,
    category: UploadCategory,
    deceasedId?: string,
    tenantSlug?: string
  ): string {
    if (deceasedId) {
      // Deceased-specific category
      const deceasedDir = this.getDeceasedDir(tenantId, deceasedId, tenantSlug);
      return path.join(deceasedDir, category);
    } else {
      // Tenant-level category (e.g., shared coffins catalog)
      const tenantDir = this.getTenantDir(tenantId, tenantSlug);
      return path.join(tenantDir, category);
    }
  }
  
  /**
   * Ensure directory exists
   */
  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  
  /**
   * Generate filename
   */
  private generateFilename(
    req: Request,
    file: Express.Multer.File,
    context: UploadContext
  ): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, ext);
    
    // Sanitize original name
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    // Create filename with context
    const parts = [
      timestamp,
      random,
      context.deceasedId || 'tenant',
      context.category,
      sanitizedName
    ];
    
    return `${parts.join('-')}${ext}`;
  }
  
  _handleFile(req: Request, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
    const context = (req as any).uploadContext as UploadContext;
    
    if (!context || !context.tenantId) {
      return cb(new Error('Tenant context is required for upload'));
    }
    
    try {
      // Get the appropriate directory
      const categoryDir = this.getCategoryDir(
        context.tenantId,
        context.category,
        context.deceasedId,
        context.tenantSlug
      );
      
      // Ensure directory exists
      this.ensureDirectory(categoryDir);
      
      // Generate filename
      const filename = this.generateFilename(req, file, context);
      const filePath = path.join(categoryDir, filename);
      const relativePath = path.relative(this.baseUploadDir, filePath);
      
      // Create write stream
      const writeStream = fs.createWriteStream(filePath);
      
      file.stream.pipe(writeStream);
      
      writeStream.on('error', (error) => {
        cb(error);
      });
      
      writeStream.on('finish', () => {
        const stats = fs.statSync(filePath);
        
        // Store metadata
        const fileInfo = {
          filename: filename,
          path: filePath,
          relativePath: relativePath,
          size: stats.size,
          mimetype: file.mimetype,
          originalname: file.originalname,
          encoding: file.encoding,
          destination: categoryDir,
          fieldname: file.fieldname,
          tenantId: context.tenantId,
          deceasedId: context.deceasedId,
          category: context.category,
          uploadedAt: new Date().toISOString()
        };
        
        // Attach metadata to file object
        (file as any).tenantId = context.tenantId;
        (file as any).deceasedId = context.deceasedId;
        (file as any).category = context.category;
        (file as any).relativePath = relativePath;
        (file as any).metadata = fileInfo;
        
        cb(null, {
          destination: categoryDir,
          filename: filename,
          path: filePath,
          size: stats.size
        });
      });
    } catch (error) {
      cb(error);
    }
  }
  
  _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void {
    const filePath = file.path;
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        cb(err);
      });
    } else {
      cb(null);
    }
  }
}

// ============================================
// MULTI-TENANT UPLOAD MANAGER
// ============================================

class MultiTenantUploadManager {
  private storage: MultiTenantStorageEngine;
  
  constructor() {
    this.storage = new MultiTenantStorageEngine();
  }
  
  /**
   * Create upload middleware with context
   */
  upload(options: UploadOptions) {
    const multerOptions: multer.Options = {
      storage: this.storage,
      limits: {
        fileSize: options.maxFileSize || CategoryFileTypes[options.category]?.maxSize || 10 * 1024 * 1024
      }
    };
    
    // Add file filter if specified
    if (options.allowedMimeTypes) {
      multerOptions.fileFilter = (req, file, cb) => {
        if (options.allowedMimeTypes!.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type for ${options.category}. Allowed: ${options.allowedMimeTypes!.join(', ')}`));
        }
      };
    } else if (CategoryFileTypes[options.category]) {
      // Use category default allowed types
      const allowedTypes = CategoryFileTypes[options.category].allowedMimeTypes;
      if (allowedTypes[0] !== '*/*') {
        multerOptions.fileFilter = (req, file, cb) => {
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error(`Invalid file type for ${options.category}. Allowed: ${allowedTypes.join(', ')}`));
          }
        };
      }
    }
    
    const upload = multer(multerOptions);
    
    // Return middleware that sets context
    return (fieldName: string, context: UploadContext) => {
      return (req: Request, res: any, next: any) => {
        // Set upload context on request
        (req as any).uploadContext = {
          ...context,
          category: options.category
        };
        
        // Apply multer middleware
        upload.single(fieldName)(req, res, (err: any) => {
          if (err) {
            return next(err);
          }
          next();
        });
      };
    };
  }
  
  /**
   * Upload multiple files
   */
  uploadArray(options: UploadOptions) {
    const multerOptions: multer.Options = {
      storage: this.storage,
      limits: {
        fileSize: options.maxFileSize || CategoryFileTypes[options.category]?.maxSize || 10 * 1024 * 1024
      }
    };
    
    const upload = multer(multerOptions);
    
    return (fieldName: string, maxCount: number, context: UploadContext) => {
      return (req: Request, res: any, next: any) => {
        (req as any).uploadContext = {
          ...context,
          category: options.category
        };
        
        upload.array(fieldName, maxCount)(req, res, next);
      };
    };
  }
  
  /**
   * Upload multiple fields
   */
  uploadFields(options: UploadOptions) {
    const multerOptions: multer.Options = {
      storage: this.storage,
      limits: {
        fileSize: options.maxFileSize || CategoryFileTypes[options.category]?.maxSize || 10 * 1024 * 1024
      }
    };
    
    const upload = multer(multerOptions);
    
    return (fields: multer.Field[], context: UploadContext) => {
      return (req: Request, res: any, next: any) => {
        (req as any).uploadContext = {
          ...context,
          category: options.category
        };
        
        upload.fields(fields)(req, res, next);
      };
    };
  }
  
  /**
   * Delete tenant files
   */
  async deleteTenantFiles(tenantId: string, tenantSlug?: string): Promise<boolean> {
    const tenantFolder = tenantSlug ? `${tenantId}-${tenantSlug}` : tenantId;
    const tenantPath = path.join(this.storage['baseUploadDir'], tenantFolder);
    
    if (fs.existsSync(tenantPath)) {
      fs.rmSync(tenantPath, { recursive: true, force: true });
      return true;
    }
    return false;
  }
  
  /**
   * Delete deceased files
   */
  async deleteDeceasedFiles(tenantId: string, deceasedId: string, tenantSlug?: string): Promise<boolean> {
    const tenantDir = path.join(this.storage['baseUploadDir'], tenantSlug ? `${tenantId}-${tenantSlug}` : tenantId);
    const deceasedPath = path.join(tenantDir, 'deceased', deceasedId);
    
    if (fs.existsSync(deceasedPath)) {
      fs.rmSync(deceasedPath, { recursive: true, force: true });
      return true;
    }
    return false;
  }
  
  /**
   * Delete category files
   */
  async deleteCategoryFiles(
    tenantId: string,
    category: UploadCategory,
    deceasedId?: string,
    tenantSlug?: string
  ): Promise<boolean> {
    const tenantDir = path.join(this.storage['baseUploadDir'], tenantSlug ? `${tenantId}-${tenantSlug}` : tenantId);
    let categoryPath: string;
    
    if (deceasedId) {
      categoryPath = path.join(tenantDir, 'deceased', deceasedId, category);
    } else {
      categoryPath = path.join(tenantDir, category);
    }
    
    if (fs.existsSync(categoryPath)) {
      fs.rmSync(categoryPath, { recursive: true, force: true });
      return true;
    }
    return false;
  }
  
  /**
   * Get file info
   */
  getFileInfo(relativePath: string): any {
    const fullPath = path.join(this.storage['baseUploadDir'], relativePath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return {
        exists: true,
        path: relativePath,
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime
      };
    }
    return { exists: false };
  }
  
  /**
   * List tenant files
   */
  listTenantFiles(tenantId: string, tenantSlug?: string, category?: string, deceasedId?: string): string[] {
    const tenantDir = path.join(this.storage['baseUploadDir'], tenantSlug ? `${tenantId}-${tenantSlug}` : tenantId);
    let searchPath = tenantDir;
    
    if (deceasedId) {
      searchPath = path.join(tenantDir, 'deceased', deceasedId);
    }
    
    if (category) {
      searchPath = path.join(searchPath, category);
    }
    
    if (!fs.existsSync(searchPath)) {
      return [];
    }
    
    const files: string[] = [];
    const walkDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          walkDir(itemPath);
        } else {
          files.push(path.relative(this.storage['baseUploadDir'], itemPath));
        }
      });
    };
    
    walkDir(searchPath);
    return files;
  }
  
  /**
   * Get storage statistics
   */
  getStorageStats(tenantId?: string): any {
    const basePath = tenantId 
      ? path.join(this.storage['baseUploadDir'], tenantId)
      : this.storage['baseUploadDir'];
    
    if (!fs.existsSync(basePath)) {
      return { totalSize: 0, fileCount: 0 };
    }
    
    let totalSize = 0;
    let fileCount = 0;
    
    const calculate = (dir: string) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          calculate(itemPath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      });
    };
    
    calculate(basePath);
    
    return {
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      fileCount,
      tenantId: tenantId || 'all'
    };
  }
}

// ============================================
// CREATE MANAGER INSTANCE
// ============================================

export const multiTenantUpload = new MultiTenantUploadManager();

// ============================================
// HELPER MIDDLEWARE
// ============================================

export const setTenantContext = (tenantId: string, tenantSlug?: string, deceasedId?: string) => {
  return (req: Request, res: any, next: any) => {
    (req as any).tenantContext = {
      tenantId,
      tenantSlug,
      deceasedId
    };
    next();
  };
};

// ============================================
// ERROR HANDLER
// ============================================

export const uploadErrorHandler = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: err.code,
      message: err.message
    });
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_FILE_TYPE',
      message: err.message
    });
  }
  
  next(err);
};

// ============================================
// EXPORTS
// ============================================

export { MultiTenantStorageEngine, MultiTenantUploadManager, UploadCategory };
export default multiTenantUpload;