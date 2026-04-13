"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Zap, 
  Shield, 
  Smartphone, 
  ArrowRight, 
  LayoutDashboard, 
  Database,
  Lock,
  Globe,
  Users,
  BarChart3,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            Attendly
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Features</a>
            <a href="#security" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Security</a>
            <a href="#reporting" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Reporting</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-20 px-6 max-w-7xl mx-auto text-center flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm animate-in fade-in zoom-in duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            The Standard for Modern Education
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-[1000] text-slate-900 tracking-tighter leading-[0.95] mb-10">
            Precision Logistics. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Zero Fricition.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-14 max-w-2xl mx-auto leading-relaxed font-bold">
            Ditch the register. Automate notifications, generate one-click administration reports, and tracking performance with industrial precision.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-[2rem] h-16 md:h-18 px-12 text-lg font-black uppercase tracking-widest bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 group border-none">
                Get Started
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-[2rem] h-16 md:h-18 px-12 text-lg font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-100">
                View Specs
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Dashboard Preview Image */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 relative mx-auto max-w-6xl px-4 perspective-1000"
        >
          <div className="p-1.5 md:p-4 bg-white/40 backdrop-blur-md rounded-[2.5rem] md:rounded-[4rem] border border-white/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden relative group transition-all duration-700 hover:shadow-[0_80px_150px_-30px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />
            
            <img 
              src="/hero-preview.png" 
              alt="Attendly Dashboard Preview" 
              className="w-full h-auto rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-slate-100/50 transition-all duration-1000 group-hover:scale-[1.01]"
            />
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
          
          {/* Floating Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        </motion.div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Built for Academic Excellence</h2>
            <p className="text-slate-500 text-lg font-medium">We've engineered every feature to save hours for professors and administration alike.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap}
              title="Hyper-Fast Entry"
              description="Record absent numbers in seconds. Our intelligent autocomplete and batch-select speeds up taking attendance by 80%."
            />
            <FeatureCard 
              icon={Smartphone}
              title="Smart SMS Bridge"
              description="Direct integration with premium SMS gateways. Parents are notified instantly of absence via SMS, WhatsApp, or Email."
            />
            <FeatureCard 
              icon={BarChart3}
              title="One-Click PDF Reports"
              description="Instantly generate Defaulter Lists (below 75%) or Semester-end reports in professionally formatted PDF or Excel sheets."
            />
            <FeatureCard 
              icon={Users}
              title="Parent & Student Portals"
              description="Dedicated interfaces for students to track their progress and parents to stay informed about their child's academic risk."
            />
            <FeatureCard 
              icon={Globe}
              title="Multi-Tenant Ready"
              description="Designed to serve multiple institutions or departments with strictly isolated data and custom branding."
            />
            <FeatureCard 
              icon={LayoutDashboard}
              title="Premium OS Interface"
              description="A clean, calm, and responsive interface inspired by modern operating systems. Works beautifully on mobiles and tablets."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest">
                    Enterprise Security
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                    Your Data. <br />
                    Military-Grade <br />
                    <span className="text-blue-500">Security.</span>
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    We take student privacy and data integrity seriously. Attendly implements multiple layers of protection to ensure your institution's data remains safe.
                  </p>
                  
                  <div className="space-y-4 pt-4">
                    <SecurityFeature icon={Lock} title="Password Encryption" desc="All credentials are encrypted with Bcrypt salted hashing." />
                    <SecurityFeature icon={Shield} title="XSS Protection" desc="Every input is sanitized via DOMPurify to prevent script injection." />
                    <SecurityFeature icon={CheckCircle} title="CSRF & CSP Headers" desc="Sophisticated network protection for every single request." />
                  </div>
               </div>
               
               <div className="relative">
                  <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl rounded-[3rem] shadow-2xl relative z-10">
                     <pre className="text-blue-300 text-xs font-mono leading-relaxed overflow-x-auto">
{`const securityConfig = {
  encryption: "Bcrypt (12 Rounds)",
  sanitization: "DOMPurify Active",
  headers: {
    "Content-Security-Policy": "Active",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "DENY"
  },
  multiTenant: "Data Sharding Enabled"
};

// All inputs are validated at entry
// Output always escaped by React
// Zero unprotected routes`}
                     </pre>
                  </Card>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full" />
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              Attendly
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Modernizing educational administration with intelligent attendance and academic tracking systems.
            </p>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                  <Mail className="w-5 h-5" />
               </div>
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                  <Globe className="w-5 h-5" />
               </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#security" className="hover:text-blue-600 transition-colors">Security Audit</a></li>
              <li><a href="#reporting" className="hover:text-blue-600 transition-colors">Report Gen</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Contact</h4>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Suite 402, Block B <br />
              Global Tech Park <br />
              Bangalore, India
            </p>
            <p className="text-blue-600 font-bold text-sm">support@attendly.edu</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              © 2026 Attendly Systems Private Limited.
           </p>
           <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> SSL SECURE</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> GDPR COMPLIANT</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 mb-8 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  )
}

function SecurityFeature({ icon: Icon, title, desc }: any) {
   return (
      <div className="flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
         </div>
         <div>
            <h4 className="font-bold text-white text-sm">{title}</h4>
            <p className="text-xs text-slate-500 mt-1">{desc}</p>
         </div>
      </div>
   )
}
