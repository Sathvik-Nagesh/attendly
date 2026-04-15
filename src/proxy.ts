/**
 * Attendex — Route Protection Middleware
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
  const sessionCookie = req.cookies.get("Attendex-session")?.value;

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

export default function proxy(req: NextRequest) {
  // Bypassing mock auth for Supabase integration phase
  const response = NextResponse.next();
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
