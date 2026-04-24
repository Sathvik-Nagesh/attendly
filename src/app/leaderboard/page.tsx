"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Star, Search, Filter, RefreshCcw, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LeaderboardEntry {
  rank: number;
  student_name: string;
  section_name: string;
  total_marks: number;
  points: number;
  roll_number: string;
}

export default function LeaderboardPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState("Academic"); // Academic or Overall

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch from a view or construct it. 
      // Assuming a view exists or we fetch students with their marks.
      const { data, error } = await supabase
        .from('students')
        .select(`
          name,
          roll_number,
          class:classes(name, section)
        `)
        .limit(20);

      if (error) throw error;

      // Mocking the marks/points for the leaderboard visual
      const mockEntries: LeaderboardEntry[] = (data || []).map((s: any, i: number) => ({
        rank: i + 1,
        student_name: s.name,
        section_name: `${s.class?.name || ''} ${s.class?.section || ''}`,
        total_marks: 20 - (i * 0.5),
        points: 500 - (i * 15),
        roll_number: s.roll_number
      }));

      setEntries(mockEntries);
    } catch (err) {
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredEntries = entries.filter(e => 
    e.student_name.toLowerCase().includes(search.toLowerCase()) ||
    e.section_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Loading Leaderboard</p>
    </div>
  );

  const top3 = filteredEntries.slice(0, 3);
  const remaining = filteredEntries.slice(3);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Student Leaderboard" showBack />
        
        <div className="flex-1 py-10 space-y-12 px-6 md:px-0">
          
          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
               {["Academic", "Overall"].map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={cn(
                     "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none",
                     filter === f ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   {f}
                 </button>
               ))}
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search for a student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
              />
            </div>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-10">
            {top3[1] && <PodiumCard entry={top3[1]} rank={2} color="slate" />}
            {top3[0] && <PodiumCard entry={top3[0]} rank={1} color="gold" />}
            {top3[2] && <PodiumCard entry={top3[2]} rank={3} color="amber" />}
          </div>

          {/* Detailed Ranks */}
          <div className="bg-slate-900 rounded-[2.5rem] p-4 md:p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-4">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Student</div>
                <div className="col-span-1 text-center">Marks</div>
                <div className="col-span-1 text-right">Points</div>
              </div>

              <AnimatePresence mode="popLayout">
                {remaining.map((entry, i) => (
                  <motion.div
                    key={entry.roll_number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-6 items-center px-8 py-5 rounded-2xl hover:bg-white/5 transition-colors group cursor-default"
                  >
                    <div className="col-span-1">
                       <span className="text-sm font-black text-slate-500 group-hover:text-white transition-colors">#{entry.rank}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white text-xs border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                         {entry.student_name.charAt(0)}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-white leading-tight">{entry.student_name}</p>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entry.section_name}</p>
                       </div>
                    </div>
                    <div className="col-span-1 text-center">
                       <span className="text-sm font-black text-emerald-400">{entry.total_marks}/20</span>
                    </div>
                    <div className="col-span-1 text-right">
                       <span className="text-sm font-black text-blue-400">{entry.points} XP</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}

function PodiumCard({ entry, rank, color }: { entry: LeaderboardEntry, rank: number, color: "gold" | "slate" | "amber" }) {
  const configs = {
    gold: { 
      bg: "bg-gradient-to-br from-yellow-400 to-yellow-600", 
      icon: Trophy, 
      label: "1st Place",
      height: "h-80 md:h-[24rem]",
      border: "border-yellow-300/50 shadow-yellow-500/20"
    },
    slate: { 
      bg: "bg-gradient-to-br from-slate-400 to-slate-600", 
      icon: Medal, 
      label: "2nd Place",
      height: "h-72 md:h-80",
      border: "border-slate-300/50 shadow-slate-500/20"
    },
    amber: { 
      bg: "bg-gradient-to-br from-orange-400 to-orange-600", 
      icon: Award, 
      label: "3rd Place",
      height: "h-64 md:h-72",
      border: "border-orange-300/50 shadow-orange-500/20"
    }
  };

  const config = configs[color];
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative rounded-[2.5rem] p-1 flex flex-col items-center justify-end shadow-2xl",
        config.height,
        config.bg,
        config.border,
        rank === 1 ? "z-20 scale-105" : "z-10"
      )}
    >
      <div className="absolute top-8 flex flex-col items-center text-white text-center px-4 w-full">
         <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30">
            <Icon className="w-8 h-8" />
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">{config.label}</p>
         <h3 className="text-lg font-black leading-tight truncate w-full">{entry.student_name}</h3>
      </div>

      <div className="bg-white/10 backdrop-blur-xl w-full rounded-t-[1.5rem] rounded-b-[2.4rem] p-6 text-white text-center border-t border-white/20">
         <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{entry.section_name}</p>
         <div className="flex justify-center items-baseline gap-1">
            <span className="text-3xl font-black tracking-tighter">{entry.total_marks}</span>
            <span className="text-xs font-bold opacity-60">/20</span>
         </div>
         <div className="mt-4 flex items-center justify-center gap-2 bg-black/20 rounded-full py-1.5 px-4 mx-auto w-fit border border-white/10">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{entry.points} Points</span>
         </div>
      </div>

      {rank === 1 && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
           <div className="bg-white px-6 py-2 rounded-full shadow-2xl border border-slate-100">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Rank 1</span>
           </div>
        </div>
      )}
    </motion.div>
  );
}
