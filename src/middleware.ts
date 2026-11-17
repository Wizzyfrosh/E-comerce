/**
 * Next.js middleware — runs on matched routes before rendering.
 * Delegates session refresh + auth protection to updateSession().
 *
 * Role-based access (admin vs user) is intentionally NOT checked here —
 * the /admin page performs the role check server-side.
 */
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
