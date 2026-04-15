"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/ui/page-transition";

import { GraduationCap } from "lucide-react";
import { validateLoginInput } from "@/lib/validators";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(false); // Reset in case of early return
    setIsLoading(true);

    const validation = validateLoginInput({ identifier: email, password });
    if (!validation.success) {
      Object.values(validation.errors || {}).forEach(err => toast.error(err));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Identity Authorized", {
          description: "Welcome back to your academic workstation."
      });
      
      // Routing depends on user role in metadata
      const role = data.user?.user_metadata?.role || "ADMIN";
      const redirectPath = role === "STUDENT" ? "/student/dashboard" : role === "PARENT" ? "/parent/dashboard" : "/dashboard";
      
      router.push(redirectPath);
    } catch (err: any) {
        toast.error("Authorization Failed", {
            description: err.message || "Please verify your credentials or contact tech support."
        });
        setIsLoading(false);
    }
  };


  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-6">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />

        <div className="w-full max-w-[420px] relative z-10 scale-in-center">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-600/30">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center italic">Attendex</h1>
            <p className="text-xs font-bold text-slate-400 mt-2 text-center uppercase tracking-[0.3em]">Identity Protocol</p>
          </div>

          <Card className="p-10 border-slate-100 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-[3rem] border border-slate-100">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Academic ID</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@attendly.edu"
                  required
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 font-bold px-5 text-base transition-all"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Key</Label>
                  <Link href="/forgot-password" title="Recover Access" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">Forgot?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 font-bold px-5 text-base transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                disabled={isLoading}
              >
                {isLoading ? "Authorizing..." : "Access Portal"}
              </Button>
            </form>
          </Card>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                New to the system? <Link href="/signup" className="text-blue-600 hover:underline">Register here</Link>
            </p>
            <div className="mt-6 flex items-center justify-center gap-6">
              <Link href="/" className="text-[10px] font-black text-slate-300 hover:text-blue-600 uppercase tracking-widest transition-colors">Infrastructure</Link>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <Link href="#" className="text-[10px] font-black text-slate-300 hover:text-blue-600 uppercase tracking-widest transition-colors">SysOps</Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

