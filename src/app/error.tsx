"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an institutional reporting service
    console.error("Critical System Fault:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 flex-col text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-blue-500/5 blur-3xl" />
      
      <div className="relative z-10 space-y-8 max-w-lg">
        <div className="w-20 h-20 bg-rose-100 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-rose-500/10 border border-rose-200">
          <AlertTriangle className="w-10 h-10 text-rose-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">System Interruption</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            The workstation encountered an unexpected runtime error. This incident has been logged for institutional audit.
          </p>
          <div className="p-3 bg-slate-100 rounded-xl mt-4 border border-slate-200 overflow-hidden">
            <p className="text-[10px] font-mono text-slate-400 break-all">
              FAULT_ID: {error.digest || "UNKNOWN_EXCEPTION"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => reset()}
            className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 group"
          >
            <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Resume Session
          </Button>
          
          <Link href="/">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-600 font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <Home className="w-4 h-4 mr-2" />
              Emergency Exit
            </Button>
          </Link>
        </div>

        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pt-8">
          Institutional Reliability Protocol 404-E
        </p>
      </div>
    </div>
  );
}
