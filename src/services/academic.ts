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
  },

  async saveSportsPoints(entries: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // We'll create a default event for "Institutional Sports 2024" if not exists
    // But for simplicity in this pilot, we'll just insert into points_entries
    // matching the UI structure. 
    
    const formatted = entries.map(e => ({
      class_id: e.class_id,
      points_awarded: e.points,
      position: e.position,
      created_by_id: user.id,
      // Store the category/sport name in a metadata field if column exists, 
      // or just assume we'll use a text column if we add it.
      // For now, let's use a simple approach.
    }));

    const { data, error } = await supabase
      .from('points_entries')
      .insert(formatted);
    
    if (error) throw error;
    return data;
  }
};

