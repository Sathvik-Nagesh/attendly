"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
            <AlertTriangle className="w-10 h-10" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Critical Engine Failure</h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              The application root encountered an unrecoverable exception. Institutional security protocols have isolated the instance.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => reset()}
              className="w-full h-14 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Instance
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/'}
              className="w-full h-12 rounded-xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
            >
              <Home className="mr-2 h-3 w-3" />
              Return to Landing
            </Button>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
              Error Digest: {error.digest || "UNKNOWN_ERR"}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
