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
export declare enum FolderCategory {
    DECEASED = "deceased",
    MARKETPLACE = "marketplace",
    DOCUMENTS = "documents",
    INVOICES = "invoices",
    EXPORTS = "exports",
    MISC = "misc"
}
export declare enum FileType {
    IMAGE = "image",
    DOCUMENT = "document",
    SPREADSHEET = "spreadsheet",
    PDF = "pdf",
    ARCHIVE = "archive",
    OTHER = "other"
}
export interface UploadConfig {
    tenantSlug: string;
    category: FolderCategory;
    subFolder?: string | undefined;
    maxFileSize?: number;
    allowedTypes?: FileType[];
}
export interface UploadedFile {
    originalName: string;
    storedName: string;
    path: string;
    relativePath: string;
    size: number;
    mimeType: string;
    fileType: FileType;
    uploadedAt: string;
}
export interface TenantFolderInfo {
    tenantSlug: string;
    rootPath: string;
    folders: {
        deceased: string;
        marketplace: string;
        documents: string;
        invoices: string;
        exports: string;
        misc: string;
    };
}
export interface MulterFile {
    originalname: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
    path?: string;
}
/**
 * File Storage Service
 * Centralized service for all file operations
 */
declare class FileStorageService {
    private static instance;
    private constructor();
    static getInstance(): FileStorageService;
    /**
     * Initialize the base uploads directory
     */
    private initializeBaseDirectory;
    /**
     * Get the root path for a tenant
     */
    getTenantRootPath(tenantSlug: string): string;
    /**
     * Get the upload path for a specific category
     */
    getUploadPath(config: UploadConfig): string;
    /**
     * Sanitize folder name
     */
    private sanitizeFolderName;
    /**
     * Generate unique filename
     */
    generateFileName(originalName: string): string;
    /**
     * Detect file type
     */
    detectFileType(mimeType: string, fileName: string): FileType;
    /**
     * Validate file
     */
    validateFile(file: MulterFile, allowedTypes?: FileType[], maxFileSize?: number): {
        valid: boolean;
        error?: string;
    };
    /**
     * Format file size
     */
    private formatFileSize;
    /**
     * Delete file
     */
    deleteFile(relativePath: string): Promise<boolean>;
    /**
     * Check if file exists
     */
    fileExists(relativePath: string): boolean;
}
export declare const fileStorageService: FileStorageService;
export default fileStorageService;
//# sourceMappingURL=fileStorageService.d.ts.map