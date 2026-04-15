"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UploadCloud, ShieldCheck } from "lucide-react";
import { PasskeyCard } from "@/components/auth/passkey-card";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Jenkins",
    email: "alex.jenkins@college.edu",
    phone: "+1 (555) 019-2038",
    teacherId: "4192",
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully!");
    }, 800);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Settings" />
        
        <div className="flex-1 py-8 max-w-4xl space-y-8">
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Profile Configuration</h2>
            <p className="text-sm text-slate-500">Update your personal details and teacher identification.</p>
          </div>

          <Card className="p-8 border-slate-200 shadow-sm rounded-2xl bg-white">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-white shadow-md rounded-full">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" />
                  <AvatarFallback className="text-3xl">AJ</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full shadow-sm text-xs font-medium">
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Form Section */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="rounded-xl h-11 border-slate-200 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId" className="text-sm font-medium text-slate-700">Teacher ID</Label>
                    <Input 
                      id="teacherId" 
                      value={profile.teacherId}
                      readOnly
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 text-slate-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 focus-visible:ring-blue-500 shadow-sm"
                  />
                  <p className="text-xs text-slate-500 max-w-[400px]">This email is used for system notifications and cannot be unlinked from your institution without admin approval.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Recovery Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 focus-visible:ring-blue-500 shadow-sm w-full md:w-[60%]"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="rounded-xl px-8 h-11 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                  >
                    {isSaving ? "Saving details..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-1 mt-12">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security & Sovereignty</h2>
            <p className="text-sm text-slate-500">Enable advanced authentication and hardware-level identity binding.</p>
          </div>

          <PasskeyCard />
        </div>
      </div>
    </PageTransition>
  );
}
