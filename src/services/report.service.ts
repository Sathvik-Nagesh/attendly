/**
 * Attendly — Report Generation Service
 * 
 * Centralizes all report logic (Defaulter List, Monthly Sheet, etc.)
 * Previously this was inline setTimeout calls scattered across 3 pages.
 */

import type { ReportRequest } from "@/types";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

// ─── Report Output ───────────────────────────────────────────
export interface ReportOutput {
  filename: string;
  contentType: string;
  data: string; // In production, this would be a Buffer or stream
}

// ─── Mock Data (will be replaced by DB queries) ──────────────
const MOCK_STUDENTS = [
  { name: "Alena Smith", roll: "CS-01", attendance: 98, class: "CS 101" },
  { name: "Brandon Cooper", roll: "CS-02", attendance: 68, class: "CS 101" },
  { name: "Cynthia Davis", roll: "CS-03", attendance: 92, class: "CS 101" },
  { name: "Derek Evans", roll: "CS-04", attendance: 72, class: "CS 101" },
  { name: "Elena Ford", roll: "CS-05", attendance: 95, class: "CS 101" },
  { name: "George Harris", roll: "CS-07", attendance: 61, class: "CS 101" },
];

// ─── Report Service ──────────────────────────────────────────

/**
 * Generate a Defaulter List (students below attendance threshold).
 */
export function generateDefaulterList(): ReportOutput {
  const defaulters = MOCK_STUDENTS.filter(
    (s) => s.attendance < ATTENDANCE_THRESHOLD
  );

  const rows = defaulters.map(
    (s) => `${s.roll},${s.name},${s.attendance}%,${s.class}`
  );
  const csv = ["Roll,Name,Attendance,Class", ...rows].join("\n");

  const date = new Date().toISOString().split("T")[0];

  return {
    filename: `defaulter_list_${date}.csv`,
    contentType: "text/csv",
    data: csv,
  };
}

/**
 * Generate Monthly Attendance Sheet.
 */
export function generateMonthlySheet(): ReportOutput {
  const rows = MOCK_STUDENTS.map(
    (s) => `${s.roll},${s.name},${s.attendance}%,${s.class}`
  );
  const csv = [
    "Roll,Name,Attendance %,Class",
    ...rows,
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Total Students: ${MOCK_STUDENTS.length}`,
  ].join("\n");

  const date = new Date().toISOString().split("T")[0];

  return {
    filename: `monthly_attendance_${date}.csv`,
    contentType: "text/csv",
    data: csv,
  };
}

/**
 * Route report generation by type.
 */
export function generateReport(request: ReportRequest): ReportOutput {
  switch (request.type) {
    case "DEFAULTER_LIST":
      return generateDefaulterList();
    case "MONTHLY_SHEET":
      return generateMonthlySheet();
    case "DEPARTMENT_OVERVIEW":
      return generateMonthlySheet(); // Placeholder
    default:
      throw new Error(`Unknown report type: ${request.type}`);
  }
}
