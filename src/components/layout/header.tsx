"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header({ title = "Overview", showBack = false }: { title?: React.ReactNode, showBack?: boolean }) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ name: string, id: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, faculty_id, roll_number')
          .eq('id', user.id)
          .single();

        setUserProfile({
          name: profile?.full_name || user.user_metadata?.full_name || "User",
          id: profile?.faculty_id || profile?.roll_number || "N/A"
        });
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="pt-[env(safe-area-inset-top)] md:pt-0 h-auto md:h-16 px-4 md:px-8 flex items-center justify-between border-slate-100/50 md:border-b md:bg-white/50 md:backdrop-blur-sm relative">
      <div className="flex items-center gap-4 py-3 md:py-0">
        {showBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="p-2 h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-sm md:text-2xl font-black text-slate-900 tracking-tight uppercase">{title}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
          {format(new Date(), "EEEE, MMM d")}
        </div>

        <div className="hidden md:flex items-center gap-2 md:gap-3 border-l border-slate-200 pl-4 md:pl-6">
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.name || 'User'}`} alt="User" />
            <AvatarFallback>{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{userProfile?.name || "Loading..."}</span>
            <span className="text-xs text-slate-500">ID: {userProfile?.id || "..."}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
