import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic";
import { toast } from "sonner";

export function useStudents(classId?: string, subjectId?: string) {
  return useQuery<any[]>({
    queryKey: ['students', classId, subjectId],
    queryFn: async () => {
      const result = classId 
        ? await academicService.getStudentsByClass(classId, subjectId) 
        : await academicService.getAllStudents();
      return Array.isArray(result) ? result : (result?.data || []);
    },
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => academicService.getClasses(),
  });
}

export function useDashboardStats(timeframe: 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['dashboard-stats', timeframe],
    queryFn: () => academicService.getSummaryStats(timeframe),
    refetchInterval: 30000, // Refresh every 30 seconds for trial pulse
  });
}

export function useAttendanceMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ classId, date, records, subjectId }: any) => 
      academicService.saveAttendance(classId, date, records, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success("Registry Synchronized", {
          description: "Institutional attendance records have been secured."
      });
    },
    onError: (error: any) => {
      toast.error("Synchronization Failure", {
          description: error.message || "Institutional network error. Data buffered locally."
      });
    }
  });
}

export function useNotifications(recipientId?: string) {
    return useQuery({
        queryKey: ['notifications', recipientId],
        queryFn: () => academicService.getNotifications(recipientId),
        refetchInterval: 60000, // Refresh every minute
    });
}
