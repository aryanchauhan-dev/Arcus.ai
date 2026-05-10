import { prisma } from "@/lib/prisma";
import { signupBackendSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { hashToken } from "@/lib/hash";
import { signupLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const { success } = await signupLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = signupBackendSchema.safeParse(body);

  if (!parsed.success) {
    if (process.env.NODE_ENV === "development") {
      console.log("[sign-up] validation error:", parsed.error.flatten());
    }
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const hashed = await bcrypt.hash(password, 12);

  let user: { id: string; email: string };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const exists = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (exists) return null;

      const newUser = await tx.user.create({
        data: { name, email, passwordHash: hashed },
        select: { id: true, email: true },
      });

      const accessToken = await signAccessToken(newUser.id, newUser.email);
      const refreshToken = await signRefreshToken(newUser.id, newUser.email);

      await tx.session.create({
        data: {
          userId: newUser.id,
          token: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return { newUser, accessToken, refreshToken };
    });

    if (!result) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    user = result.newUser;

    const res = NextResponse.json({ success: true });

    res.cookies.set("accessToken", result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60,
    });

    res.cookies.set("refreshToken", result.refreshToken, {
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
  } catch {
    return NextResponse.json({ error: "Sign up failed" }, { status: 500 });
  }
}
