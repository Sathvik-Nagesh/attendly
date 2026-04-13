import { UnifiedSidebar } from "@/components/layout/unified-sidebar";
import { CommandMenu } from "@/components/ui/command-menu";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("Attendex-session");
  let role = "admin";

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      role = session.role?.toLowerCase() || "admin";
    } catch (e) {
      console.error("Layout Session Parse Error", e);
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <CommandMenu />
      <UnifiedSidebar variant={role as any} />
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        // The UnifiedSidebar handle its own layout displacement or we can just use ml-64/20
        "md:pl-64" // We'll assume default non-collapsed width for layout baseline
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
