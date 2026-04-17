import { haptics } from "@/lib/haptics";
import { toast } from "sonner";
import { get, set, del, keys } from "idb-keyval";

/**
 * Attendly — Relational Offline Persistence (ROPE)
 * 
 * High-performance IndexedDB-based durability layer for institutional
 * data during campus-wide network fluctuations.
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
      const drafts = await offlineService.getDrafts();
      const newDraft: OfflineAttendance = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      
      await set(STORAGE_KEY, [...drafts, newDraft]);
      
      // Trigger Background Sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          // @ts-ignore
          await registration.sync.register('sync-attendance');
        } catch {
          // Fallback to manual sync trigger
          window.dispatchEvent(new CustomEvent('rope-sync-force'));
        }
      }

      haptics.success();
      return true;
    } catch (err) {
      console.error("ROPE Save Failed", err);
      haptics.error();
      return false;
    }
  },

  getDrafts: async (): Promise<OfflineAttendance[]> => {
    if (typeof window === 'undefined') return [];
    try {
      const drafts = await get(STORAGE_KEY);
      return drafts || [];
    } catch {
      return [];
    }
  },

  removeDraft: async (id: string) => {
    const drafts = await offlineService.getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    await set(STORAGE_KEY, filtered);
  },

  clearAll: async () => {
    await del(STORAGE_KEY);
  },

  // Heuristic check if offline queue has pending items
  hasPendingSync: async () => {
    const drafts = await offlineService.getDrafts();
    return drafts.length > 0;
  }
};

