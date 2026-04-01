import { prisma } from "@/lib/prisma";
import { signupBackendSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { hashToken } from "@/lib/hash";
import { signupLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  // 🚧 Rate limit
  const { success } = await signupLimiter.limit(ip);
  if (!success) return new Response("Too many requests", { status: 429 });

  const body = await req.json();
  const parsed = signupBackendSchema.safeParse(body);

  if (!parsed.success) {
    console.log(parsed.error);
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "User exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash: hashed },
  });

  // 🔑 tokens
  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);

  // 🔥 store refresh token
  await prisma.session.create({
    data: {
      userId: user.id,
      token: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  const res = NextResponse.json({ success: true });

  // 🔥 FIXED: match login route
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 15,
  });

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 86400,
  });

  return res;
}