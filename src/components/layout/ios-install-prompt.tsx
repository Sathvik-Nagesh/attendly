"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare, ArrowBigDownDash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function IosInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Detect if the device is iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // 2. Check if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // 3. Only show if on iOS and not yet installed
    if (isIos && !isStandalone) {
      // Check if user dismissed it recently
      const dismissed = localStorage.getItem('ios_prompt_dismissed');
      if (!dismissed) {
        // Show after a short delay (3 seconds) to not annoy immediately
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ios_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-[100] md:hidden"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full" />
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                <PlusSquare className="w-8 h-8" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-black uppercase tracking-tight text-lg">Install Attendly</h3>
                  <button onClick={handleDismiss} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm font-bold mt-1 leading-relaxed">
                  Install this app on your iPhone for a native, high-performance experience.
                </p>
                
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0">
                      <Share className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">
                      1. Tap the <span className="text-white font-black">'Share'</span> icon in the bottom menu bar of Safari.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0">
                      <PlusSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">
                      2. Scroll down and select <span className="text-white font-black">'Add to Home Screen'</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
               <ArrowBigDownDash className="w-6 h-6 text-slate-700 animate-bounce" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
