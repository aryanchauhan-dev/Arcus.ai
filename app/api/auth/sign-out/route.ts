import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/hash";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { token: hashToken(token) },
    });
  }

  const res = NextResponse.json({ success: true });

  // 🧹 clear cookies
  res.cookies.set("accessToken", "", { expires: new Date(0) });
  res.cookies.set("refreshToken", "", { expires: new Date(0) });

  return res;
}