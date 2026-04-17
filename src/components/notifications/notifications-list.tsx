"use client";

import { useQuery } from "@tanstack/react-query";
import { academicService } from "@/services/academic";
import { formatDistanceToNow } from "date-fns";
import { Bell, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationsList({ recipientId }: { recipientId?: string }) {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', recipientId],
    queryFn: () => academicService.getNotifications(recipientId),
  });

  if (isLoading) {
    return Array(3).fill(0).map((_, i) => (
      <div key={i} className="h-20 rounded-3xl bg-slate-50 animate-pulse" />
    ));
  }

  if (notifications.length === 0) {
    return (
      <div className="p-10 text-center space-y-2">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Recent Correspondence</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif: any) => (
        <div 
          key={notif.id} 
          className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
              notif.type === 'Warning' ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
            )}>
              {notif.type === 'Warning' ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{notif.title}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
              notif.type === 'Warning' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
            )}>
              {notif.type}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      ))}
    </div>
  );
}
