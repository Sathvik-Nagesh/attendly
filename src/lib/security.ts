import DOMPurify from "isomorphic-dompurify";

/**
 * Attendex — Security Utilities
 *
 * Input sanitization (XSS protection).
 * Note: Password hashing is handled by Supabase Auth — no manual bcrypt needed.
 */

// ─── Input Sanitization ───────────────────────────────────────

/** Strips all HTML tags to prevent XSS. Safe for both browser and Node. */
export function sanitize(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/** Sanitizes all string values in an object. */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === "string") {
      result[key] = sanitize(result[key]) as any;
    }
  }
  return result;
}

