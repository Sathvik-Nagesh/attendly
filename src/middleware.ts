/**
 * Attendly — Route Protection Middleware
 * 
 * Enforces authentication and role-based access control.
 * Currently uses a cookie-based stub; swap for NextAuth.js session check.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PUBLIC_ROUTES, ROLE_ROUTE_MAP } from "@/lib/constants";
import type { Role } from "@/types";
import { getCSPHeader } from "@/lib/middleware-utils";

/**
 * Extract user session from the request.
 * STUB: Replace with NextAuth getToken() or custom JWT verification.
 */
function getSessionFromRequest(req: NextRequest): { role: Role; orgId: string } | null {
  const sessionCookie = req.cookies.get("attendly-session")?.value;

  if (!sessionCookie) return null;

  try {
    // In production, this would decrypt a JWT or call NextAuth
    const parsed = JSON.parse(sessionCookie);
    if (parsed.role && parsed.orgId) {
      return { role: parsed.role as Role, orgId: parsed.orgId };
    }
    return null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", getCSPHeader());
    return response;
  }

  // 2. Allow static assets and API health
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw.js") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // 3. Check session
  const session = getSessionFromRequest(req);

  if (!session) {
    // Not logged in → redirect to login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based route enforcement
  const allowedRoutes = ROLE_ROUTE_MAP[session.role];
  if (allowedRoutes) {
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));
    if (!isAllowed) {
      // User doesn't have permission → redirect to their home
      const homeRoute = allowedRoutes[0] || "/";
      return NextResponse.redirect(new URL(homeRoute, req.url));
    }
  }

  // 5. Inject org context via header (accessible in Server Components)
  const response = NextResponse.next();
  response.headers.set("x-organization-id", session.orgId);
  response.headers.set("x-user-role", session.role);
  response.headers.set("Content-Security-Policy", getCSPHeader());

  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
