import { prisma } from "@/lib/prisma";
import { signinBackendSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { hashToken } from "@/lib/hash";
import { signinLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const body = await req.json();

  const parsed = signinBackendSchema.safeParse(body);
  if (!parsed.success) return new Response("Invalid input", { status: 400 });

  const { email, password } = parsed.data;

  // 🚧 Rate limit (IP + email)
  const key = `${ip}-${email}`;
  const { success } = await signinLimiter.limit(key);
  if (!success) return new Response("Too many attempts", { status: 429 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response("Invalid credentials", { status: 401 });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return new Response("Invalid credentials", { status: 401 });

  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);

  // 🔄 rotation → new session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  const res = NextResponse.json({ success: true });

  res.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 900 });
  res.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 86400 });

  return res;
}