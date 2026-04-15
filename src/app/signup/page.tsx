"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Mail, User, Phone, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [role, setRole] = useState<'TEACHER' | 'STUDENT' | 'PARENT'>('STUDENT');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: role
          }
        }
      });

      if (error) throw error;

      toast.success("Identity Registered", {
          description: `Welcome aboard! Please verify your ${role.toLowerCase()} email.`
      });
      
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
        toast.error("Registration Failed", {
            description: err.message || "Please contact administrator for manual entry."
        });
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[100px] -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative z-10"
      >
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-2xl shadow-blue-600/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-[1000] text-slate-900 tracking-tighter">Initialize Identity</h1>
          
          <div className="flex p-1 bg-slate-100 rounded-2xl">
             {(['TEACHER', 'STUDENT', 'PARENT'] as const).map((r) => (
                 <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                        "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        role === r ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-500"
                    )}
                 >
                     {r === 'TEACHER' ? 'Faculty' : r === 'STUDENT' ? 'Student' : 'Guardian'}
                 </button>
             ))}
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Full Legal Name" 
                className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Institutional Email" 
                className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm"
                required
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Security Contact (Mobile)" 
                className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Private Access Key" 
                className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm"
                required
              />
            </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all group mt-6"
          >
            {loading ? "Authorizing..." : (
                <>
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
           <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
             Existing Identity?
           </Link>
           <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
             <ShieldCheck className="w-4 h-4" />
             Verified
           </div>
        </div>
      </motion.div>
    </div>
  );
}
