import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";
import { hashToken } from "@/lib/hash";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await verifyRefreshToken(token);

  if (!payload) {
    return new Response("Invalid token", { status: 401 });
  }

  const hashed = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { token: hashed },
  });

  if (!session || session.isRevoked || session.expiresAt < new Date()) {
    return new Response("Session expired or invalid", { status: 401 });
  }

  const newAccess = await signAccessToken(payload.userId, payload.email);
  const newRefresh = await signRefreshToken(payload.userId, payload.email);
  const newHashed = hashToken(newRefresh);
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await prisma.$transaction([
      prisma.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      }),
      prisma.session.create({
        data: {
          userId: payload.userId,
          token: newHashed,
          expiresAt: newExpiresAt,
        },
      }),
    ]);
  } catch {
    return new Response("Session rotation failed", { status: 500 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("accessToken", newAccess, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });

  res.cookies.set("refreshToken", newRefresh, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60,
  });

  res.cookies.set("userEmail", payload.email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  return res;
}
