/**
 * Business Logic for Attendly Internal Marks Calculation
 */

export const calculateAttendanceMarks = (percentage: number): number => {
  if (percentage >= 90) return 5;
  if (percentage >= 80) return 4;
  if (percentage >= 75) return 3;
  return 2;
};

export const calculateCIAMarks = (cia1: number, cia2: number): number => {
  const total = cia1 + cia2;
  return Math.min(total, 5); // Max 5
};

export const calculateTestMarks = (test1: number, test2: number): number => {
  // Formula: ((test1 + test2) / 80) * 10
  const score = ((test1 + test2) / 80) * 10;
  return Math.round(score);
};

export const calculateFinalMarks = (
  attendanceMarks: number,
  ciaTotal: number,
  testScore: number
): number => {
  const total = attendanceMarks + ciaTotal + testScore;
  return Math.min(total, 20); // Max 20
};

export interface StudentMarks {
    attendancePercentage: number;
    cia1: number;
    cia2: number;
    test1: number;
    test2: number;
    assignment: number;
}

export const getStudentPerformance = (marks: StudentMarks) => {
    const attendanceMarks = calculateAttendanceMarks(marks.attendancePercentage);
    const ciaTotal = calculateCIAMarks(marks.cia1, marks.cia2);
    const testScore = calculateTestMarks(marks.test1, marks.test2);
    const finalMarks = calculateFinalMarks(attendanceMarks, ciaTotal, testScore);

    return {
        attendanceMarks,
        ciaTotal,
        testScore,
        finalMarks,
        totalClasses: 45, // Example
        presentCount: Math.round((marks.attendancePercentage / 100) * 45)
    };
};

export const getParentInsights = (percentage: number, finalMarks: number) => {
    let status: 'good' | 'warning' | 'risk' = 'good';
    let insight = "Good performance maintained";
    let alert = null;

    if (percentage < 75) {
        status = 'risk';
        insight = "Critical attendance shortage detected.";
        alert = "Your child may face attendance shortage and might not be eligible for final exams.";
    } else if (finalMarks < 10) {
        status = 'warning';
        insight = "Performance needs improvement.";
        alert = "Current internal marks are below expectations. Faculty intervention suggested.";
    } else if (percentage < 80) {
        status = 'warning';
        insight = "Attendance needs attention.";
        alert = "Attendance is dropping. Regular presence is required to maintain internal marks.";
    }

    return { status, insight, alert };
};
