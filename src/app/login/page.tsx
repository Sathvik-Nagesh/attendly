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
import { useBranding } from "@/context/branding-context";

import { Eye, EyeOff, Loader2, Fingerprint } from "lucide-react";
import { useWebAuthn } from "@/hooks/use-webauthn";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'TEACHER' | 'STUDENT' | 'PARENT'>('STUDENT');
  const { branding } = useBranding();
  const { authenticateWithPasskey, isLoading: isBiometricLoading } = useWebAuthn();

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
      let email = values.identifier;
      if (!values.identifier.includes('@')) {
        const id = values.identifier.toLowerCase();
        email = role === 'STUDENT' ? `${id}@Attendex.local` : role === 'PARENT' ? `p_${id}@Attendex.local` : id;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
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

      const userRole = profile?.role || data.user?.user_metadata?.role || "TEACHER";
      const redirectPath = userRole === "STUDENT" ? "/student/dashboard" : userRole === "PARENT" ? "/parent/dashboard" : "/dashboard";
      
      router.push(redirectPath);
    } catch (err: any) {
        toast.error("Authorization Failed", {
            description: err.message || "Please verify your credentials or contact tech support."
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticateWithPasskey();
    if (success) {
      // In a real app, the authenticateWithPasskey would return a user object or token.
      // For this implementation, we simulate the redirect to the dashboard.
      toast.success("Biometric Sovereignty Authorized", {
          description: "Access granted via trusted hardware."
      });
      router.push("/dashboard");
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
               <img src={branding.logoUrl} alt={branding.name} className="w-full h-auto rounded-2xl" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">{branding.name}</h1>
            <p className="text-[10px] font-black text-slate-400 mt-2 text-center uppercase tracking-[0.3em]">Institutional Secure Login</p>
          </div>

          <Card className="p-8 md:p-10 border-slate-100 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] md:rounded-[3rem] border border-slate-100">
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
              {(['STUDENT', 'TEACHER', 'PARENT'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    role === r ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-500"
                  )}
                >
                  {r === 'TEACHER' ? 'Faculty' : r === 'STUDENT' ? 'Student' : 'Guardian'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <Label htmlFor="identifier" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Institutional Identifier</Label>
                <Input
                  id="identifier"
                  type="text"
                  {...register("identifier")}
                  placeholder="Email or Roll Number"
                  autoComplete="username"
                  className={cn(
                    "h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 font-bold px-5 text-base transition-all",
                    errors.identifier && "border-rose-500 bg-rose-50/30"
                  )}
                />
                {errors.identifier && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.identifier.message}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</Label>
                  <Link href="/forgot-password" title="Recover Access" className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative group/pass">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={cn(
                      "h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 font-bold px-5 pr-12 text-base transition-all",
                      errors.password && "border-rose-500 bg-rose-50/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-white px-2 text-slate-400 font-black">OR</span></div>
              </div>

              <Button
                type="button"
                onClick={handleBiometricLogin}
                disabled={isBiometricLoading || isLoading}
                variant="outline"
                className="w-full h-16 rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-900 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
              >
                {isBiometricLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Fingerprint className="w-5 h-5 text-blue-600" />}
                Biometric Login
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


