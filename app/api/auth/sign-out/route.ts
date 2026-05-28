import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/hash";
import { NextResponse } from "next/server";

const CLEAR_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  expires: new Date(0),
};

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (token) {
    try {

      await prisma.session.deleteMany({
        where: { token: hashToken(token) },
      });
    } catch {
      console.error("Failed to delete session")
    }
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("accessToken", "", CLEAR_COOKIE_OPTIONS);
  res.cookies.set("refreshToken", "", CLEAR_COOKIE_OPTIONS);

  res.cookies.set("userEmail", "", {
    ...CLEAR_COOKIE_OPTIONS,
    httpOnly: false,
  });

  return res;
}