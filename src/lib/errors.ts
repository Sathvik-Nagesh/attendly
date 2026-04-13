/**
 * Attendly — Error Handling Utilities
 * Centralized error handling for consistent UX and logging.
 */

// ─── Custom Error Classes ────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super("Validation failed", 400);
    this.fields = fields;
  }
}

// ─── Error Handler ───────────────────────────────────────────

/**
 * Formats any error into a consistent API response shape.
 * Use in API route catch blocks.
 */
export function handleApiError(error: unknown): {
  status: number;
  body: { success: false; error: string; fields?: Record<string, string> };
} {
  // Known operational errors
  if (error instanceof ValidationError) {
    return {
      status: error.statusCode,
      body: { success: false, error: error.message, fields: error.fields },
    };
  }

  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: { success: false, error: error.message },
    };
  }

  // Unknown errors — log and return generic message
  console.error("[UNHANDLED ERROR]", error);

  return {
    status: 500,
    body: { success: false, error: "An unexpected error occurred" },
  };
}

// ─── Logger (Sentry-ready structure) ─────────────────────────

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[INFO] ${message}`, meta || "");
    }
    // Future: Sentry.captureMessage(message, { level: "info", extra: meta });
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta || "");
    // Future: Sentry.captureMessage(message, { level: "warning", extra: meta });
  },

  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error, meta || "");
    // Future: Sentry.captureException(error, { extra: { message, ...meta } });
  },
};
