import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { hashToken } from "@/lib/hash";
import { signupLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  // 🚧 Rate limit (pehle hi block karo)
  const { success } = await signupLimiter.limit(ip);
  if (!success) return new Response("Too many requests", { status: 429 });

  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  // 🔍 check user
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "User exists" }, { status: 400 });

  // 🔐 hash password
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash: hashed },
  });

  // 🔑 tokens
  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);

  // 🔥 store hashed refresh token
  await prisma.session.create({
    data: {
      userId: user.id,
      token: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const res = NextResponse.json({ success: true });

  res.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 900 });
  res.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 86400 });

  return res;
}