import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export function Header({ title = "Overview" }: { title?: React.ReactNode }) {
  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-transparent">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-sm font-medium text-slate-500 hidden sm:block">
          {format(new Date(), "EEEE, MMM d")}
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-slate-900">Alex Jenkins</span>
            <span className="text-xs text-slate-500">Teacher ID: 4192</span>
          </div>
        </div>
      </div>
    </header>
  );
}
