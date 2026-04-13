import { Sidebar } from "@/components/layout/sidebar";
import { CommandMenu } from "@/components/ui/command-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <CommandMenu />
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <div className="flex-1 w-full mx-auto p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
