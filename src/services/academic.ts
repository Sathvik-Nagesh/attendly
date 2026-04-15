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

  async createClass(cls: { name: string; year: number; department: string }) {
    const { data, error } = await supabase
      .from('classes')
      .insert([cls])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Students ---
  async getStudentsByClass(classId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('roll_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async importStudents(students: any[]) {
    const { data, error } = await supabase
      .from('students')
      .insert(students)
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
    const { count: studentCount, error: sErr } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: classCount, error: cErr } = await supabase.from('classes').select('*', { count: 'exact', head: true });
    
    if (sErr || cErr) throw sErr || cErr;
    return {
        totalStudents: studentCount || 0,
        totalClasses: classCount || 0,
    };
  },

  async saveAttendance(classId: string, date: string, records: any[]) {
      const { data, error } = await supabase
        .from('attendance')
        .insert(records.map(r => ({
            class_id: classId,
            date,
            student_id: r.studentId,
            status: r.status,
            period: r.period || 1
        })));
      
      if (error) throw error;
      return data;
  }
};
