/**
 * Attendex — Terms and Conditions
 */

import Link from "next/link";
import { ArrowLeft, Scale, FileText, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Terms and Conditions</h1>
          <p className="text-slate-500 font-medium italic">Last updated: April 13, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <UserCheck className="w-8 h-8" />
              <h2 className="text-2xl font-bold text-slate-900 m-0">1. Acceptance of Terms</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using Attendex, you agree to be bound by these Terms and Conditions. These terms apply to all faculty members, students, and parents who use our platform.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <Scale className="w-8 h-8" />
              <h2 className="text-2xl font-bold text-slate-900 m-0">2. Institutional Responsibility</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Educational institutions are responsible for ensuring they have the legal right from students and parents to upload their data to Attendex. The accuracy of attendance records is the sole responsibility of the marking faculty member.
            </p>
          </section>

          <Card className="p-6 bg-amber-50 border-amber-100 rounded-3xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Important Notice</h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                Attendex provides automated notifications as a courtesy service. We are not liable for any technical failures that prevent an SMS or notification from being delivered.
              </p>
            </div>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <FileText className="w-8 h-8" />
              <h2 className="text-2xl font-bold text-slate-900 m-0">3. Usage Restrictions</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Users may not attempt to reverse engineer the platform, bypass security measures, or use the automated notification system for non-educational purposes or spam. Any unauthorized access attempts will be logged and reported.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">4. Modifications</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Significant changes will be notified via the platform dashboard.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-400 font-medium">© 2026 Attendex Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

