"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/ui/page-transition";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push("/dashboard");
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Log in to Attendly</h1>
            <p className="text-sm text-slate-500 mt-2">Welcome back to your dashboard</p>
          </div>

          <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl bg-white">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.edu"
                  required
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="..."
                  required
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none focus-visible:ring-blue-500 transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm hover:shadow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:scale-100"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? <a href="#" className="font-medium text-slate-900 hover:text-blue-600 transition-colors">Contact administration</a>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
