/**
 * Attendex — Middleware Utilities
 * 
 * Logic that is safe to run in the Vercel Edge Runtime.
 * Avoid importing heavy libraries like bcrypt or dompurify here.
 */

/**
 * Returns a CSP header string.
 */
export function getCSPHeader(): string {
  // Note: process.env.NODE_ENV is available in Edge Runtime
  const isDev = process.env.NODE_ENV === "development";

  const policies = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      isDev ? "'unsafe-eval'" : ""
    ].filter(Boolean),
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": ["'self'", "data:", "https://i.pravatar.cc", "https://images.unsplash.com"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co"
    ],
  };

  return Object.entries(policies)
    .map(([key, val]) => `${key} ${val.join(" ")}`)
    .join("; ");
}
