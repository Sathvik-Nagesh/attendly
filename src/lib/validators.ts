/**
 * Attendly — Input Validation Schemas (Zod-like, zero-dependency)
 * Lightweight validation that works on both client and server.
 * Can be swapped for Zod when the dependency is acceptable.
 */

import { sanitize } from "./security";

// ─── Validation Result ───────────────────────────────────────
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

// ─── Student Validators ──────────────────────────────────────
export interface StudentInput {
  name: string;
  rollNumber: string;
  email?: string;
  phone?: string;
  batch?: string;
  classId: string;
}

export function validateStudentInput(input: unknown): ValidationResult<StudentInput> {
  const errors: Record<string, string> = {};
  const data = input as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return { success: false, errors: { _: "Invalid input" } };
  }

  // Name
  const name = sanitize(data.name as string);
  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  // Roll Number
  const rollNumber = sanitize(data.rollNumber as string);
  if (!rollNumber || rollNumber.trim().length < 2) {
    errors.rollNumber = "Roll number is required";
  }

  // Email (optional but must be valid if provided)
  const email = data.email ? sanitize(data.email as string) : undefined;
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Invalid email address";
    }
  }

  // Phone (optional, must be 10+ digits)
  const phone = data.phone ? sanitize(data.phone as string) : undefined;
  if (phone) {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      errors.phone = "Phone must be at least 10 digits";
    }
  }

  // Class ID
  const classId = sanitize(data.classId as string);
  if (!classId) {
    errors.classId = "Class selection is required";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      batch: data.batch ? sanitize(data.batch as string).trim() : undefined,
      classId: classId.trim(),
    },
  };
}

// ─── Attendance Validators ───────────────────────────────────
export interface AttendanceInput {
  classId: string;
  date: string;
  lectureNumber: number;
  entries: Array<{ studentId: string; status: string }>;
}

export function validateAttendanceInput(input: unknown): ValidationResult<AttendanceInput> {
  const errors: Record<string, string> = {};
  const data = input as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return { success: false, errors: { _: "Invalid input" } };
  }

  if (!data.classId || typeof data.classId !== "string") {
    errors.classId = "Class selection is required";
  }

  if (!data.date || typeof data.date !== "string") {
    errors.date = "Date is required";
  } else {
    const parsed = new Date(data.date as string);
    if (isNaN(parsed.getTime())) {
      errors.date = "Invalid date format";
    }
    if (parsed > new Date()) {
      errors.date = "Cannot mark attendance for a future date";
    }
  }

  if (!data.lectureNumber || typeof data.lectureNumber !== "number" || data.lectureNumber < 1 || data.lectureNumber > 8) {
    errors.lectureNumber = "Lecture number must be between 1 and 8";
  }

  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    errors.entries = "At least one student entry is required";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: data as unknown as AttendanceInput, // Entries should be handled carefully if they contain strings
  };
}

// ─── Login Validator ─────────────────────────────────────────
export interface LoginInput {
  identifier: string; // email or phone
  password: string;
}

export function validateLoginInput(input: unknown): ValidationResult<LoginInput> {
  const errors: Record<string, string> = {};
  const data = input as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return { success: false, errors: { _: "Invalid input" } };
  }

  const identifier = sanitize(data.identifier as string);
  if (!identifier || identifier.trim().length < 3) {
    errors.identifier = "Email or phone number is required";
  }

  if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      identifier: identifier.trim(),
      password: data.password as string, // Password not sanitized as it's hashed
    },
  };
}

// ─── CSV Row Validator ───────────────────────────────────────
export interface CsvStudentRow {
  name: string;
  roll: string;
  email?: string;
  class: string;
  attendance?: string;
}

export function validateCsvRow(row: Record<string, string>, index: number): ValidationResult<CsvStudentRow> {
  const errors: Record<string, string> = {};

  const name = sanitize(row.name);
  const roll = sanitize(row.roll);
  const className = sanitize(row.class);

  if (!name?.trim()) errors.name = `Row ${index}: Missing name`;
  if (!roll?.trim()) errors.roll = `Row ${index}: Missing roll number`;
  if (!className?.trim()) errors.class = `Row ${index}: Missing class`;

  const email = row.email ? sanitize(row.email) : undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = `Row ${index}: Invalid email`;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: name.trim(),
      roll: roll.trim().toUpperCase(),
      email: email?.trim().toLowerCase(),
      class: className.trim(),
      attendance: sanitize(row.attendance).trim(),
    },
  };
}

