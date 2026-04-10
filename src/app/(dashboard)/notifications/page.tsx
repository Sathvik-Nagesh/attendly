"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const notifications = [
  {
    id: 1,
    title: "Attendance saved for Computer Science 101",
    description: "3 SMS notifications sent to parents of absent students.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "success"
  },
  {
    id: 2,
    title: "Failed to send SMS to Parent of CS-08",
    description: "Invalid phone number format provided in student profile.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "error"
  },
  {
    id: 3,
    title: "Attendance saved for Physics 202",
    description: "100% attendance recorded! No SMS needed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "success"
  }
];

export default function NotificationsPage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Notification Logs" />
        
        <div className="flex-1 py-8 max-w-3xl">
          <Card className="p-8 border-slate-200 shadow-sm rounded-2xl bg-white text-slate-900 border border-slate-200">
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-10 py-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="relative pl-8">
                  <div className="absolute -left-[11px] top-0.5 bg-white p-1 rounded-full">
                    {notif.status === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 bg-white" />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-semibold text-slate-900">{notif.title}</h4>
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {format(notif.timestamp, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{notif.description}</p>
                    
                    <div className="flex items-center gap-3 mt-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 border border-slate-200/60 text-slate-500">
                        SYS_LOG_ID: {notif.id.toString().padStart(6, '0')}
                      </div>

                      {notif.status === "error" && (
                        <Button variant="outline" size="sm" className="h-7 px-3 rounded-lg border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-none text-xs font-semibold">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                          Send WhatsApp Fallback
                          <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {notifications.length === 0 && (
               <div className="py-12 text-center text-slate-500">
                 <p className="text-sm font-medium">No recent notifications</p>
               </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
