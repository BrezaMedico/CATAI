import CryptoJS from 'crypto-js';

const MASTER_SECRET_KEY = 'vbestie_e2e_aes256_secret_key_v1_secure';

/**
 * Encrypts plain text string using AES-256
 */
export function encryptText(plainText: string, key: string = MASTER_SECRET_KEY): string {
  if (!plainText) return '';
  try {
    return CryptoJS.AES.encrypt(plainText, key).toString();
  } catch (error) {
    console.warn('Encryption fallback:', error);
    return plainText;
  }
}

/**
 * Decrypts AES-256 cipher string back to plain text
 */
export function decryptText(cipherText: string, key: string = MASTER_SECRET_KEY): string {
  if (!cipherText) return '';
  try {
    // If it doesn't look like base64 or crypto-js format, return as is
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      // Could be legacy unencrypted string
      return cipherText;
    }
    return decrypted;
  } catch {
    // Decryption failed or input was already plaintext
    return cipherText;
  }
}

/**
 * One-way hash for password security and deterministic IDs
 */
export function hashSHA256(input: string): string {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}

/**
 * Safe local storage manager with automatic AES-256 encryption
 */
export const secureStorage = {
  setItem<T>(storageKey: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      const encrypted = encryptText(json);
      localStorage.setItem(`_enc_${storageKey}`, encrypted);
    } catch (err) {
      console.warn('Storage set error:', err);
    }
  },

  getItem<T>(storageKey: string, fallback: T): T {
    try {
      const encrypted = localStorage.getItem(`_enc_${storageKey}`);
      if (!encrypted) {
        // Check unencrypted legacy fallback
        const plain = localStorage.getItem(storageKey);
        if (plain) {
          return JSON.parse(plain);
        }
        return fallback;
      }
      const decrypted = decryptText(encrypted);
      if (!decrypted) return fallback;
      return JSON.parse(decrypted) as T;
    } catch {
      return fallback;
    }
  },

  removeItem(storageKey: string): void {
    try {
      localStorage.removeItem(`_enc_${storageKey}`);
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('Storage remove error:', err);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (err) {
      console.warn('Storage clear error:', err);
    }
  },
};
