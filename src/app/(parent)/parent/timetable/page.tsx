"use client";

import StudentTimetable from "@/app/(student)/student/timetable/page";

export default function ParentTimetablePage() {
  return (
    <StudentTimetable isParentView={true} />
  );
}
