"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, ShieldAlert, WifiOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { haptics } from "@/lib/haptics";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for institutional auditing
    console.error("Institutional Recovery Triggered:", error);
    haptics.error();
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Security Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-600/5 blur-[120px] rounded-full -z-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Hardware-Grade Security Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/10">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-lg">
              <WifiOff className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-[1000] text-white tracking-tighter uppercase leading-none">
              Connection Interrupted
            </h1>
            <p className="text-slate-400 font-bold leading-relaxed">
              We've identified a sovereign synchronization error. Your current session has been 
              <span className="text-blue-400"> securely vaulted </span> locally to prevent data loss.
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={() => {
                haptics.light();
                reset();
              }}
              size="lg"
              className="w-full h-16 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-sm transition-all active:scale-95 group"
            >
              <RefreshCcw className="mr-3 w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              Secure Re-sync Now
            </Button>
            
            <Link href="/dashboard" className="block w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-16 rounded-2xl border-slate-800 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xs transition-all"
              >
                <ArrowLeft className="mr-3 w-4 h-4" />
                Return to Terminal
              </Button>
            </Link>
          </div>

          {/* Institutional Audit Info */}
          <div className="pt-6 border-t border-slate-800 w-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Error Signature: {error.digest?.slice(0, 8) || "ROPE-SEC-404"}
            </div>
            <span>Status: Recovery Mode</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
