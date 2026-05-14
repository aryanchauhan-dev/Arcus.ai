import { prisma } from "@/lib/prisma";
import { signinBackendSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { hashToken } from "@/lib/hash";
import { signinLimiter, ipLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const DUMMY_HASH =
  "$2a$12$dummy.hash.to.prevent.timing.attacks.on.user.enumeration";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const ipCheck = await ipLimiter.limit(ip);
  if (!ipCheck.success) {
    return new Response("Too many attempts", { status: 429 });
  }

  const body = await req.json();
  const parsed = signinBackendSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid input", { status: 400 });
  }

  const { email, password } = parsed.data;

  const emailCheck = await signinLimiter.limit(`${ip}-${email}`);
  if (!emailCheck.success) {
    return new Response("Too many attempts", { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });

  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    return new Response("Invalid credentials", { status: 401 });
  }

  const accessToken = await signAccessToken(user.id, user.email);
  const refreshToken = await signRefreshToken(user.id, user.email);

  try {
    await prisma.session.create({
      data: {
        userId: user.id,
        token: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } catch {
    return new Response("Failed to create session", { status: 500 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });

  res.cookies.set("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60,
  });

  res.cookies.set("userEmail", user.email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  return res;
}