"use client";

import StudentTimetable from "@/app/(student)/student/timetable/page";

export default function TeacherTimetablePage() {
  return (
    <StudentTimetable isTeacherView={true} />
  );
}
