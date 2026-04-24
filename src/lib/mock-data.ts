/**
 * Attendex — Centralized Mock Data
 * 
 * Single source of truth for all demo data.
 * Previously duplicated across attendance/page.tsx, students/page.tsx,
 * and student/dashboard/page.tsx with different field names.
 * 
 * This file will be fully replaced by database queries in production.
 */

import type { Student, ClassInfo, AttendanceStatus } from "@/types";

// ─── Students ────────────────────────────────────────────────

export const MOCK_STUDENTS: (Student & { avatar: string; email: string })[] = [
  { id: "1", name: "Alena Smith", rollNumber: "CS-01", avatar: "AS", email: "alena@college.edu", attendancePercentage: 92, batch: "A", classId: "cs101", organizationId: "org1" },
  { id: "2", name: "Brandon Cooper", rollNumber: "CS-02", avatar: "BC", email: "brandon@college.edu", attendancePercentage: 68, batch: "A", classId: "cs101", organizationId: "org1" },
  { id: "3", name: "Cynthia Davis", rollNumber: "CS-03", avatar: "CD", email: "cynthia@college.edu", attendancePercentage: 85, batch: "B", classId: "cs101", organizationId: "org1" },
  { id: "4", name: "Derek Evans", rollNumber: "CS-04", avatar: "DE", email: "derek@college.edu", attendancePercentage: 72, batch: "B", classId: "cs101", organizationId: "org1" },
  { id: "5", name: "Elena Ford", rollNumber: "CS-05", avatar: "EF", email: "elena@college.edu", attendancePercentage: 95, batch: "A", classId: "cs101", organizationId: "org1" },
  { id: "6", name: "Fiona Garcia", rollNumber: "CS-06", avatar: "FG", email: "fiona@college.edu", attendancePercentage: 88, batch: "B", classId: "cs101", organizationId: "org1" },
  { id: "7", name: "George Harris", rollNumber: "CS-07", avatar: "GH", email: "george@college.edu", attendancePercentage: 61, batch: "A", classId: "cs101", organizationId: "org1" },
  { id: "8", name: "Hannah Iles", rollNumber: "CS-08", avatar: "HI", email: "hannah@college.edu", attendancePercentage: 99, batch: "B", classId: "cs101", organizationId: "org1" },
];

// ─── Classes ─────────────────────────────────────────────────

export const MOCK_CLASSES: ClassInfo[] = [
  { id: "cs101", name: "Computer Science 101", studentCount: 54, organizationId: "org1" },
  { id: "phy202", name: "Physics 202", studentCount: 48, organizationId: "org1" },
  { id: "eng303", name: "English Lit 303", studentCount: 32, organizationId: "org1" },
];

// ─── Dashboard Chart Data ────────────────────────────────────

export const WEEKLY_ATTENDANCE_DATA = [
  { name: "Mon", present: 45, absent: 5 },
  { name: "Tue", present: 48, absent: 2 },
  { name: "Wed", present: 42, absent: 8 },
  { name: "Thu", present: 47, absent: 3 },
  { name: "Fri", present: 49, absent: 1 },
];

export const MONTHLY_ATTENDANCE_DATA = [
  { name: "Week 1", present: 220, absent: 30 },
  { name: "Week 2", present: 240, absent: 10 },
  { name: "Week 3", present: 190, absent: 60 },
  { name: "Week 4", present: 245, absent: 5 },
];

// ─── SMS Queue ───────────────────────────────────────────────

export const MOCK_SMS_QUEUE = [
  { id: "1", roll: "CS-02", parent: "Mr. Cooper", status: "Sending" as const, progress: 65, time: "Just now" },
  { id: "2", roll: "CS-14", parent: "Dr. Sharma", status: "Queued" as const, progress: 0, time: "Queued" },
  { id: "3", roll: "CS-28", parent: "Mrs. Davis", status: "Delivered" as const, progress: 100, time: "2m ago" },
];

// ─── Recent Activity ─────────────────────────────────────────

export const MOCK_ACTIVITY = [
  { id: 1, text: "Computer Science 101 marked by Alex", time: "10 mins ago", type: "success" as const },
  { id: 2, text: "Physics 202 - 3 absent students notified", time: "1 hour ago", type: "alert" as const },
  { id: 3, text: "English Lit 303 marked by Sarah", time: "2 hours ago", type: "success" as const },
];

// ─── Student Portal Data ─────────────────────────────────────

export const MOCK_STUDENT_SELF = {
  name: "Alex Johnson",
  roll: "CS-2024-001",
  class: "B.Tech Computer Science - Year 2",
  marks: {
    attendancePercentage: 88,
    cia1: 2.5,
    cia2: 2.0,
    test1: 32,
    test2: 35,
    assignment: 9.5,
  },
};

// ─── Parent Portal Data ──────────────────────────────────────

export const MOCK_PARENT_DATA = {
  name: "Robert Johnson",
  student: {
    name: "Alex Johnson",
    class: "B.Tech Computer Science - Year 2",
    roll: "CS-2024-001",
    marks: {
      attendancePercentage: 72,
      cia1: 2.0,
      cia2: 1.5,
      test1: 28,
      test2: 30,
      assignment: 8.5,
    },
  },
};

// ─── Promotion Data ──────────────────────────────────────────

export const MOCK_PROMOTION_CLASSES = [
  { id: "1", name: "CS-Year 1", students: 54, year: 2023, isFinal: false },
  { id: "2", name: "CS-Year 2", students: 48, year: 2023, isFinal: false },
  { id: "3", name: "Physics-Final", students: 32, year: 2023, isFinal: true },
];

// ─── Attendance History (Charts) ─────────────────────────────

export const STUDENT_ATTENDANCE_HISTORY = [
  { name: "Mon", rate: 85 },
  { name: "Tue", rate: 88 },
  { name: "Wed", rate: 82 },
  { name: "Thu", rate: 90 },
  { name: "Fri", rate: 88 },
];

export const PARENT_ATTENDANCE_HISTORY = [
  { name: "Week 1", rate: 85 },
  { name: "Week 2", rate: 80 },
  { name: "Week 3", rate: 75 },
  { name: "Week 4", rate: 72 },
];


