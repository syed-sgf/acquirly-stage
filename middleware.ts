import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  if (url.pathname.startsWith("/pro")) {
    const plan = req.cookies.get("plan")?.value || "core";
    if (plan !== "pro") { url.pathname="/pricing"; url.searchParams.set("plan","proRequired"); return NextResponse.redirect(url); }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/pro/:path*"] };
