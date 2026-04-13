"use client";

import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  IdCard,
  Camera,
  GraduationCap,
  Building2,
  CalendarCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudentProfilePage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-5xl mx-auto space-y-12">
        
        {/* Profile Header */}
        <section className="flex flex-col md:flex-row items-center gap-8 relative pb-10 border-b border-slate-100">
            <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 text-5xl font-black shadow-xl shadow-blue-100/50 border-4 border-white overflow-hidden uppercase">
                    AJ
                </div>
                <button className="absolute bottom-2 right-2 p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                    <Camera className="w-5 h-5" />
                </button>
            </div>
            
            <div className="text-center md:text-left space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Alex Johnson</h1>
                <p className="text-lg text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2">
                    <Hash className="w-5 h-5 text-blue-500" />
                    CS-2024-001
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                    <span className="px-4 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest">Year 2</span>
                    <span className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest">Division A</span>
                </div>
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Personal info */}
            <div className="md:col-span-2 space-y-8">
                <Card className="p-8 border-slate-100 rounded-[2.5rem] bg-white shadow-sm space-y-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoItem icon={Mail} label="University Email" text="alex.johnson@college.edu" />
                        <InfoItem icon={Phone} label="Contact Number" text="+1 (555) 902-1234" />
                        <InfoItem icon={CalendarCheck} label="Date of Enrollment" text="Aug 12, 2022" />
                        <InfoItem icon={IdCard} label="Aadhar / Govt ID" text="XXXX-XXXX-1234" />
                    </div>

                    <div className="pt-8 border-t border-slate-50">
                        <InfoItem icon={MapPin} label="Local Address" text="124 Ivy Hall, Central Campus, New York, NY 10012" />
                    </div>
                </Card>

                <Card className="p-8 border-slate-100 rounded-[2.5rem] bg-white shadow-sm space-y-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoItem icon={User} label="Primary Guardian" text="Robert Johnson (Father)" />
                        <InfoItem icon={Phone} label="Emergency Phone" text="+1 (555) 234-5678" />
                    </div>
                </Card>
            </div>

            {/* Right Column: Academic Sidebar */}
            <div className="space-y-8">
                <Card className="p-6 border-none bg-slate-900 rounded-[2.5rem] text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <GraduationCap className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="font-bold">Academic Status</span>
                    </div>
                    <div className="space-y-4">
                        <AcademicStats label="Attendance Strength" val="Very High" color="text-emerald-400" />
                        <AcademicStats label="Academic Standing" val="In Good Standing" color="text-blue-400" />
                        <AcademicStats label="Backlogs" val="Zero" color="text-slate-400" />
                    </div>
                </Card>

                <Card className="p-6 border-slate-100 rounded-[2.5rem] bg-white shadow-sm space-y-6">
                    <h4 className="font-bold text-slate-800">Quick Actions</h4>
                    <div className="space-y-3">
                         <ProfileBtn text="Update Password" />
                         <ProfileBtn text="Request ID Reprint" />
                         <ProfileBtn text="Leave Application" isRed />
                    </div>
                </Card>
            </div>
        </div>

      </div>
    </PageTransition>
  );
}

function InfoItem({ icon: Icon, label, text }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Icon className="w-3 h-3" />
                {label}
            </p>
            <p className="text-sm font-bold text-slate-700">{text}</p>
        </div>
    )
}

function AcademicStats({ label, val, color }: any) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <span className="text-xs text-slate-400 font-bold">{label}</span>
            <span className={cn("text-xs font-black uppercase tracking-widest", color)}>{val}</span>
        </div>
    )
}

function ProfileBtn({ text, isRed }: any) {
    return (
        <button className={cn(
            "w-full py-3 rounded-2xl text-xs font-bold transition-all border",
            isRed 
            ? "border-rose-100 text-rose-600 hover:bg-rose-50" 
            : "border-slate-100 text-slate-600 hover:bg-slate-50"
        )}>
            {text}
        </button>
    )
}
