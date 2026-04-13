import bcrypt from "bcryptjs";
import DOMPurify from "isomorphic-dompurify";

/**
 * Attendex — Security Utilities
 * 
 * Handles password hashing, input sanitization (XSS protection),
 * and security-related transforms.
 */

// ─── Input Sanitization (XSS Protection) ─────────────────────

/**
 * Sanitizes a string to prevent XSS.
 * Removes harmful HTML tags and attributes while preserving text.
 * Works on both Client (browser) and Server (Node.js).
 */
export function sanitize(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed in text inputs by default
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitizes an object of strings.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === "string") {
      result[key] = sanitize(result[key]) as any;
    }
  }
  return result;
}

// ─── Password Encryption (Bcrypt) ─────────────────────────────

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


// Note: getCSPHeader moved to @/lib/middleware-utils.ts for Edge Compatibility
