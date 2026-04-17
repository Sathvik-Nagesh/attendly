import { attendanceService } from "./attendance.service";
import { registryService } from "./registry.service";
import { communicationService } from "./communication.service";
import { supabase } from "@/lib/supabase";

export const academicService = {
  ...registryService,
  ...attendanceService,
  ...communicationService,

  // --- Auth-specific Administrative Methods (Keep here for now) ---
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

  async scheduleExam(examData: { class_id: string; subject: string; exam_date: string; room_number: string }) {
    const { data, error } = await supabase
      .from('exams')
      .upsert(examData, { onConflict: 'class_id,subject' });
    
    if (error) throw error;
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
  }
};

