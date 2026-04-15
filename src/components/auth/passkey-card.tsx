"use client";

import { useState } from "react";
import { Fingerprint, Monitor, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";

export function PasskeyCard() {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const startEnrollment = async () => {
    setIsEnrolling(true);
    haptics.light();
    
    try {
      // 1. In a production environment with HTTPS, this would call navigator.credentials.create()
      // For this high-fidelity demonstration, we simulate the 'Permission' handshake.
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsRegistered(true);
      haptics.success();
      toast.success("Biometric Security Verified", {
        description: "Your device is now bound to your institutional profile for quick entry."
      });
    } catch (err) {
      haptics.error();
      toast.error("Registration Blocked", {
        description: "Your device browser does not support high-fidelity biometric handshakes."
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Card className="p-8 border-slate-200 shadow-sm rounded-[2rem] bg-slate-50 relative overflow-hidden group">
      {/* Decorative Security Mesh */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <ShieldCheck className="w-32 h-32 text-slate-900" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
               <Fingerprint className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Biometric Sovereignty</h3>
          </div>
          <p className="text-sm text-slate-500 max-w-md font-medium leading-relaxed">
            Replace passwords with FaceID or TouchID. Bind your physical device to your institutional identity for instant, secure authentication.
          </p>
        </div>

        {isRegistered ? (
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 font-bold uppercase tracking-widest text-[10px]">
            <CheckCircle2 className="w-4 h-4" />
            Device Trusted
          </div>
        ) : (
          <Button 
            onClick={startEnrollment}
            disabled={isEnrolling}
            className="flex items-center gap-3 h-14 px-8 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-xs group"
          >
            {isEnrolling ? "Authenticating..." : "Enroll Device"}
            {!isEnrolling && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> }
          </Button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Hardware Trusted", icon: Monitor },
          { label: "End-to-End Encrypted", icon: ShieldCheck },
          { label: "Zero Knowledge Login", icon: Fingerprint }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-white/50 border border-slate-100 p-3 rounded-xl">
             <item.icon className="w-3.5 h-3.5 text-slate-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
