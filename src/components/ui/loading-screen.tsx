"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated Rings */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-[2rem] border-4 border-blue-600/20"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-24 h-24 rounded-[2rem] border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent"
        />
        
        {/* Logo Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <GraduationCap className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h2 className="text-xl font-black text-slate-900 tracking-tight">KLE Academy</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Initializing Secure Session</p>
      </motion.div>

      {/* Progress Bar Emulation */}
      <div className="mt-12 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-blue-600"
        />
      </div>
    </div>
  );
}
