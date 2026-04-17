import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export function getCSPHeader() {
  const isDev = process.env.NODE_ENV === "development";
  
  const csp = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": ["'self'", "data:", "https://*.supabase.co", "https://i.pravatar.cc", "https://api.dicebear.com", "https://images.unsplash.com"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'", 
      "https://*.supabase.co", 
      "wss://*.supabase.co",
      "https://api.dicebear.com"
    ],
    "frame-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": []
  };

  return Object.entries(csp)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

export async function protectRoute(expectedRole?: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (expectedRole) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== expectedRole) {
      if (profile?.role === 'STUDENT') redirect("/student/dashboard");
      else if (profile?.role === 'PARENT') redirect("/parent/dashboard");
      else redirect("/dashboard");
    }
  }

  return user;
}
