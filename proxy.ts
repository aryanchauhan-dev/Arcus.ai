import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth"; // jose-based verify

// 🔒 Protected routes list
const protectedRoutes = [
  "/dashboard",
  "/resume-builder",
  "/interview",
  "/ai-cover-letter",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔍 Check if route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 👉 Public route → allow
  if (!isProtected) {
    return NextResponse.next();
  }

  // 🍪 Get access token from cookie
  const token = req.cookies.get("accessToken")?.value;

  // ❌ No token → redirect
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 🔐 Verify token (IMPORTANT: async)
  const payload = await verifyToken(token);

  // ❌ Invalid/expired token → redirect
  if (!payload) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 🧠 Attach user info to headers (for downstream use)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);

  // ✅ Allow request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// 🎯 Apply middleware only on these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume-builder/:path*",
    "/interview/:path*",
    "/ai-cover-letter/:path*",
  ],
};