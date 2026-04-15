import { supabase } from "@/lib/supabase";

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  year: number;
}

export interface SubjectAssignment {
  id: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  created_at: string;
  subjects?: Subject;
}

export const subjectService = {
  // 1. Semester Blueprinting (Admin/HOD)
  async getSubjects(filters?: { department?: string; year?: number; semester?: number }) {
    let query = supabase.from('subjects').select('*').order('name');
    
    if (filters?.department) query = query.eq('department', filters.department);
    if (filters?.year) query = query.eq('year', filters.year);
    if (filters?.semester) query = query.eq('semester', filters.semester);
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Subject[];
  },

  async createSubject(subject: Omit<Subject, 'id'>) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
      .single();
    if (error) throw error;
    return data as Subject;
  },

  // 2. The Lock-In Logic (Teacher Claiming)
  async claimSubject(subjectId: string, classId: string, teacherId: string) {
    const { data, error } = await supabase
      .from('subject_assignments')
      .insert([{
        subject_id: subjectId,
        class_id: classId,
        teacher_id: teacherId
      }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('This subject has already been claimed by another faculty member for this section.');
      }
      throw error;
    }
    return data as SubjectAssignment;
  },

  async getAssignmentsForClass(classId: string) {
    const { data, error } = await supabase
      .from('subject_assignments')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('class_id', classId);
    
    if (error) throw error;
    return data;
  },

  async getAssignmentsByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('subject_assignments')
      .select(`
        *,
        subject:subjects(*),
        class:classes(*)
      `)
      .eq('teacher_id', teacherId);
    
    if (error) throw error;
    return data;
  }
};
