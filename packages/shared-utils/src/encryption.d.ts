/**
 * RestPoint Encryption Utility
 * AES-256-GCM encryption for sensitive mortuary data
 *
 * Uses the provided encryption key to encrypt/decrypt sensitive fields
 * such as national IDs, contact details, medical records, and financial data.
 *
 * Encryption Key: 8fb4aedaa0609a51e68e249d687ada0c03938ddcd7976e794614824e2f304d48
 */
export interface EncryptedData {
    iv: string;
    ciphertext: string;
    authTag: string;
    keyVersion: number;
}
/**
 * Encrypt a string value using AES-256-GCM
 */
export declare function encrypt(plaintext: string): EncryptedData;
/**
 * Decrypt an encrypted value back to plaintext
 */
export declare function decrypt(encrypted: EncryptedData): string;
/**
 * Encrypt a field only if it has a value (for nullable fields)
 */
export declare function encryptOptional(value: string | null | undefined): EncryptedData | null;
/**
 * Decrypt a field only if it has value
 */
export declare function decryptOptional(encrypted: EncryptedData | null | undefined): string | null;
/**
 * Encrypt an entire object's specified fields in place
 */
export declare function encryptFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T;
/**
 * Decrypt specified fields of an object in place
 */
export declare function decryptFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T;
/**
 * Serialize encrypted data to a JSON-safe string for storage
 */
export declare function serializeEncrypted(encrypted: EncryptedData): string;
/**
 * Deserialize encrypted data from stored JSON string
 */
export declare function deserializeEncrypted(stored: string): EncryptedData;
/**
 * Encrypt and return as JSON string (for DB storage in TEXT column)
 */
export declare function encryptToString(plaintext: string): string;
/**
 * Decrypt from JSON string stored in DB
 */
export declare function decryptFromString(stored: string): string;
//# sourceMappingURL=encryption.d.ts.map