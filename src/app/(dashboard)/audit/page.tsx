"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { AlertTriangle, UserX, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const proxyAnalysis = [
  { 
    id: 1, 
    student: "Brandon Cooper", 
    roll: "CS-02", 
    pattern: "Frequently absent for Lecture 1", 
    absences: 5, 
    risk: "High" 
  },
  { 
    id: 2, 
    student: "George Harris", 
    roll: "CS-07", 
    pattern: "Misses all lectures on Mondays", 
    absences: 4, 
    risk: "Medium" 
  },
  { 
    id: 3, 
    student: "Derek Evans", 
    roll: "CS-04", 
    pattern: "Absent for Lecture 4 (Post-Lunch)", 
    absences: 3, 
    risk: "Medium" 
  },
];

export default function ProxyAuditPage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Monthly Proxy Audit" />
        
        <div className="flex-1 py-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-amber-900 font-semibold mb-1">Pattern Recognition Active</h3>
              <p className="text-amber-700 text-sm">
                Our system has detected specific lecture-wise absence patterns. These students might be skipping specific periods even if they attend others.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {proxyAnalysis.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold">
                        {item.student.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.student}</h4>
                        <p className="text-xs text-slate-500 font-medium">{item.roll}</p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Detection Pattern</p>
                          <p className="text-sm font-semibold text-slate-700">{item.pattern}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Hits</p>
                          <p className="text-sm font-semibold text-slate-700">{item.absences} times this month</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        item.risk === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {item.risk} Risk
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {proxyAnalysis.length === 0 && (
            <div className="py-24 text-center">
              <UserX className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No suspicious patterns detected this month.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
