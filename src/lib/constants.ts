/**
 * Attendly — Application Constants
 * No more magic numbers scattered across components.
 */

// ─── Academic Rules ──────────────────────────────────────────
export const ATTENDANCE_THRESHOLD = 75; // minimum % for exam eligibility
export const MAX_ATTENDANCE_MARKS = 5;
export const MAX_CIA_MARKS = 5;
export const MAX_TEST_MARKS = 10;
export const MAX_FINAL_MARKS = 20;
export const TEST_RAW_MAX = 40; // each test is out of 40

// ─── Attendance Grading Bands ────────────────────────────────
export const ATTENDANCE_BANDS = [
  { min: 90, marks: 5 },
  { min: 80, marks: 4 },
  { min: 75, marks: 3 },
  { min: 0,  marks: 2 },
] as const;

// ─── Roles ───────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

// ─── Protected Routes ────────────────────────────────────────
export const PUBLIC_ROUTES = ["/", "/login"] as const;

export const ROLE_ROUTE_MAP: Record<string, string[]> = {
  ADMIN:   ["/dashboard", "/pulse", "/attendance", "/students", "/classes", "/promotion", "/audit", "/notifications", "/settings"],
  TEACHER: ["/dashboard", "/attendance", "/students", "/classes", "/notifications"],
  STUDENT: ["/student"],
  PARENT:  ["/parent"],
};

// ─── Notification Providers ──────────────────────────────────
export const SMS_PROVIDER = "MSG91";
export const DEFAULT_SENDER_ID = "ATNDLY";

// ─── Pagination ──────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

// ─── App ─────────────────────────────────────────────────────
export const APP_NAME = "Attendly";
export const APP_VERSION = "0.1.0";
