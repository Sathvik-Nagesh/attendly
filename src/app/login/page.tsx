"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/ui/page-transition";

import { validateLoginInput } from "@/lib/validators";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Validate Input (Security Component)
    const validation = validateLoginInput({ identifier: email, password });

    if (!validation.success) {
      Object.values(validation.errors || {}).forEach(err => toast.error(err));
      setIsLoading(false);
      return;
    }

    // 2. Mock Authentication Logic
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let role = "";
    let redirectPath = "";

    if (password === "password123") {
      role = "ADMIN";
      redirectPath = "/dashboard";
    } else if (password === "teacher123") {
      role = "TEACHER";
      redirectPath = "/dashboard";
    } else if (password === "student123") {
      role = "STUDENT";
      redirectPath = "/student/dashboard";
    } else if (password === "parent123") {
      role = "PARENT";
      redirectPath = "/parent/dashboard";
    }

    if (role) {
      // Create session cookie (stub for middleware)
      document.cookie = `Attendex-session=${JSON.stringify({ role, orgId: "demo-org-1" })}; path=/`;
      toast.success(`Welcome back! Logged in as ${role}`);
      router.push(redirectPath);
    } else {
      toast.error("Invalid credentials", {
        description: "Try password123 (Admin), teacher123, student123, or parent123."
      });
      setIsLoading(false);
    }
  };


  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />

        <div className="w-full max-w-[420px] relative z-10 scale-in-center">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-600/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Attendex Portal</h1>
            <p className="text-sm font-bold text-slate-500 mt-3 text-center uppercase tracking-widest">Academic Management Suite</p>
          </div>

          <Card className="p-10 border-white bg-white/70 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Identity</Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username, Email or Phone"
                  required
                  className="h-14 rounded-2xl border-slate-200 bg-white shadow-none focus-visible:ring-blue-500 font-bold px-5 text-base transition-all"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Security Key</Label>
                  <a href="#" className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">Forgot?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-14 rounded-2xl border-slate-200 bg-white shadow-none focus-visible:ring-blue-500 font-bold px-5 text-base transition-all"
                />
              </div>


              <Button
                type="submit"
                className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                disabled={isLoading}
              >
                {isLoading ? "Validating..." : "Authorize"}
              </Button>
            </form>
          </Card>

          <div className="mt-10 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Secured by Gradence Ecosystem
            </p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <a href="/" className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">Home</a>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <a href="#" className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">Help Desk</a>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

