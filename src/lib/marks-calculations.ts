/**
 * Attendex — Marks Calculations
 * 
 * Re-export from the centralized service layer.
 * This file exists for backward compatibility with existing imports.
 * New code should import directly from '@/services/marks.service'.
 */

export {
  calculateAttendanceMarks,
  calculateCIAMarks,
  calculateTestMarks,
  calculateFinalMarks,
  getStudentPerformance,
  getParentInsights,
} from "@/services/marks.service";

// Re-export types for backward compat
export type { StudentMarksInput } from "@/types";
