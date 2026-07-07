"use strict";
/**
 * RestPoint Encryption Utility
 * AES-256-GCM encryption for sensitive mortuary data
 *
 * Uses the provided encryption key to encrypt/decrypt sensitive fields
 * such as national IDs, contact details, medical records, and financial data.
 *
 * Encryption Key: 8fb4aedaa0609a51e68e249d687ada0c03938ddcd7976e794614824e2f304d48
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.encryptOptional = encryptOptional;
exports.decryptOptional = decryptOptional;
exports.encryptFields = encryptFields;
exports.decryptFields = decryptFields;
exports.serializeEncrypted = serializeEncrypted;
exports.deserializeEncrypted = deserializeEncrypted;
exports.encryptToString = encryptToString;
exports.decryptFromString = decryptFromString;
const crypto = __importStar(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_VERSION = 1;
// Encryption key from environment or compiled default
function getEncryptionKey() {
    const keyHex = process.env.ENCRYPTION_KEY || '8fb4aedaa0609a51e68e249d687ada0c03938ddcd7976e794614824e2f304d48';
    return Buffer.from(keyHex, 'hex');
}
/**
 * Encrypt a string value using AES-256-GCM
 */
function encrypt(plaintext) {
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
function decrypt(encrypted) {
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
function encryptOptional(value) {
    if (!value)
        return null;
    return encrypt(value);
}
/**
 * Decrypt a field only if it has value
 */
function decryptOptional(encrypted) {
    if (!encrypted)
        return null;
    return decrypt(encrypted);
}
/**
 * Encrypt an entire object's specified fields in place
 */
function encryptFields(obj, fields) {
    const result = { ...obj };
    for (const field of fields) {
        if (result[field] !== undefined && result[field] !== null) {
            result[field] = encrypt(String(result[field]));
        }
    }
    return result;
}
/**
 * Decrypt specified fields of an object in place
 */
function decryptFields(obj, fields) {
    const result = { ...obj };
    for (const field of fields) {
        const value = result[field];
        if (value && typeof value === 'object' && 'ciphertext' in value) {
            result[field] = decrypt(value);
        }
    }
    return result;
}
/**
 * Serialize encrypted data to a JSON-safe string for storage
 */
function serializeEncrypted(encrypted) {
    return JSON.stringify(encrypted);
}
/**
 * Deserialize encrypted data from stored JSON string
 */
function deserializeEncrypted(stored) {
    return JSON.parse(stored);
}
/**
 * Encrypt and return as JSON string (for DB storage in TEXT column)
 */
function encryptToString(plaintext) {
    return serializeEncrypted(encrypt(plaintext));
}
/**
 * Decrypt from JSON string stored in DB
 */
function decryptFromString(stored) {
    return decrypt(deserializeEncrypted(stored));
}
//# sourceMappingURL=encryption.js.map