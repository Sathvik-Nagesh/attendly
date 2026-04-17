"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/ui/page-transition";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schemas";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast.success("Identity Authorized", {
          description: "Welcome back to your academic workstation."
      });
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      const role = profile?.role || data.user?.user_metadata?.role || "TEACHER";
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

        <div className="w-full max-w-[420px] relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center p-2 mb-6 shadow-xl border border-slate-100">
               <img src="/icons/KLE_logo.jpg" alt="KLE Academy" className="w-full h-auto rounded-2xl" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">KLE Academy</h1>
            <p className="text-[10px] font-black text-slate-400 mt-2 text-center uppercase tracking-[0.3em]">Institutional Secure Login</p>
          </div>

          <Card className="p-8 md:p-10 border-slate-100 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] md:rounded-[3rem] border border-slate-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your institutional email"
                  autoComplete="username email"
                  className={cn(
                    "h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 font-bold px-5 text-base transition-all",
                    errors.email && "border-rose-500 bg-rose-50/30"
                  )}
                />
                {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.email.message}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</Label>
                  <Link href="/forgot-password" title="Recover Access" className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Forgot?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={cn(
                    "h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 font-bold px-5 text-base transition-all",
                    errors.password && "border-rose-500 bg-rose-50/30"
                  )}
                />
                {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </Card>

          <div className="mt-10 text-center space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                New faculty or student? <Link href="/signup" className="text-blue-600 hover:underline mx-1">Create Account</Link>
            </p>
            <div className="flex items-center justify-center gap-6">
              <Link href="/" className="text-[10px] font-black text-slate-300 hover:text-blue-600 uppercase tracking-widest transition-colors">Home</Link>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <Link href="#" className="text-[10px] font-black text-slate-300 hover:text-blue-600 uppercase tracking-widest transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

