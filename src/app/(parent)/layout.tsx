import { ParentSidebar } from "@/components/layout/parent-sidebar";
import { CommandMenu } from "@/components/ui/command-menu";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white lg:bg-slate-50 overflow-hidden">
      <CommandMenu />
      <ParentSidebar />
      <main className="flex-1 lg:pl-64 flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 lg:px-12">
            {children}
        </div>
      </main>
    </div>
  );
}
