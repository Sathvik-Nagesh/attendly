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
      <main className="flex-1 pl-64 flex flex-col">
        {/* We add header at the page level to customize the title, 
            or we can just put it here with a generic title if needed, 
            but using it per-page allows custom titles. */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
