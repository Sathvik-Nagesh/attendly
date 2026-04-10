"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Shield, Smartphone, ArrowRight, LayoutDashboard, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            Attendly
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-transform hover:scale-105 active:scale-95">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Attendly is now available for Colleges
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Ditch the offline book. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Automate SMS to Parents.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Attendly is the fastest way for college professors to mark attendance. Built for speed, precision, and automated notifications to keep parents informed effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="rounded-full h-14 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Dashboard Preview Image/Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="aspect-[16/9] bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col relative">
            {/* Mock Header */}
            <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            {/* Mock Content */}
            <div className="flex-1 bg-slate-50/50 p-6 flex gap-6">
              <div className="w-48 bg-white rounded-xl border border-slate-100" />
              <div className="flex-1 flex flex-col gap-6">
                <div className="h-24 bg-white rounded-xl border border-slate-100" />
                <div className="flex-1 bg-white rounded-xl border border-slate-100 flex items-center justify-center">
                  <span className="text-slate-300 font-medium text-lg">Interactive Dashboard Preview</span>
                </div>
              </div>
            </div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why upgrade from offline books?</h2>
            <p className="text-slate-600 text-lg">We studied exactly how teachers take attendance and engineered a completely frictionless digital workflow for it.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap}
              title="Fast Entry Mode"
              description="Type a comma-separated list of absent roll numbers. We auto-mark the rest as present in milliseconds."
            />
            <FeatureCard 
              icon={Smartphone}
              title="Automated SMS"
              description="As soon as you hit save, parents of absent students get a text via MSG91 infrastructure instantly."
            />
            <FeatureCard 
              icon={Database}
              title="Bulk CSV Import"
              description="Upload your existing student roster via Excel/CSV. Ready to go for the semester in under 5 minutes."
            />
            <FeatureCard 
              icon={Shield}
              title="Audit Proof Logs"
              description="Never lose an attendance record again. Complete historical timeline view of all changes and sent messages."
            />
            <FeatureCard 
              icon={CheckCircle}
              title="Offline Resilience"
              description="Mark attendance even with spotty internet in the classroom. Syncs beautifully when connection restores."
            />
            <FeatureCard 
              icon={LayoutDashboard}
              title="Premium Interface"
              description="A calm, beautifully structured interface that feels like a modern SaaS, not a bloated university portal."
            />
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Ready to streamline your classroom?</h2>
        <Link href="/login">
          <Button size="lg" className="rounded-full h-14 px-10 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-transform hover:scale-105">
            Log in to Dashboard
          </Button>
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/50 transition-colors">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}
