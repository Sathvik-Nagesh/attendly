import { supabase } from "@/lib/supabase";

export const registryService = {
  // --- Classes ---
  async getClasses() {
    const { data, error } = await supabase
      .from('classes_with_counts')
      .select('*, class_claims(*, subjects(*))')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async claimClass(classId: string, subjectId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('class_claims')
      .insert({
        teacher_id: user.id,
        class_id: classId,
        subject_id: subjectId
      });
    
    if (error) {
        if (error.code === '23505') throw new Error("Subject already claimed for this class");
        throw error;
    }
    return data;
  },

  async createClass(cls: { name: string; section?: string; year: number; semester?: number; department: string; teacher_id?: string }) {
    const { data, error } = await supabase
      .from('classes')
      .insert([cls])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSubjects(filter?: { department?: string; semester?: number }) {
    let query = supabase.from('subjects').select('*');
    if (filter?.department) query = query.eq('department', filter.department);
    if (filter?.semester) query = query.eq('semester', filter.semester);
    
    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  // --- Students ---
  async getAllStudents(page = 0, pageSize = 50) {
    const from = page * pageSize;
    const to   = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('students')
      .select('*, classes(name)', { count: 'exact' })
      .order('name', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  /** Convenience: fetch all without pagination (use only for exports, not UI lists) */
  async getAllStudentsUnpaginated() {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(name)')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getStudentsByClass(classId: string, subjectId?: string) {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('roll_number', { ascending: true });
    
    if (error) throw error;

    // Fetch consolidated totals for these students
    let query = supabase
      .from('consolidated_attendance')
      .select('student_id, total_tc, total_tp, subject_code')
      .in('student_id', (students || []).map(s => s.id));

    // If subjectId is provided, we need to find the code for it
    let filterCode: string | null = null;
    if (subjectId) {
        const { data: subj } = await supabase.from('subjects').select('code').eq('id', subjectId).single();
        if (subj) filterCode = subj.code;
    }

    const { data: consolidated } = await query;

    // Aggregate totals per student
    const studentStats: Record<string, { total: number, present: number }> = {};
    consolidated?.forEach(c => {
        // If filtering by subject, only include matching code
        if (filterCode && c.subject_code !== filterCode) return;
        
        if (!studentStats[c.student_id]) studentStats[c.student_id] = { total: 0, present: 0 };
        studentStats[c.student_id].total += Number(c.total_tc);
        studentStats[c.student_id].present += Number(c.total_tp);
    });

    return (students || []).map(s => {
        const stats = studentStats[s.id] || { total: 0, present: 0 };
        return {
            ...s,
            attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100
        };
    });
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

  async deleteStudentsByClass(classId: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('class_id', classId);
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

  async importInitialAttendance(records: any[]) {
    const { data, error } = await supabase
      .from('student_initial_attendance')
      .upsert(records, { 
        onConflict: 'student_id,subject_code' 
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  async getInitialAttendance(studentId: string) {
    const { data, error } = await supabase
      .from('student_initial_attendance')
      .select('*')
      .eq('student_id', studentId);
    
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
    return supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
  },

  async getStudentByRoll(roll: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(*)')
      .eq('roll_number', roll)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getStudentByEmail(email: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(*)')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getStudentByParentEmail(email: string) {
    let query = supabase.from('students').select('*, classes(*)');

    // Handle synthetic parent emails created via signup (e.g., p_cs-01@attendly.local)
    if (email.startsWith('p_') && email.endsWith('@attendly.local')) {
      const rollNumber = email.slice(2, email.indexOf('@'));
      query = query.ilike('roll_number', rollNumber);
    } else {
      // Fallback for real parent emails
      query = query.eq('parent_email', email);
    }

    const { data, error } = await query.maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getStudentSummary(studentId: string) {
    const [
      { data: marks },
      { data: attendance },
      { data: student },
      { data: initialRecords }
    ] = await Promise.all([
      this.getStudentMarks(studentId),
      supabase.from('attendance').select('status, subject_id, subjects(code, name)').eq('student_id', studentId),
      supabase.from('students').select('department, initial_total_classes, initial_total_present').eq('id', studentId).single(),
      supabase.from('student_initial_attendance').select('*').eq('student_id', studentId)
    ]);

    // Calculate Global Attendance %
    const sessionTotal = attendance?.length || 0;
    const sessionPresent = attendance?.filter(a => a.status === 'present' || a.status === 'od').length || 0;
    
    let initialTotal = 0;
    let initialPresent = 0;
    initialRecords?.forEach(rec => {
        initialTotal += (rec.tc || 0);
        initialPresent += (rec.tp || 0);
    });

    const globalTotal = sessionTotal + initialTotal;
    const globalPresent = sessionPresent + initialPresent;
    const attendancePct = globalTotal > 0 ? Math.round((globalPresent / globalTotal) * 100) : 100;

    // Calculate Subject-wise Attendance
    const subjectWise: Record<string, { name: string, total: number, present: number, pct: number }> = {};

    // 1. Process Initial Records
    initialRecords?.forEach(rec => {
        const total = rec.tc || 0;
        const present = rec.tp || 0;
        subjectWise[rec.subject_code] = {
            name: rec.subject_code, // Default to code, will refine if matched
            total: total,
            present: present,
            pct: total > 0 ? Math.round((present / total) * 100) : 100
        };
    });

    // 2. Add Session Records
    attendance?.forEach((a: any) => {
        const subjectData = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
        const code = subjectData?.code || 'GEN';
        if (!subjectWise[code]) {
            subjectWise[code] = { name: subjectData?.name || code, total: 0, present: 0, pct: 0 };
        }
        subjectWise[code].total += 1;
        if (a.status === 'present' || a.status === 'od') {
            subjectWise[code].present += 1;
        }
    });

    // 3. Re-calculate percentages
    Object.keys(subjectWise).forEach(code => {
        const sw = subjectWise[code];
        sw.pct = sw.total > 0 ? Math.round((sw.present / sw.total) * 100) : 100;
    });

    return {
      cgpa: "0.0", // Mock for now
      attendancePct,
      credits: "22 / 24", 
      rank: "#" + (Math.floor(Math.random() * 20) + 1),
      department: student?.department || "General",
      totalClasses: globalTotal,
      totalPresent: globalPresent,
      subjectWise: Object.values(subjectWise)
    };
  },

  async getTimetableByClass(classId: string) {
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('class_id', classId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

