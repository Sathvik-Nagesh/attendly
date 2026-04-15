"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-md"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <GraduationCap className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-2">
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter">404</h1>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Resource Missing</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
                The academic record or page you're looking for doesn't exist or has been moved.
            </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
            <Link href="/dashboard" className="h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl hover:shadow-slate-200 transition-all flex items-center justify-center">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>
            <Button variant="ghost" onClick={() => window.history.back()} className="h-12 rounded-2xl text-slate-400 font-bold text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
            </Button>
        </div>
      </motion.div>
      
      <div className="fixed bottom-8 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] pointer-events-none">
        Attendex Security Protocol
      </div>
    </div>
  );
}
