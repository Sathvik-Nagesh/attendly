"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Mail, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Recovery Initialized", {
          description: "A secure reset link has been dispatched to your inbox."
      });
    } catch (err: any) {
        toast.error("Recovery Failed", {
            description: err.message || "Email not found in our academic registry."
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-slate-50/50 -skew-y-6 -mt-32" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-10 relative z-10"
      >
        <div className="space-y-6">
           <Link href="/login" className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors group uppercase tracking-widest">
             <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
             Back to Identity Protocol
           </Link>

           <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-900/30">
              <KeyRound className="w-8 h-8" />
           </div>

           <div className="space-y-3">
             <h1 className="text-4xl font-[1000] text-slate-900 tracking-tighter">Recover Access</h1>
             <p className="text-slate-500 font-bold text-xs uppercase tracking-wider leading-relaxed">
               Enter your credentials to receive a secure recovery gateway link.
             </p>
           </div>
        </div>

        {!submitted ? (
            <form onSubmit={handleReset} className="space-y-6">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@attendly.edu" 
                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all"
                        required
                    />
                </div>

                <Button 
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/10 hover:bg-blue-700 transition-all"
                >
                    {loading ? "Initializing..." : "Send Reset Link"}
                </Button>
            </form>
        ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-[3rem] bg-emerald-50 border border-emerald-100 text-center space-y-6"
            >
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
                    <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-emerald-900 font-black uppercase tracking-widest text-xs">Verify Inbox</h3>
                   <p className="text-emerald-600 text-[11px] font-bold leading-relaxed">
                     A secure recovery link has been dispatched. Please check your institutional email and associated spam folders.
                   </p>
                </div>
                <Link href="/login" className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:underline">Return to Login</Link>
            </motion.div>
        )}

        <div className="text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Attendex Infrastructure</p>
        </div>
      </motion.div>
    </div>
  );
}
