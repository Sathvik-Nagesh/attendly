/**
 * Attendex — Privacy Policy
 */

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-medium italic">Last updated: April 13, 2026</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">Data Encryption</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              All passwords are encrypted using industry-standard salted hashing (bcrypt) before ever reaching our database.
            </p>
          </Card>
          <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">Limited Access</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Student data is only visible to authorized faculty and their respective parents. We never sell your data to third parties.
            </p>
          </Card>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-500" />
              1. Information We Collect
            </h2>
            <p className="text-slate-600 leading-relaxed">
              To provide our attendance management services, we collect basic educational information including student names, roll numbers, class identifiers, and parent contact information (phone/email) as provided by the educational institution.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              2. How We Use It
            </h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>To record and track daily class attendance.</li>
              <li>To calculate academic performance and internal marks.</li>
              <li>To send automated notifications to parents regarding student absence.</li>
              <li>To generate academic reports for college administration.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">3. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, please contact your institution's administrator or email us at <span className="font-bold text-blue-600">privacy@Attendex.edu</span>.
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

