import { haptics } from "@/lib/haptics";
import { toast } from "sonner";

/**
 * Attendly — Relational Offline Persistence (ROPE)
 * 
 * Manages institutional data durability during campus-wide network 
 * fluctuations and cellular dead-zones.
 */

const STORAGE_KEY = "attendly_offline_queue";

export interface OfflineAttendance {
  id: string;
  classId: string;
  subjectId: string;
  lecture: string;
  date: string;
  absentIds: string[];
  onDutyIds: string[];
  timestamp: number;
}

export const offlineService = {
  // Save a session locally when the network is unstable
  saveDraft: async (data: Omit<OfflineAttendance, "id" | "timestamp">) => {
    try {
      const drafts = offlineService.getDrafts();
      const newDraft: OfflineAttendance = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...drafts, newDraft]));
      haptics.success();
      return true;
    } catch (err) {
      console.error("Draft Save Failed", err);
      haptics.error();
      return false;
    }
  },

  getDrafts: (): OfflineAttendance[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  removeDraft: (id: string) => {
    const drafts = offlineService.getDrafts().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Heuristic check if ofline queue has pending items
  hasPendingSync: () => {
    return offlineService.getDrafts().length > 0;
  }
};
