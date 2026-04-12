"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  UserRound,
  History,
  Activity,
  MessageSquare
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudentProfileProps {
  student: any;
  onClose: () => void;
}

export function StudentProfile({ student, onClose }: StudentProfileProps) {
  if (!student) return null;

  const attendanceValue = parseInt(student.attendance || "85");
  const isAtRisk = attendanceValue < 75;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-100"
        >
          {/* Header */}
          <div className="p-6 pb-0 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Student Profile</h3>
            <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Identity Card */}
            <div className="flex items-center gap-6">
               <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden ring-4 ring-blue-50">
                    <img 
                        src={`https://i.pravatar.cc/150?u=${student.roll || student.rollNumber}`} 
                        alt={student.name}
                        className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${isAtRisk ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {isAtRisk ? <AlertCircle className="w-3 h-3 text-white" /> : <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
               </div>
               <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{student.name}</h2>
                  <p className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg inline-block">{student.roll || student.rollNumber}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3" />
                    Hostel Block B, Room 402
                  </p>
               </div>
            </div>

            {/* Attendance Analytics */}
            <div className="grid grid-cols-2 gap-4">
               <Card className="p-4 border-slate-100 bg-slate-50/50 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Attendance</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-extrabold ${isAtRisk ? 'text-red-600' : 'text-slate-900'}`}>{student.attendance || "85%"}</span>
                    {isAtRisk ? <TrendingDown className="w-4 h-4 text-red-500 mb-1" /> : <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />}
                  </div>
               </Card>
               <Card className="p-4 border-slate-100 bg-slate-50/50 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Score</p>
                  <div className={`text-2xl font-extrabold ${isAtRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isAtRisk ? "HIGH" : "LOW"}
                  </div>
               </Card>
            </div>

            {/* Heatmap Simulation */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Weekly Presence</h4>
                    <span className="text-xs text-slate-400">Last 14 days</span>
                </div>
                <div className="flex gap-1.5 justify-between">
                    {[1,1,1,1,0,1,1,0,1,1,1,1,1,1].map((p, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 h-8 rounded-md ${p === 1 ? 'bg-emerald-500/20' : 'bg-red-500/20'} border ${p === 1 ? 'border-emerald-500/20' : 'border-red-500/20'}`}
                            title={p === 1 ? 'Present' : 'Absent'}
                        />
                    ))}
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Direct Contact</h4>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Personal Email</p>
                        <p className="text-sm font-semibold text-slate-700">{student.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact (Parent)</p>
                        <p className="text-sm font-semibold text-slate-700">+91 98765 43210</p>
                      </div>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-8 px-3">
                         <MessageSquare className="w-3 h-3 mr-1.5" />
                         SMS
                      </Button>
                   </div>
                </div>
            </div>

            {/* Recent History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Recent Activity</h4>
                    <History className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-4 border-l-2 border-slate-50 pl-6 relative">
                   <div className="relative">
                      <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                      <p className="text-xs font-bold text-slate-900">Absent for Morning Lecture</p>
                      <p className="text-[10px] text-slate-400">Today, 10:00 AM • Physics 202</p>
                   </div>
                   <div className="relative opacity-60">
                      <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      <p className="text-xs font-bold text-slate-900">Marked Present</p>
                      <p className="text-[10px] text-slate-400">Yesterday, 11:30 AM • CS 101</p>
                   </div>
                </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-50 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl h-12 border-slate-200 text-slate-600 font-bold">
                Edit Record
            </Button>
            <Button className="flex-1 rounded-xl h-12 bg-slate-900 text-white font-bold">
                View Reports
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
