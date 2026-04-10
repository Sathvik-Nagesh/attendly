"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Search, Plus, MoreHorizontal, UploadCloud, FileSpreadsheet, UserRoundPen, History, Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fuzzySearch, cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

const students = [
  { id: "1", name: "Alena Smith", roll: "CS-01", email: "alena@example.com", class: "Computer Science 101", attendance: "98%" },
  { id: "2", name: "Brandon Cooper", roll: "CS-02", email: "brandon@example.com", class: "Computer Science 101", attendance: "85%" },
  { id: "3", name: "Cynthia Davis", roll: "CS-03", email: "cynthia@example.com", class: "Computer Science 101", attendance: "92%" },
];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredStudents = students.filter(s => 
    fuzzySearch(search, `${s.name} ${s.roll} ${s.email}`)
  );

  const [importStatus, setImportStatus] = useState<'idle' | 'reading' | 'mapping' | 'success'>('idle');
  const [importProgress, setImportProgress] = useState(0);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    setImportStatus('reading');
    setImportProgress(20);
    
    setTimeout(() => {
      setImportStatus('mapping');
      setImportProgress(65);
    }, 1200);

    setTimeout(() => {
      setImportStatus('success');
      setImportProgress(100);
      toast.success("Import successful!", { 
        description: `Successfully imported 142 students from ${e.target.files?.[0].name}.`
      });
      setTimeout(() => {
        setIsUploading(false);
        setIsImportOpen(false);
        setImportStatus('idle');
        setImportProgress(0);
      }, 500);
    }, 2800);
  };

  const handleAction = (type: 'edit' | 'history' | 'delete', student: any) => {
    setSelectedStudent(student);
    if (type === 'edit') setIsEditOpen(true);
    if (type === 'history') setIsHistoryOpen(true);
    if (type === 'delete') setIsDeleteOpen(true);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Students" />
        
        <div className="flex-1 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search students..." 
                className="pl-9 w-[300px] border-slate-200 shadow-sm rounded-xl bg-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger className="h-9 px-4 inline-flex items-center justify-center rounded-xl shadow-sm bg-white hover:bg-slate-50 transition-colors border border-slate-200 text-slate-700 text-sm font-medium cursor-pointer outline-none">
                  <UploadCloud className="w-4 h-4 mr-2 text-slate-500" />
                  Import CSV
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden bg-white text-slate-900 border border-slate-200">
                  <div className="p-6">
                    <motion.div
                      key={importStatus}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl">Import Students</DialogTitle>
                        <DialogDescription>
                          Upload your CSV or Excel file to quickly import your roster.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {importStatus === 'idle' ? (
                        <label className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors group">
                          <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleImport} />
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="w-6 h-6 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
                          <p className="text-xs text-slate-500">CSV, XLS, XLSX (Max 10MB)</p>
                        </label>
                      ) : (
                        <div className="py-10 text-center space-y-6">
                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden max-w-[200px] mx-auto">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${importProgress}%` }}
                                className="h-full bg-blue-600 rounded-full"
                              />
                           </div>
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-slate-900">
                                {importStatus === 'reading' && 'Reading File Data...'}
                                {importStatus === 'mapping' && 'Mapping Roll Numbers...'}
                                {importStatus === 'success' && 'Ready!'}
                              </p>
                              <p className="text-xs text-slate-400">Please do not refresh the page</p>
                           </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <div className="p-6 pt-0 flex justify-end gap-3 outline-none">
                    <Button variant="ghost" className="rounded-xl font-semibold" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                    <Button disabled={isUploading || importStatus === 'idle'} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 px-6 font-bold">
                      {isUploading ? "Processing..." : "Finish Import"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger className="h-9 px-4 inline-flex items-center justify-center rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 transition-colors border border-blue-700 text-white text-sm font-medium cursor-pointer outline-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
                  <div className="p-6">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-xl">Add New Student</DialogTitle>
                      <DialogDescription>Enter the personal and academic details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <Label>Full Name</Label>
                        <Input placeholder="e.g. John Doe" className="rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Roll Number</Label>
                        <Input placeholder="e.g. CS-42" className="rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Batch</Label>
                        <Input placeholder="e.g. A" className="rounded-xl" />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label>Parent Email</Label>
                        <Input type="email" placeholder="parent@example.com" className="rounded-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex justify-end gap-3">
                    <Button variant="ghost" className="rounded-xl" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button className="rounded-xl bg-slate-900 text-white" onClick={() => {
                       toast.success("Student added!");
                       setIsAddOpen(false);
                    }}>Save Student</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500 bg-slate-50/50 border-b border-slate-100 font-medium">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4 text-right">Attendance</th>
                    <th className="px-6 py-4 w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{st.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{st.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{st.roll}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          {st.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-slate-900">{st.attendance}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all outline-none">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 bg-white border border-slate-200 shadow-xl">
                            <DropdownMenuItem onClick={() => handleAction('edit', st)} className="rounded-lg flex items-center gap-2">
                              <UserRoundPen className="w-4 h-4 text-slate-400" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('history', st)} className="rounded-lg flex items-center gap-2">
                              <History className="w-4 h-4 text-slate-400" /> View History
                            </DropdownMenuItem>
                            <div className="h-px bg-slate-100 my-1" />
                            <DropdownMenuItem onClick={() => handleAction('delete', st)} className="rounded-lg text-red-600 focus:text-red-700 flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Edit Student Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl">Edit Student Profile</DialogTitle>
                <DialogDescription>Update details for {selectedStudent?.name}.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={selectedStudent?.name} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Roll Number</Label>
                  <Input defaultValue={selectedStudent?.roll} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Input defaultValue="Active" className="rounded-xl" />
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button className="rounded-xl bg-slate-900 text-white" onClick={() => {
                 toast.success("Profile updated");
                 setIsEditOpen(false);
              }}>Update Profile</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View History Modal */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl">Attendance History</DialogTitle>
                <DialogDescription>Detailed records for {selectedStudent?.name}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm font-semibold">Total Classes</div>
                  <div className="text-sm font-bold text-blue-600">45</div>
                </div>
                
                <div className="space-y-2">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-sm font-medium">Lecture {i} - CS101</span>
                       </div>
                       <span className="text-xs text-slate-400">Oct {10+i}, 2023</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end">
              <Button className="rounded-xl" onClick={() => setIsHistoryOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl text-center">Delete Student?</DialogTitle>
                <DialogDescription className="text-center">
                  This action cannot be undone. All attendance data for <strong>{selectedStudent?.name}</strong> will be removed.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 pt-0 grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button className="rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={() => {
                 toast.error("Student deleted from database");
                 setIsDeleteOpen(false);
              }}>Yes, Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
