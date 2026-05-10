import { SignJWT, jwtVerify } from "jose";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const accessSecret = new TextEncoder().encode(requireEnv("JWT_ACCESS_SECRET"));
const refreshSecret = new TextEncoder().encode(requireEnv("JWT_REFRESH_SECRET"));

export interface AccessTokenPayload {
  userId: string;
  email: string;        
  type: "access";
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;        
  type: "refresh";
}

export function signAccessToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, type: "access" } satisfies AccessTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);
}

export function signRefreshToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, type: "refresh" } satisfies RefreshTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);
}

export async function verifyToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    if (payload["type"] !== "access") return null;
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    if (payload["type"] !== "refresh") return null;
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}