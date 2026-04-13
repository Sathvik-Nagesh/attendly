"use client";

import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  Bell, 
  MessageSquare, 
  AlertCircle, 
  Calendar, 
  DollarSign,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const notifications = [
  { 
    id: 1, 
    type: "Alert", 
    title: "Attendance Warning", 
    desc: "Alex's attendance in Microprocessors has dropped below 75%. Please check the logs.", 
    time: "2h ago", 
    icon: AlertCircle, 
    color: "bg-rose-500",
    isNew: true 
  },
  { 
    id: 2, 
    type: "Fee", 
    title: "Term Fee Reminder", 
    desc: "The last date for semester IV exam fee payment is April 25th, 2024.", 
    time: "1d ago", 
    icon: DollarSign, 
    color: "bg-amber-500",
    isNew: false 
  },
  { 
    id: 3, 
    type: "Event", 
    title: "Parent-Teacher Meeting", 
    desc: "Annual PTM scheduled for Saturday, 10:00 AM at the Main Campus Auditorium.", 
    time: "3d ago", 
    icon: Calendar, 
    color: "bg-indigo-500",
    isNew: false 
  },
  { 
    id: 4, 
    type: "System", 
    title: "Profile Verified", 
    desc: "Aadhar details for Alex Johnson have been successfully verified by the admin portal.", 
    time: "1w ago", 
    icon: ShieldCheck, 
    color: "bg-emerald-500",
    isNew: false 
  },
];

export default function ParentNotificationsPage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-4xl mx-auto space-y-12">
        
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
                    <Bell className="w-7 h-7" />
                </div>
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">Family Alerts</h1>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Direct communication from Attendly Campus</p>
                </div>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Mark all as read
            </button>
        </header>

        <div className="space-y-4">
            {notifications.map((note, i) => (
                <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className={cn(
                        "p-6 border-slate-100 rounded-[2.5rem] bg-white transition-all hover:shadow-lg group relative overflow-hidden",
                        note.isNew ? "ring-2 ring-blue-500/20 shadow-blue-500/5 bg-blue-50/10" : "shadow-sm"
                    )}>
                        {note.isNew && (
                            <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                        
                        <div className="flex items-start gap-6">
                            <div className={cn(
                                "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shrink-0 shadow-lg",
                                note.color
                            )}>
                                <note.icon className="w-6 h-6" />
                            </div>

                            <div className="flex-1 space-y-1 pr-8">
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{note.type}</span>
                                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                   <span className="text-[10px] font-extrabold text-slate-400">{note.time}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">{note.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                                    {note.desc}
                                </p>
                            </div>
                            
                            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>

        {/* Messaging Bottom CTA */}
        <div className="p-10 rounded-[4rem] bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-4 max-w-md">
                    <div className="inline-flex p-3 bg-white/10 rounded-2xl">
                       <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight">Direct Faculty Chat</h3>
                    <p className="text-slate-400 font-medium">Have questions? Start a thread with the Class Advisor for immediate academic support.</p>
                </div>
                <button className="whitespace-nowrap px-8 py-4 bg-blue-600 text-white font-black text-sm rounded-3xl shadow-xl shadow-blue-900/40 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all">
                    Start new conversation
                </button>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}
