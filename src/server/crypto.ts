import crypto from 'crypto';

// Server-side encryption key for sensitive values at rest
const ENCRYPTION_KEY_STRING = process.env.DATA_ENCRYPTION_KEY || 'kfz-abmelden-secret-encryption-key-2026-strict-32b';
// Ensure exactly 32 bytes for AES-256-GCM
const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY_STRING).digest();

/**
 * Encrypts sensitive plain text using AES-256-GCM.
 * Output format: "ivHex:authTagHex:ciphertextHex"
 */
export function encryptAtRest(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts sensitive ciphertext using AES-256-GCM.
 */
export function decryptAtRest(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) return '';
    
    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[Crypto] Failed to decrypt sensitive data at rest');
    return '';
  }
}

/**
 * Hash password using scrypt with salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against scrypt hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(keyHex, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

/**
 * Generates high-entropy secure session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Masks security code for safe display (e.g. "•••••••").
 * Security codes must NEVER be displayed in plain text.
 */
export function maskCode(code: string | null | undefined): string {
  if (!code) return '—';
  const clean = code.trim();
  if (clean.length === 0) return '—';
  return '•'.repeat(clean.length);
}

/**
 * Strips all sensitive security codes and secrets from any object before logging or saving in audit metadata.
 */
export function sanitizeMetadata(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const forbiddenKeys = [
    'zbISecurityCode',
    'frontPlateSecurityCode',
    'rearPlateSecurityCode',
    'zbiSecurityCode',
    'singlePlateCode',
    'securityCode',
    'password',
    'passwordHash',
    'iban',
    'ibanEncrypted',
    'reservationPin',
    'zbiSecurityCodeEncrypted',
    'frontPlateSecurityCodeEncrypted',
    'rearPlateSecurityCodeEncrypted',
  ];

  if (Array.isArray(data)) {
    return data.map(item => sanitizeMetadata(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (forbiddenKeys.some(f => f.toLowerCase() === key.toLowerCase())) {
      sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
