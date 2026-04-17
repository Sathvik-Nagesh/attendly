import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getCSPHeader } from "@/lib/middleware-utils";

export default async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Auth Guard
  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard") || 
                      path.startsWith("/student") || 
                      path.startsWith("/parent") ||
                      path.startsWith("/attendance") ||
                      path.startsWith("/settings") ||
                      path.startsWith("/pulse") ||
                      path.startsWith("/students") ||
                      path.startsWith("/classes") ||
                      path.startsWith("/subjects");

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Security headers (Existing logic)
  response.headers.set("Content-Security-Policy", getCSPHeader());
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)"],
};
