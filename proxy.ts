import { NextRequest, NextResponse } from "next/server";
import { verifyToken, verifyRefreshToken, signAccessToken } from "./lib/auth";
import { prisma } from "./lib/prisma";
import { hashToken } from "./lib/hash";

const SIGN_IN_URL = "/sign-in";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (accessToken) {
    const payload = await verifyToken(accessToken);

    if (payload) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-email", payload.email);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  }

  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return redirectToSignIn(req);
  }

  try {
    const refreshPayload = await verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      return redirectToSignIn(req);
    }

    const session = await prisma.session.findUnique({
      where: { token: hashToken(refreshToken) },
      select: { isRevoked: true, expiresAt: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return redirectToSignIn(req);
    }

    const newAccessToken = await signAccessToken(
      refreshPayload.userId,
      refreshPayload.email
    );

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", refreshPayload.userId);
    requestHeaders.set("x-user-email", refreshPayload.email);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    response.cookies.set("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60,
    });

    response.cookies.set("userEmail", refreshPayload.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;

  } catch {
    return redirectToSignIn(req);
  }
}

function redirectToSignIn(req: NextRequest) {
  const signInUrl = new URL(SIGN_IN_URL, req.url);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/interview/:path*",
    "/ai-cover-letter/:path*",
  ],
};