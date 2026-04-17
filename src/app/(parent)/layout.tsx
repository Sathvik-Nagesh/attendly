import { UnifiedSidebar } from "@/components/layout/unified-sidebar";
import { CommandMenu } from "@/components/ui/command-menu";
import { protectRoute } from "@/lib/middleware-utils";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectRoute("PARENT");

  return (
    <div className="flex h-screen bg-white lg:bg-slate-50 overflow-hidden">
      <CommandMenu />
      <UnifiedSidebar variant="parent" />
      <main className="flex-1 lg:pl-64 flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 lg:px-12">
            {children}
        </div>
      </main>
    </div>
  );
}
