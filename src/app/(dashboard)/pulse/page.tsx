"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Activity, Users, Radio, MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";

const departments = [
  { name: "Computer Science", active: 124, total: 140, status: "High" },
  { name: "Mechanical Eng.", active: 89, total: 110, status: "Medium" },
  { name: "Civil Engineering", active: 45, total: 60, status: "Medium" },
  { name: "Electronics", active: 92, total: 95, status: "High" },
];

export default function CampusPulsePage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Live Campus Pulse" />
        
        <div className="flex-1 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="p-6 bg-slate-900 text-white rounded-2xl border-none shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Campus Status</p>
                  <h3 className="text-3xl font-bold flex items-center gap-2">
                    Active
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-slate-500 text-sm mt-4">8 Departments live</p>
                </div>
                <Radio className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
             </Card>

             <Card className="p-6 bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Students On-Site</p>
                  <h3 className="text-3xl font-bold text-slate-900">1,428</h3>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-bold">
                  <Zap className="w-3 h-3 fill-current" />
                  Peak Attendance recorded
                </div>
             </Card>

             <Card className="p-6 bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Lectures Right Now</p>
                  <h3 className="text-3xl font-bold text-slate-900">42</h3>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium">
                  Across 3 Academic buildings
                </div>
             </Card>

             <Card className="p-6 bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Staff Logged In</p>
                  <h3 className="text-3xl font-bold text-slate-900">86%</h3>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-bold">
                  <Users className="w-3 h-3" />
                  Average marking time 1.2s
                </div>
             </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 p-8 border-slate-200 rounded-[2rem] bg-white shadow-sm overflow-hidden relative">
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-bold text-slate-900">Real-time Presence by Dept.</h3>
                   <p className="text-sm text-slate-500">Live feed from academic building access points</p>
                 </div>
                 <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Detailed View</button>
               </div>

               <div className="space-y-8">
                 {departments.map((dept, i) => (
                   <div key={dept.name} className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-bold text-slate-700">{dept.name}</span>
                       <span className="text-xs font-bold text-slate-500">{dept.active} / {dept.total} present</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${(dept.active / dept.total) * 100}%` }}
                         transition={{ delay: i * 0.1, duration: 1 }}
                         className={`h-full rounded-full ${
                           dept.status === 'High' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-blue-500'
                         }`}
                       />
                     </div>
                   </div>
                 ))}
               </div>
            </Card>

            <Card className="p-8 border-slate-200 rounded-[2rem] bg-white shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Campus News</h3>
               </div>
               
               <div className="space-y-6">
                 <div className="border-l-2 border-slate-100 pl-4 py-1">
                   <p className="text-xs font-bold text-slate-400 mb-1">10:45 AM</p>
                   <p className="text-sm font-bold text-slate-800">Inter-College Sports Meet</p>
                   <p className="text-xs text-slate-500">24 students marked 'On-Duty'</p>
                 </div>
                 <div className="border-l-2 border-slate-100 pl-4 py-1 opacity-60">
                   <p className="text-xs font-bold text-slate-400 mb-1">09:12 AM</p>
                   <p className="text-sm font-bold text-slate-800">Staff Meeting Today</p>
                   <p className="text-xs text-slate-500">Scheduled for 4:00 PM in Hall B</p>
                 </div>
                 <div className="border-l-2 border-slate-100 pl-4 py-1 opacity-60">
                   <p className="text-xs font-bold text-slate-400 mb-1">Yesterday</p>
                   <p className="text-sm font-bold text-slate-800">Semester Fees Deadline</p>
                   <p className="text-xs text-slate-500">Automated reminder sent to all parents</p>
                 </div>
               </div>

               <button className="w-full mt-10 py-3 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors">
                  Create Announcement
               </button>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
