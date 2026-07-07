/**
 * RestPoint Document Protection Utility
 *
 * Protects uploaded documents by:
 * - Storing files outside web root
 * - Generating temporary download links with expiration
 * - Restricting access by role
 */
/**
 * Store an uploaded file securely outside web root
 * @param deceasedId - The deceased record ID
 * @param category - Document category (must be in ALLOWED_DIRECTORIES)
 * @param originalName - Original file name
 * @param buffer - File buffer
 * @returns Object with stored path and metadata
 */
export declare function storeDocument(deceasedId: string, category: string, originalName: string, buffer: Buffer): {
    storedPath: string;
    storedName: string;
    mimeType: string;
};
/**
 * Generate a temporary download link for a stored document
 * @param storedPath - Path to the stored file
 * @param expiresInMs - Expiry time in milliseconds
 * @returns Temporary URL with token
 */
export declare function generateTempDownloadLink(storedPath: string, expiresInMs?: number): {
    url: string;
    token: string;
    expiresAt: Date;
};
/**
 * Validate a temporary download token
 * @param storedPath - Path to the stored file
 * @param token - The HMAC token
 * @param expiresAt - Expiry timestamp
 * @returns Whether the token is valid and not expired
 */
export declare function validateDownloadToken(storedPath: string, token: string, expiresAt: number): boolean;
/**
 * Delete a stored document
 * @param storedPath - Full path to the stored file
 */
export declare function deleteDocument(storedPath: string): void;
/**
 * Get a file's buffer for streaming/download
 * @param storedPath - Path to the stored file
 * @returns File buffer or null if not found
 */
export declare function getDocumentBuffer(storedPath: string): Buffer | null;
/**
 * Check if a user role has access to a document category
 */
export declare function hasDocumentAccess(role: string, category: string): boolean;
//# sourceMappingURL=documentProtection.d.ts.map