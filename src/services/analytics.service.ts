import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export interface AttendanceProjection {
    currentPercentage: number;
    maxPossiblePercentage: number;
    status: 'CRITICAL' | 'WARNING' | 'SAFE' | 'EXCELLENT';
    targetRemaining: number; // Lectures needed from remaining to hit threshold
    safeBuffer: number; // Lectures they can miss while staying above threshold
    isEligible: boolean;
    remainingLectures: number;
}

/**
 * Predicts if a student can reach the attendance threshold.
 * 
 * @param presentCount - Current lectures attended
 * @param conductedCount - Lectures conducted so far
 * @param estimatedTotal - Total lectures planned for the semester (e.g., 50)
 */
export function projectAttendance(
    presentCount: number,
    conductedCount: number,
    estimatedTotal: number = 50
): AttendanceProjection {
    const currentPercentage = conductedCount > 0 ? (presentCount / conductedCount) * 100 : 100;
    const remainingLectures = Math.max(0, estimatedTotal - conductedCount);
    
    // If they attend all remaining lectures
    const maxPossiblePercentage = ((presentCount + remainingLectures) / estimatedTotal) * 100;
    
    const isEligible = maxPossiblePercentage >= ATTENDANCE_THRESHOLD;
    
    // Calculate how many more lectures they MUST attend to hit the threshold
    // (present + x) / estimatedTotal >= threshold/100
    // x >= (threshold/100 * estimatedTotal) - present
    const targetCount = Math.ceil((ATTENDANCE_THRESHOLD / 100) * estimatedTotal);
    const targetRemaining = Math.max(0, targetCount - presentCount);

    // Safe Buffer: How many can they miss?
    // (presentCount) / (conductedCount + X) >= 0.75
    // presentCount / 0.75 >= conductedCount + X
    // X <= (presentCount / 0.75) - conductedCount
    const safeBuffer = Math.max(0, Math.floor((presentCount / (ATTENDANCE_THRESHOLD / 100)) - conductedCount));

    let status: 'CRITICAL' | 'WARNING' | 'SAFE' | 'EXCELLENT' = 'SAFE';
    
    if (maxPossiblePercentage < ATTENDANCE_THRESHOLD) {
        status = 'CRITICAL';
    } else if (currentPercentage < ATTENDANCE_THRESHOLD) {
        status = 'WARNING';
    } else if (currentPercentage > 90) {
        status = 'EXCELLENT';
    }

    return {
        currentPercentage,
        maxPossiblePercentage,
        status,
        targetRemaining,
        safeBuffer,
        isEligible,
        remainingLectures
    };
}

/**
 * Identify students at risk across a class.
 */
export function getAtRiskStudents(students: any[], estimatedTotal: number = 50) {
    return students.map(student => ({
        ...student,
        projection: projectAttendance(student.present, student.conducted, estimatedTotal)
    })).filter(s => s.projection.status === 'CRITICAL' || s.projection.status === 'WARNING');
}
