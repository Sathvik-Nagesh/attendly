"use client";

import { CheckCircle2, RefreshCcw, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface AttendanceSyncDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: () => void;
  isSaving: boolean;
  stats: {
    present: number;
    absent: number;
    od: number;
  };
  lecture: string;
  date: Date;
  sampleAbsentRoll?: string;
}

export function AttendanceSyncDialog({
  isOpen,
  onOpenChange,
  onSync,
  isSaving,
  stats,
  lecture,
  date,
  sampleAbsentRoll
}: AttendanceSyncDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger render={
        <Button className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2 border-none active:scale-95">
          <CheckCircle2 className="w-5 h-5" />
          Finalize Sync
        </Button>
      } />
      <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
        <div className="p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black tracking-tight">Confirm Sync</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-base mt-2">
              Review attendance for <strong>{lecture}</strong> before pushing to MSG91 gateway.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 text-center">
                <div className="text-3xl font-black text-emerald-700">{stats.present}</div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mt-1">Present</div>
              </div>
              <div className="p-5 rounded-[2rem] bg-red-50 border-2 border-red-100 text-center">
                <div className="text-3xl font-black text-red-700">{stats.absent}</div>
                <div className="text-[10px] font-black text-red-600 uppercase tracking-wider mt-1">Absent</div>
              </div>
              <div className="p-5 rounded-[2rem] bg-blue-50 border-2 border-blue-100 text-center">
                <div className="text-3xl font-black text-blue-700">{stats.od}</div>
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider mt-1">OD</div>
              </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900">Cloud SMS Broadcast</p>
                  <p className="text-sm font-bold text-slate-400">{stats.absent} parents will be notified</p>
                </div>
              </div>
              <div className="pt-4 border-t-2 border-slate-200/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Broadcast Preview</p>
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-xs font-bold text-slate-600 italic leading-relaxed shadow-sm">
                  "Attendex Notice: Student (Reg No. {sampleAbsentRoll || '...'}) was ABSENT for Lect. {lecture.replace('L', '')} on {format(date, 'MMM d')}. Please acknowledge."
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 pt-0 flex flex-col gap-4">
          <Button
            onClick={onSync}
            disabled={isSaving}
            className="h-16 w-full rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 active:scale-95"
          >
            {isSaving ? (
              <>
                <RefreshCcw className="w-6 h-6 animate-spin" />
                Pushing to Cloud...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                Execute Sync
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="h-12 w-full rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors"
            onClick={() => onOpenChange(false)}
          >
            Cancel Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
