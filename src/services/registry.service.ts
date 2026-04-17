import { supabase } from "@/lib/supabase";

export const registryService = {
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
      .eq('student_id', studentId)
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
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(*)')
      .eq('parent_email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getStudentSummary(studentId: string) {
    const [
      { data: marks },
      { data: attendance },
      { data: student }
    ] = await Promise.all([
      this.getStudentMarks(studentId),
      supabase.from('attendance').select('status').eq('student_id', studentId),
      supabase.from('students').select('department').eq('id', studentId).single()
    ]);

    // Calculate CGPA (Mock logic based on real marks)
    const markValues = marks ? [marks.math, marks.science, marks.english, marks.physics, marks.computer_science, marks.history].filter(v => v !== null) : [];
    const avg = markValues.length > 0 ? markValues.reduce((a, b) => a + b, 0) / markValues.length : 0;
    const cgpa = (avg / 20) * 10; // Assuming marks are out of 20

    // Calculate Attendance %
    const total = attendance?.length || 0;
    const present = attendance?.filter(a => a.status === 'present' || a.status === 'od').length || 0;
    const attendancePct = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      cgpa: cgpa.toFixed(1),
      attendancePct,
      credits: "22 / 24", // Still mock for now as we don't have a credits table
      rank: "#" + (Math.floor(Math.random() * 20) + 1), // Semi-mock rank
      department: student?.department || "General"
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

