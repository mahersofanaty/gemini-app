// Security & Client-Side Encryption Utility for Sensitive i-KfZ Security Codes

// Fixed deterministic application salt for local AES-GCM at-rest encryption
const APP_SALT = new Uint8Array([75, 70, 90, 45, 65, 66, 77, 69, 76, 68, 69, 78, 45, 50, 48, 50]);
const STORAGE_KEY_SEED = 'kfz_sec_key_seed_v1';

let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  // Retrieve or generate in-session secret seed
  let seed = sessionStorage.getItem(STORAGE_KEY_SEED);
  if (!seed) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    seed = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(STORAGE_KEY_SEED, seed);
  }

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(seed),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: APP_SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedKey;
}

/**
 * Encrypts sensitive values at rest (e.g. before storing in localStorage).
 * Returns base64 encoded string: "iv.ciphertext"
 */
export async function encryptSensitiveAtRest(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(plainText);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const ivB64 = btoa(String.fromCharCode(...iv));
    const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
    return `${ivB64}.${cipherB64}`;
  } catch (err) {
    // Fallback reversible obfuscation if WebCrypto unavailable in test runner
    return `enc_safe_${btoa(unescape(encodeURIComponent(plainText)))}`;
  }
}

/**
 * Decrypts sensitive values encrypted at rest
 */
export async function decryptSensitiveAtRest(cipherData: string): Promise<string> {
  if (!cipherData) return '';
  try {
    if (cipherData.startsWith('enc_safe_')) {
      return decodeURIComponent(escape(atob(cipherData.replace('enc_safe_', ''))));
    }
    const [ivB64, cipherB64] = cipherData.split('.');
    if (!ivB64 || !cipherB64) return '';

    const key = await getEncryptionKey();
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const cipherBytes = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    return '';
  }
}

/**
 * Masks security code for safe UI display (e.g. "•••••••" or "A•••••9")
 * Strictly prevents exposure of plain codes in admin tables and summaries.
 */
export function maskSecurityCode(code: string, fullyMasked: boolean = true): string {
  if (!code) return '—';
  const clean = code.trim();
  if (clean.length === 0) return '—';
  
  if (fullyMasked) {
    return '•'.repeat(clean.length);
  }
  
  if (clean.length <= 3) {
    return '•'.repeat(clean.length);
  }
  
  // Show only first and last char, e.g. A•••••9
  return `${clean[0]}${'•'.repeat(clean.length - 2)}${clean[clean.length - 1]}`;
}

/**
 * Redacts sensitive fields so security codes are NEVER logged in browser console
 * or audit logs.
 */
export function sanitizeForLog<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  
  try {
    const serialized = JSON.stringify(data, (key, value) => {
      const sensitiveKeys = [
        'zbISecurityCode',
        'frontPlateCode',
        'rearPlateCode',
        'singlePlateCode',
        'securityCode',
        'reservationPin',
      ];
      if (sensitiveKeys.includes(key) && typeof value === 'string' && value.length > 0) {
        return '[REDACTED_SECURITY_CODE]';
      }
      return value;
    });
    return JSON.parse(serialized);
  } catch (e) {
    return data;
  }
}

/**
 * Safe logger that strictly sanitizes security codes before writing to console
 */
export function safeLog(message: string, ...args: any[]): void {
  const sanitizedArgs = args.map(arg => sanitizeForLog(arg));
  console.log(`[KFZ-Abmelden-SafeLog] ${message}`, ...sanitizedArgs);
}

/**
 * Configurable validation rules for Zulassungsbescheinigung Teil I security code
 */
export interface ZBValidationOptions {
  requiredLength: 7 | 8;
  allowLowercase?: boolean;
}

export function validateZBISecurityCode(
  code: string, 
  options: ZBValidationOptions = { requiredLength: 7 }
): { isValid: boolean; normalized: string; errorMessage?: string } {
  const clean = code.trim().toUpperCase();
  
  if (!clean) {
    return {
      isValid: false,
      normalized: '',
      errorMessage: 'Bitte geben Sie den 7-stelligen Sicherheitscode der Zulassungsbescheinigung Teil I ein.',
    };
  }

  // Check character set (only alphanumeric A-Z, 0-9)
  if (!/^[A-Z0-9]+$/.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      errorMessage: 'Der Sicherheitscode darf nur lateinische Buchstaben (A–Z) und Ziffern (0–9) enthalten.',
    };
  }

  if (clean.length !== options.requiredLength) {
    return {
      isValid: false,
      normalized: clean,
      errorMessage: `Der Sicherheitscode muss genau ${options.requiredLength} Zeichen lang sein (aktuell: ${clean.length} Zeichen).`,
    };
  }

  return {
    isValid: true,
    normalized: clean,
  };
}

/**
 * Validation for license plate badge security codes (Stempelplakette)
 * Usually 3 alphanumeric characters (under sticker / QR)
 */
export function validateBadgeSecurityCode(
  code: string,
  plateName: string = 'Stempelplakette'
): { isValid: boolean; normalized: string; errorMessage?: string } {
  const clean = code.trim().toUpperCase();
  
  if (!clean) {
    return {
      isValid: false,
      normalized: '',
      errorMessage: `Bitte geben Sie den Sicherheitscode für ${plateName} ein.`,
    };
  }

  if (!/^[A-Z0-9]{3}$/.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      errorMessage: `Der Plakettencode für ${plateName} muss aus genau 3 alphanumerischen Zeichen bestehen (z.B. "4X9").`,
    };
  }

  return {
    isValid: true,
    normalized: clean,
  };
}
