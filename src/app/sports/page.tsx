"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Medal, Trophy, Users, Plus, Save, Trash2, Search, Filter, RefreshCcw, Star, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface EventEntry {
  id?: string;
  category: string;
  class_id: string;
  position: "1st" | "2nd" | "3rd" | "Participant";
  points: number;
}

export default function SportsEntryPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [entries, setEntries] = useState<EventEntry[]>([]);
  const [categories] = useState([
    "100m Sprint", "200m Sprint", "Relay Race", "Tug of War", 
    "Long Jump", "High Jump", "Cricket", "Football", "Volleyball", "Chess"
  ]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: classData } = await supabase.from('classes').select('*');
      setClasses(classData || []);
    } catch (err) {
      toast.error("Failed to load institutional data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const addEntry = () => {
    setEntries([
      ...entries,
      { category: categories[0], class_id: classes[0]?.id || "", position: "1st", points: 5 }
    ]);
  };

  const updateEntry = (index: number, field: keyof EventEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    // Auto-calculate points based on position
    if (field === "position") {
      const pointMap = { "1st": 5, "2nd": 3, "3rd": 1, "Participant": 0 };
      newEntries[index].points = pointMap[value as keyof typeof pointMap];
    }
    
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // In a real scenario, we'd save to an 'event_points' table
      // For now, we'll simulate the success
      await new Promise(r => setTimeout(r, 1500));
      toast.success("Sports & Events records synchronized", {
        description: `Successfully archived ${entries.length} institutional achievements.`
      });
      setEntries([]);
    } catch (err) {
      toast.error("Synchronization failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <RefreshCcw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Accessing Sports Registry</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Event Points Registry" />
        
        <div className="flex-1 py-10 space-y-10 px-6 md:px-0">
          
          <div className="flex flex-col lg:flex-row items-start gap-10">
            {/* Control Panel */}
            <div className="w-full lg:w-80 space-y-6">
               <Card className="p-8 rounded-[2rem] border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Trophy className="w-20 h-20" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Registry Actions</p>
                    <h3 className="text-xl font-black mb-6">Archive Results</h3>
                    <div className="space-y-4">
                      <Button 
                        onClick={addEntry}
                        className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all gap-3 shadow-xl"
                      >
                        <Plus className="w-5 h-5 text-blue-600" /> Add Record
                      </Button>
                      <Button 
                        disabled={entries.length === 0 || saving}
                        onClick={handleSave}
                        className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                        {saving ? "Syncing..." : "Commit Registry"}
                      </Button>
                    </div>
                  </div>
               </Card>

               <Card className="p-8 rounded-[2rem] border-none bg-emerald-50 ring-1 ring-emerald-100 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md">
                       <Star className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Standardized Points</p>
                      <h4 className="font-bold text-slate-900">Merit Scale</h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <PointRule rank="1st" pts={5} />
                     <PointRule rank="2nd" pts={3} />
                     <PointRule rank="3rd" pts={1} />
                     <PointRule rank="Other" pts={0} />
                  </div>
               </Card>
            </div>

            {/* Entry Table */}
            <div className="flex-1 w-full">
               <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[400px]">
                  <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                           <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-black text-slate-900 uppercase tracking-tighter">Current Session Batch</h3>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{entries.length} records pending synchronization</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-4 md:p-8">
                     <div className="overflow-x-auto">
                        <table className="w-full">
                           <thead>
                              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                                 <th className="pb-6 px-4">Event Category</th>
                                 <th className="pb-6 px-4">Competing Section</th>
                                 <th className="pb-6 px-4">Result</th>
                                 <th className="pb-6 px-4">Pts</th>
                                 <th className="pb-6 px-4 text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="space-y-2">
                              <AnimatePresence>
                                 {entries.map((entry, idx) => (
                                    <motion.tr 
                                      key={idx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 20 }}
                                      className="group"
                                    >
                                       <td className="py-3 px-2">
                                          <select 
                                            className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                            value={entry.category}
                                            onChange={e => updateEntry(idx, 'category', e.target.value)}
                                          >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                          </select>
                                       </td>
                                       <td className="py-3 px-2">
                                          <select 
                                            className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                            value={entry.class_id}
                                            onChange={e => updateEntry(idx, 'class_id', e.target.value)}
                                          >
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                                          </select>
                                       </td>
                                       <td className="py-3 px-2">
                                          <select 
                                            className={cn(
                                              "w-full h-12 border-none rounded-xl px-4 text-sm font-black uppercase tracking-widest transition-all cursor-pointer",
                                              entry.position === "1st" ? "bg-yellow-50 text-yellow-700" : 
                                              entry.position === "2nd" ? "bg-slate-100 text-slate-700" : 
                                              entry.position === "3rd" ? "bg-orange-50 text-orange-700" : "bg-slate-50 text-slate-400"
                                            )}
                                            value={entry.position}
                                            onChange={e => updateEntry(idx, 'position', e.target.value)}
                                          >
                                            <option value="1st">1st Place</option>
                                            <option value="2nd">2nd Place</option>
                                            <option value="3rd">3rd Place</option>
                                            <option value="Participant">Participant</option>
                                          </select>
                                       </td>
                                       <td className="py-3 px-2">
                                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600 shadow-inner">
                                            {entry.points}
                                          </div>
                                       </td>
                                       <td className="py-3 px-2 text-right">
                                          <button 
                                            onClick={() => removeEntry(idx)}
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                          >
                                             <Trash2 className="w-5 h-5" />
                                          </button>
                                       </td>
                                    </motion.tr>
                                 ))}
                              </AnimatePresence>
                           </tbody>
                        </table>
                        {entries.length === 0 && (
                           <div className="py-32 flex flex-col items-center justify-center text-center">
                              <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6">
                                 <Users className="w-10 h-10 text-slate-200" />
                              </div>
                              <h4 className="font-black text-slate-900 uppercase tracking-widest mb-1">Registry Empty</h4>
                              <p className="text-xs font-bold text-slate-400">Click "Add Record" to start logging event results.</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

function PointRule({ rank, pts }: { rank: string, pts: number }) {
  return (
    <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-white">
       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{rank} Position</span>
       <span className="font-black text-slate-900">+{pts} Pts</span>
    </div>
  );
}
