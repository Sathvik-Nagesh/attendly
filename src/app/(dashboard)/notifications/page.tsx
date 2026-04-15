"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Clock, GraduationCap, FileText, AlertTriangle, Bell, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Semester II Results Published",
    description: "Final grades for B.Tech CS (Batch 2024) are now available in the portal.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "result",
    type: "academic"
  },
  {
    id: 2,
    title: "End Semester Exam Schedule Released",
    description: "Exams starting from May 15, 2026. Hall tickets available for download.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "exam",
    type: "schedule"
  },
  {
    id: 3,
    title: "Attendance saved for Physics 202",
    description: "3 SMS notifications sent to absent students.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "success",
    type: "system"
  },
  {
    id: 4,
    title: "Practical Viva Notification",
    description: "CS-Lab 2 scheduled for Tuesday, 10:00 AM. Please bring journals.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30),
    status: "exam",
    type: "schedule"
  }
];

export default function NotificationsPage() {
  const [notifications] = useState(INITIAL_NOTIFICATIONS);
  const router = useRouter();

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Academic Notifications & Logs" />
        
        <div className="flex-1 py-10 max-w-4xl px-4 md:px-0">
          <div className="grid grid-cols-1 gap-6">
              {notifications.map((notif) => (
                <Card key={notif.id} className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all group overflow-hidden relative">
                   <div className={cn(
                       "absolute left-0 top-0 bottom-0 w-1.5",
                       notif.status === 'result' ? "bg-emerald-500" :
                       notif.status === 'exam' ? "bg-blue-600" :
                       notif.status === 'error' ? "bg-rose-500" : "bg-slate-200"
                   )} />
                   
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex gap-5 items-start">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                                notif.status === 'result' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                notif.status === 'exam' ? "bg-blue-50 border-blue-100 text-blue-600" :
                                "bg-slate-50 border-slate-100 text-slate-400"
                            )}>
                                {notif.status === 'result' ? <GraduationCap className="w-6 h-6" /> :
                                 notif.status === 'exam' ? <FileText className="w-6 h-6" /> :
                                 <Clock className="w-6 h-6" />}
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-base font-bold text-slate-900 leading-tight">{notif.title}</h4>
                                    <span className={cn(
                                        "px-2 py-0.5 text-[9px] font-bold uppercase rounded-md tracking-widest",
                                        notif.status === 'result' ? "bg-emerald-50 text-emerald-600" :
                                        notif.status === 'exam' ? "bg-blue-50 text-blue-600" :
                                        "bg-slate-50 text-slate-400"
                                    )}>
                                        {notif.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">{notif.description}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[160px]">
                            {notif.status === 'result' && (
                                <Button 
                                    onClick={() => router.push('/student/marks')}
                                    className="h-10 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md shadow-slate-200"
                                >
                                    Review Final Marks
                                </Button>
                            )}
                            {notif.status === 'exam' && (
                                <Button 
                                    onClick={() => router.push('/timetable')}
                                    className="h-10 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-200"
                                >
                                    Update Class Schedule
                                </Button>
                            )}
                        </div>
                   </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
