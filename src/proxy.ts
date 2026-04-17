import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getCSPHeader } from "@/lib/middleware-utils";

export default async function proxy(request: NextRequest) {

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Refresh session (CRITICAL)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Security Headers (CSP, Frame Options, etc.)
  supabaseResponse.headers.set("Content-Security-Policy", getCSPHeader());
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 3. Auth Guard & Routing
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup" || request.nextUrl.pathname === "/forgot-password";
  const isPublicPage = request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/privacy" || request.nextUrl.pathname === "/terms";

  if (!user && !isAuthPage && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "TEACHER";
    
    if (role === "STUDENT") url.pathname = "/student/dashboard";
    else if (role === "PARENT") url.pathname = "/parent/dashboard";
    else url.pathname = "/dashboard";
    
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - icons (PWA icons)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
