  /**
 * Attendly — Production Security Perimeter
 * Enforces rate limiting on sensitive gateways and handles security headers.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCSPHeader } from "@/lib/middleware-utils";

// In-memory request tracking (for trial-run dev server)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT_THRESHOLD = 20; // Max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

export default function proxy(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "anonymous";
  const path = req.nextUrl.pathname;

  // 1. Target sensitive auth pathways for rate-limiting
  const sensitivePaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
  
  if (sensitivePaths.some(p => path.startsWith(p))) {
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    // Reset window if expired
    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
      rateData.count = 0;
      rateData.lastReset = now;
    }

    rateData.count++;
    rateLimitMap.set(ip, rateData);

    if (rateData.count > RATE_LIMIT_THRESHOLD) {
      console.warn(`[SECURITY] Throttling ${ip} on route ${path} - Rate limit exceeded.`);
      return new NextResponse("Institutional Security: Too many attempts. Please wait 60 seconds.", { status: 429 });
    }
  }

  // 2. Apply Security Headers
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", getCSPHeader());
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
