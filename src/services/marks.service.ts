/**
 * Attendex — Marks Calculation Service (Refactored)
 * 
 * Changes from original:
 * - Uses constants instead of magic numbers
 * - Proper TypeScript types (no `any`)
 * - Pure functions, easily testable
 * - totalClasses is now a parameter, not hardcoded to 45
 */

import {
  ATTENDANCE_BANDS,
  MAX_CIA_MARKS,
  MAX_FINAL_MARKS,
  TEST_RAW_MAX,
  MAX_TEST_MARKS,
  ATTENDANCE_THRESHOLD,
} from "@/lib/constants";

import type {
  StudentMarksInput,
  PerformanceResult,
  ParentInsight,
  InsightLevel,
} from "@/types";

/**
 * Convert attendance percentage to marks (out of 5).
 * Uses configurable bands from constants.ts.
 */
export function calculateAttendanceMarks(percentage: number): number {
  for (const band of ATTENDANCE_BANDS) {
    if (percentage >= band.min) return band.marks;
  }
  return ATTENDANCE_BANDS[ATTENDANCE_BANDS.length - 1].marks;
}

/**
 * Sum CIA assessments, capped at MAX_CIA_MARKS.
 */
export function calculateCIAMarks(cia1: number, cia2: number): number {
  return Math.min(cia1 + cia2, MAX_CIA_MARKS);
}

/**
 * Weighted test score: ((test1 + test2) / (2 × rawMax)) × maxMarks
 */
export function calculateTestMarks(test1: number, test2: number): number {
  const score = ((test1 + test2) / (TEST_RAW_MAX * 2)) * MAX_TEST_MARKS;
  return Math.round(score * 10) / 10; // 1 decimal precision
}

/**
 * Final internal marks = attendance + CIA + tests, capped at 20.
 */
export function calculateFinalMarks(
  attendanceMarks: number,
  ciaTotal: number,
  testScore: number
): number {
  return Math.min(attendanceMarks + ciaTotal + testScore, MAX_FINAL_MARKS);
}

/**
 * Full performance breakdown for a student.
 * @param marks - Student's raw marks input
 * @param totalClasses - Actual total classes conducted (no more hardcoded 45)
 */
export function getStudentPerformance(
  marks: StudentMarksInput,
  totalClasses: number = 45
): PerformanceResult {
  const attendanceMarks = calculateAttendanceMarks(marks.attendancePercentage);
  const ciaTotal = calculateCIAMarks(marks.cia1, marks.cia2);
  const testScore = calculateTestMarks(marks.test1, marks.test2);
  const finalMarks = calculateFinalMarks(attendanceMarks, ciaTotal, testScore);

  return {
    attendanceMarks,
    ciaTotal,
    testScore,
    finalMarks,
    totalClasses,
    presentCount: Math.round((marks.attendancePercentage / 100) * totalClasses),
  };
}

/**
 * Generate parent-friendly insights from academic data.
 * Returns semantic status, human-readable insight, and optional alert.
 */
export function getParentInsights(
  percentage: number,
  finalMarks: number
): ParentInsight {
  let status: InsightLevel = "good";
  let insight = "Good performance maintained";
  let alert: string | null = null;

  if (percentage < ATTENDANCE_THRESHOLD) {
    status = "risk";
    insight = "Critical attendance shortage detected.";
    alert =
      "Your child may face attendance shortage and might not be eligible for final exams.";
  } else if (finalMarks < MAX_FINAL_MARKS / 2) {
    status = "warning";
    insight = "Performance needs improvement.";
    alert =
      "Current internal marks are below expectations. Faculty intervention suggested.";
  } else if (percentage < 80) {
    status = "warning";
    insight = "Attendance needs attention.";
    alert =
      "Attendance is dropping. Regular presence is required to maintain internal marks.";
  }

  return { status, insight, alert };
}
