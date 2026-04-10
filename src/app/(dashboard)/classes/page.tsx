"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Search, Plus, MoreHorizontal, GraduationCap, Users, Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const classes = [
  { id: "1", name: "Computer Science 101", studentsCount: 45, schedule: "Mon, Wed, Fri", time: "10:00 AM" },
  { id: "2", name: "Physics 202", studentsCount: 38, schedule: "Tue, Thu", time: "01:00 PM" },
  { id: "3", name: "English Literature 303", studentsCount: 52, schedule: "Mon, Wed", time: "02:30 PM" },
  { id: "4", name: "Mathematics 404", studentsCount: 41, schedule: "Tue, Thu", time: "09:00 AM" },
];

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAction = (type: 'edit' | 'delete', cls: any) => {
    setSelectedClass(cls);
    if (type === 'edit') setIsEditOpen(true);
    if (type === 'delete') setIsDeleteOpen(true);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Classes" />
        
        <div className="flex-1 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search classes..." 
                className="pl-9 w-[300px] border-slate-200 shadow-sm rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger className="h-9 px-4 inline-flex items-center justify-center rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 transition-colors border border-blue-700 text-white text-sm font-medium cursor-pointer outline-none">
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
                <div className="p-6">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-xl">Create New Class</DialogTitle>
                    <DialogDescription>Setup a new course or subject for the semester.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Class Name</Label>
                      <Input placeholder="e.g. Adv. Mathematics" className="rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Schedule</Label>
                        <Input placeholder="e.g. Mon, Wed" className="rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Time Slot</Label>
                        <Input placeholder="e.g. 11:30 AM" className="rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0 flex justify-end gap-3">
                  <Button variant="ghost" className="rounded-xl" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button className="rounded-xl bg-slate-900 text-white" onClick={() => {
                     toast.success("New class created!");
                     setIsAddOpen(false);
                  }}>Create Class</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-all outline-none">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 bg-white border border-slate-200 shadow-xl">
                      <DropdownMenuItem onClick={() => handleAction('edit', cls)} className="rounded-lg flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Edit Class
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('delete', cls)} className="rounded-lg text-red-600 focus:text-red-700 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-1 relative z-10">{cls.name}</h3>
                
                <div className="flex flex-col gap-2 mt-6 relative z-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5"><Users className="w-4 h-4" /> Students</span>
                    <span className="font-medium text-slate-900">{cls.studentsCount}</span>
                  </div>
                  <div className="w-full h-px bg-slate-100 my-1" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Schedule</span>
                    <span className="font-medium text-slate-700 text-xs">{cls.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
                    <span className="font-medium text-slate-700 text-xs">{cls.time}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Edit/Delete Modals */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
               <div className="p-6">
                 <DialogHeader className="mb-6">
                   <DialogTitle className="text-xl">Edit Class Settings</DialogTitle>
                   <DialogDescription>Update configuration for {selectedClass?.name}.</DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4">
                   <div className="space-y-1.5">
                     <Label>Class Name</Label>
                     <Input defaultValue={selectedClass?.name} className="rounded-xl" />
                   </div>
                 </div>
               </div>
               <div className="p-6 pt-0 flex justify-end gap-3">
                 <Button variant="ghost" className="rounded-xl" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                 <Button className="rounded-xl bg-slate-900 text-white" onClick={() => {
                   toast.success("Class updated successfully");
                   setIsEditOpen(false);
                 }}>Save Changes</Button>
               </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
               <div className="p-6 text-center">
                 <DialogHeader>
                   <DialogTitle className="text-xl text-center">Delete Class?</DialogTitle>
                   <DialogDescription className="text-center">
                     All student connections and logs for <strong>{selectedClass?.name}</strong> will be lost.
                   </DialogDescription>
                 </DialogHeader>
               </div>
               <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                 <Button variant="outline" className="rounded-xl" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                 <Button className="rounded-xl bg-red-600 text-white" onClick={() => {
                    toast.error("Class deleted permanently");
                    setIsDeleteOpen(false);
                 }}>Yes, Delete</Button>
               </div>
            </DialogContent>
          </Dialog>

          {filteredClasses.length === 0 && (
            <div className="py-24 text-center text-slate-500">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No classes found</p>
              <p className="text-xs">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
