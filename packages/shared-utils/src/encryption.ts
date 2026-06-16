/**
 * RestPoint Encryption Utility
 * AES-256-GCM encryption for sensitive mortuary data
 * 
 * Uses the provided encryption key to encrypt/decrypt sensitive fields
 * such as national IDs, contact details, medical records, and financial data.
 * 
 * Encryption Key: 8fb4aedaa0609a51e68e249d687ada0c03938ddcd7976e794614824e2f304d48
 */

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_VERSION = 1;

// Encryption key from environment or compiled default
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY || '8fb4aedaa0609a51e68e249d687ada0c03938ddcd7976e794614824e2f304d48';
  return Buffer.from(keyHex, 'hex');
}

export interface EncryptedData {
  iv: string;           // hex
  ciphertext: string;   // hex
  authTag: string;      // hex
  keyVersion: number;
}

/**
 * Encrypt a string value using AES-256-GCM
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    ciphertext,
    authTag,
    keyVersion: KEY_VERSION,
  };
}

/**
 * Decrypt an encrypted value back to plaintext
 */
export function decrypt(encrypted: EncryptedData): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encrypted.iv, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Encrypt a field only if it has a value (for nullable fields)
 */
export function encryptOptional(value: string | null | undefined): EncryptedData | null {
  if (!value) return null;
  return encrypt(value);
}

/**
 * Decrypt a field only if it has value
 */
export function decryptOptional(encrypted: EncryptedData | null | undefined): string | null {
  if (!encrypted) return null;
  return decrypt(encrypted);
}

/**
 * Encrypt an entire object's specified fields in place
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      (result as any)[field] = encrypt(String(result[field]));
    }
  }
  return result;
}

/**
 * Decrypt specified fields of an object in place
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (value && typeof value === 'object' && 'ciphertext' in value) {
      (result as any)[field] = decrypt(value as EncryptedData);
    }
  }
  return result;
}

/**
 * Serialize encrypted data to a JSON-safe string for storage
 */
export function serializeEncrypted(encrypted: EncryptedData): string {
  return JSON.stringify(encrypted);
}

/**
 * Deserialize encrypted data from stored JSON string
 */
export function deserializeEncrypted(stored: string): EncryptedData {
  return JSON.parse(stored) as EncryptedData;
}

/**
 * Encrypt and return as JSON string (for DB storage in TEXT column)
 */
export function encryptToString(plaintext: string): string {
  return serializeEncrypted(encrypt(plaintext));
}

/**
 * Decrypt from JSON string stored in DB
 */
export function decryptFromString(stored: string): string {
  return decrypt(deserializeEncrypted(stored));
}