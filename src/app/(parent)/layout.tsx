import { UnifiedSidebar } from "@/components/layout/unified-sidebar";
import { CommandMenu } from "@/components/ui/command-menu";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled by middleware.ts — no need for double protectRoute call here
  return (
    <div className="flex h-screen bg-white lg:bg-slate-50 overflow-hidden">
      <CommandMenu />
      <UnifiedSidebar variant="parent" />
      <main className="flex-1 lg:pl-64 flex flex-col pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto px-0 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
