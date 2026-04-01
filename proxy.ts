import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/resume-builder",
  "/interview",
  "/ai-cover-letter",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const payload = await verifyToken(accessToken);

  // 🔥 REFRESH LOGIC
  if (!payload) {

    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    try {
      const refreshRes = await fetch(new URL("/api/auth/refresh", req.url), {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });

      if (!refreshRes.ok) {
        throw new Error("Refresh failed");
      }

      const response = NextResponse.next();

      const setCookie = refreshRes.headers.get("set-cookie");
      if (setCookie) {
        response.headers.set("set-cookie", setCookie);
      }

      return response;

    } catch (err) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume-builder/:path*",
    "/interview/:path*",
    "/ai-cover-letter/:path*",
  ],
};