import { supabase } from "@/lib/supabase";

export const academicService = {
  // --- Classes ---
  async getClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createClass(cls: { name: string; section?: string; year: number; department: string; teacher_id?: string }) {
    const { data, error } = await supabase
      .from('classes')
      .insert([cls])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Students ---
  async getAllStudents() {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(name)')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getStudentsByClass(classId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('roll_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async addStudent(student: any) {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStudent(id: string, updates: any) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteStudent(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async importStudents(students: any[]) {
    const { data, error } = await supabase
      .from('students')
      .upsert(students, { 
        onConflict: 'class_id,roll_number' 
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  // --- Marks ---
  async updateStudentMarks(studentId: string, marks: any) {
    const { data, error } = await supabase
      .from('marks')
      .upsert({ 
        student_id: studentId, 
        ...marks, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getStudentMarks(studentId: string) {
    const { data, error } = await supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data;
  },

  async getSummaryStats() {
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
    
    // Process Departmental Pulse
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
        weeklyTrend: (trends || []).map((t: any) => ({
            name: t.day_name,
            present: Number(t.present_count),
            absent: Number(t.absent_count)
        })),
        departmentPulse: processedDeptStats.length > 0 ? processedDeptStats : [{ name: 'Campus Wide', percentage: 92 }],
        recentActivity: (deptStats || []).slice(0, 5).map((log: any, i: number) => ({
            id: i,
            text: `${log.students?.department || 'Class'} records synchronized`,
            time: 'Just now',
            type: 'success'
        }))
    };
  },

  async enqueueNotification(slug: string, payload: any, recipientId?: string) {
    const { data, error } = await supabase
      .from('notification_queue')
      .insert({
        template_slug: slug,
        payload,
        recipient_id: recipientId,
        status: 'PENDING'
      });
    if (error) throw error;
    return data;
  },

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
          // Fetch student names
          const { data: studentInfo } = await supabase
            .from('students')
            .select('id, name, roll_number')
            .in('id', absentees.map(a => a.studentId));

          // Fetch subject name if linked
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

  async scheduleExam(examData: { class_id: string; subject: string; exam_date: string; room_number: string }) {
    const { data, error } = await supabase
      .from('exams')
      .upsert(examData, { onConflict: 'class_id,subject' });
    
    if (error) throw error;

    // Optional: Enqueue alerts for all students in the class
    return data;
  },

  async getUpcomingExam(classId: string) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('class_id', classId)
      .gte('exam_date', new Date().toISOString().split('T')[0])
      .order('exam_date', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async broadcastNotification(notification: { title: string; message: string; type: string; recipient_id?: string }) {
    // Save to historical notifications table
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification);
    
    if (error) throw error;

    // Also drop into the transactional queue
    await this.enqueueNotification('security_alert', { 
        title: notification.title, 
        message: notification.message 
    }, notification.recipient_id);

    return data;
  },

  async getNotifications(recipientId?: string) {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (recipientId) {
      query = query.or(`recipient_id.eq.${recipientId},recipient_id.is.null`);
    }
    const { data, error } = await query.limit(10);
    if (error) throw error;
    return data;
  },

  async getPendingFaculty() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'TEACHER')
      .eq('status', 'PENDING');
    if (error) throw error;
    return data;
  },

  async approveFaculty(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'APPROVED' })
      .eq('id', userId);
    if (error) throw error;
    return data;
  },

  async getAttendanceAnomalies() {
    const { data, error } = await supabase.rpc('get_active_anomalies');
    if (error) throw error;
    return data;
  }
};
