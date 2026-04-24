import { supabase } from "@/lib/supabase";

export const attendanceService = {
  async saveAttendance(classId: string, date: string, records: any[], subjectId?: string) {
    // 1. Save core records
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records.map(r => ({
          class_id: classId,
          date,
          student_id: r.studentId,
          status: r.status,
          period: r.period || 1,
          subject_id: subjectId
      })), { onConflict: 'student_id,date,period' });
    
    if (error) throw error;

    // 2. Automate Outbox Enqueuing for Absentees
    const absentees = records.filter(r => r.status === 'absent');
    if (absentees.length > 0) {
        const { data: studentInfo } = await supabase
          .from('students')
          .select('id, name, roll_number')
          .in('id', absentees.map(a => a.studentId));

        let subjectName = "Class Section";
        if (subjectId) {
            const { data: subj } = await supabase.from('subjects').select('name').eq('id', subjectId).single();
            if (subj) subjectName = subj.name;
        }

        const messages = absentees.map(a => {
            const student = studentInfo?.find(s => s.id === a.studentId);
            return {
                template_slug: 'attendance_absent',
                payload: {
                    student_name: student?.name || 'Student',
                    subject: subjectName,
                    date,
                    attendance: 'N/A'
                },
                status: 'PENDING'
            };
        });

        await supabase.from('notification_queue').insert(messages);
    }
    
    return data;
  },

  async getAttendanceAnomalies() {
    const { data, error } = await supabase.rpc('get_active_anomalies');
    if (error) throw error;
    return data;
  },

  async getSummaryStats(timeframe: 'week' | 'month' = 'week') {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    const [
      { count: studentCount },
      { count: classCount },
      { data: todayAbsentees },
      { data: trends },
      { data: deptStats }
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('attendance').select('id').eq('date', today).eq('status', 'absent'),
      supabase.rpc('get_weekly_attendance_trends'),
      supabase.from('attendance').select('status, students(department)').eq('date', today)
    ]);
    
    const depts: any = {};
    (deptStats || []).forEach((log: any) => {
        const d = log.students?.department || 'General';
        if (!depts[d]) depts[d] = { present: 0, total: 0 };
        depts[d].total++;
        if (log.status !== 'absent') depts[d].present++;
    });

    const processedDeptStats = Object.keys(depts).map(name => ({
        name,
        percentage: Math.round((depts[name].present / depts[name].total) * 100)
    }));

    return {
        totalStudents: studentCount || 0,
        totalClasses: classCount || 0,
        absenteesToday: todayAbsentees?.length || 0,
        attendanceRate: studentCount ? Math.round(((studentCount - (todayAbsentees?.length || 0)) / studentCount) * 100) : 100,
        weeklyTrend: (trends || []).map((t: any) => ({
            name: t.day_name,
            present: Number(t.present_count),
            absent: Number(t.absent_count)
        })),
        departmentPulse: processedDeptStats.length > 0 ? processedDeptStats : [],
        recentActivity: (deptStats || []).slice(0, 5).map((log: any, i: number) => ({
            id: i,
            text: `${log.students?.department || 'Registry'} update synchronized`,
            time: 'Live',
            type: 'success'
        }))
    };

  }
};
