"use client";

import { useEffect } from "react";
import { RefreshCcw, ShieldAlert, WifiOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { haptics } from "@/lib/haptics";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical System Recovery Triggered:", error);
    haptics.error();
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Security Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-indigo-600/5 blur-[120px] rounded-full -z-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-2xl shadow-indigo-500/10">
            <ShieldAlert className="w-12 h-12" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-[1000] text-white tracking-tighter uppercase leading-none">
              System Stability Alert
            </h1>
            <p className="text-slate-400 font-bold leading-relaxed">
               A technical anomaly was detected in the grid. Our automated recovery engine is standing by to restore your connection safely.
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={() => {
                haptics.light();
                reset();
              }}
              size="lg"
              className="w-full h-16 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-black uppercase tracking-widest text-sm transition-all active:scale-95 group shadow-xl shadow-indigo-600/20"
            >
              <RefreshCcw className="mr-3 w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              Attempt Secure Reset
            </Button>
            
            <Link href="/" className="block w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-16 rounded-2xl border-slate-800 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xs transition-all"
              >
                <Home className="mr-3 w-4 h-4" />
                Return to Landing Page
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-800 w-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
             <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Instance: BU-STABLE-ALPHA
            </div>
            <span>Build Finalized</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
