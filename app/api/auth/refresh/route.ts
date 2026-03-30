import { prisma } from "@/lib/prisma";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/auth";
import { hashToken } from "@/lib/hash";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (!token) return new Response("Unauthorized", { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return new Response("Invalid token", { status: 401 });

  const hashed = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { token: hashed },
  });

  if (!session || session.isRevoked) {
    return new Response("Session invalid", { status: 401 });
  }

  // 🔄 ROTATION
  await prisma.session.update({
    where: { id: session.id },
    data: { isRevoked: true },
  });

  const newAccess = await signAccessToken(payload.userId);
  const newRefresh = await signRefreshToken(payload.userId);

  await prisma.session.create({
    data: {
      userId: payload.userId,
      token: hashToken(newRefresh),
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  const res = NextResponse.json({ success: true });

  res.cookies.set("accessToken", newAccess, { httpOnly: true, maxAge: 900 });
  res.cookies.set("refreshToken", newRefresh, { httpOnly: true, maxAge: 7 * 86400 });

  return res;
}