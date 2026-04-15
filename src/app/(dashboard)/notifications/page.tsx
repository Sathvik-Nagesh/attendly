"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Clock, GraduationCap, FileText, Bell, Send, RefreshCcw, Layout, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { academicService } from "@/services/academic";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await academicService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      toast.error("Failed to sync notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleBroadcast = async () => {
    if (!newTitle || !newMessage) return toast.error("Notification content required");
    
    setIsBroadcasting(true);
    try {
        await academicService.broadcastNotification({
            title: newTitle,
            message: newMessage,
            type: 'broadcast'
        });
        toast.success("Institutional Broadcast Dispatched", {
            description: "Notification has been pushed to all active stakeholders."
        });
        setNewTitle("");
        setNewMessage("");
        loadNotifications();
    } catch (err) {
        toast.error("Broadcast failed");
    } finally {
        setIsBroadcasting(false);
    }
  };

  if (loading) return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
          <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Broadcast Logs</p>
      </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20">
        <Header title="Notification Hub & Logs" />
        
        <div className="flex-1 py-10 max-w-5xl mx-auto px-6 space-y-12">
          {/* Institutional Broadcaster */}
          <Card className="p-10 border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white border border-slate-100 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-10 opacity-5">
                 <Send className="w-32 h-32 text-blue-900" />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                         <Plus className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Emergency Broadcast</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Cloud Dispatcher</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert Title</label>
                             <Input 
                                placeholder="e.g., Trial Period Extended" 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus-visible:ring-blue-600 transition-all" 
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                             <Input 
                                placeholder="Detail the institutional notice here..." 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="h-20 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus-visible:ring-blue-600 transition-all" 
                             />
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                        <Button 
                            onClick={handleBroadcast}
                            disabled={isBroadcasting}
                            className="h-20 w-full rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isBroadcasting ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                            Execute Broadcast
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-tighter">
                            Authorized personnel only • SMS Relay Active
                        </p>
                    </div>
                </div>
             </div>
          </Card>

          {/* Live Log Feed */}
          <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-4 h-4 text-blue-600" />
                       Broadcast History
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400">
                       {notifications.length} Logs Tracked
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                      {notifications.map((notif, idx) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="p-8 border-slate-100 shadow-sm rounded-[2.5rem] bg-white group hover:border-blue-200 transition-all flex flex-col md:flex-row items-center gap-8">
                                <div className={cn(
                                    "w-16 h-16 rounded-[2rem] flex items-center justify-center shrink-0 border shadow-inner transition-colors",
                                    notif.type === 'broadcast' ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-400"
                                )}>
                                    {notif.type === 'broadcast' ? <Bell className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                                </div>
                                
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">{notif.title}</h4>
                                    <p className="text-sm text-slate-500 font-bold leading-relaxed">{notif.message || notif.description}</p>
                                </div>

                                <div className="text-center md:text-right shrink-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dispatched On</p>
                                    <p className="text-sm font-black text-slate-900">{new Date(notif.created_at || notif.timestamp).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Status: Delivered</p>
                                </div>
                            </Card>
                        </motion.div>
                      ))}
                  </AnimatePresence>

                  {notifications.length === 0 && (
                    <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                      <Layout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active broadcasts in trial logs</p>
                    </div>
                  )}
              </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
