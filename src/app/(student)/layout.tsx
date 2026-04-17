import { UnifiedSidebar } from "@/components/layout/unified-sidebar";
import { CommandMenu } from "@/components/ui/command-menu";
import { protectRoute } from "@/lib/middleware-utils";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectRoute("STUDENT");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <CommandMenu />
      <UnifiedSidebar variant="student" />
      <main className="flex-1 md:pl-20 xl:pl-64 flex flex-col pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto px-0 md:px-12">
            {children}
        </div>
      </main>
    </div>
  );
}
