import { UnifiedSidebar } from "@/components/layout/unified-sidebar";
import { CommandMenu } from "@/components/ui/command-menu";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, Hourglass, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("Attendex-session");
  let role = "admin";
  let status = "APPROVED";

  // Use a service-level select to bypass RLS for layout check if needed, 
  // but better to use the user session for security.
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', user.id)
        .single();
    
    status = profile?.status || "APPROVED";
    role = profile?.role?.toLowerCase() || "teacher";
  }

  // Verification Gate for Teachers
  if (status === 'PENDING') {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 flex-col text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-rose-500/10 blur-3xl" />
              <div className="relative z-10 space-y-8 max-w-lg">
                  <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-blue-600/20 animate-pulse">
                      <Hourglass className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-4">
                      <h1 className="text-4xl font-black text-white italic tracking-tighter">Verification Pending</h1>
                      <p className="text-slate-400 font-medium leading-relaxed">
                          Your Faculty Identity is currently under institutional review. For the college trial, 
                          an administrator must verify your credentials before administrative tools are unlocked.
                      </p>
                  </div>
                  <div className="pt-8 flex flex-col gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-left">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Manual Audit</p>
                        </div>
                        <Link href="/login" className="text-xs font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors py-4">
                            Log out & try another identity
                        </Link>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <CommandMenu />
      <UnifiedSidebar variant={role as any} />
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        "md:pl-64" 
      )}>
        <div className="flex-1 w-full mx-auto p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Helper to use cn in server components if not already imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
