import { prisma } from "./prisma";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function checkRateLimit(email: string, ipAddress: string) {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const attempts = await prisma.loginAttempt.count({
    where: {
      OR: [{ email }, { ipAddress }],
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  return attempts >= MAX_ATTEMPTS; 
}

export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userId?: string
) {
  await prisma.loginAttempt.create({
    data: { email, success, ipAddress, userId },
  });
}