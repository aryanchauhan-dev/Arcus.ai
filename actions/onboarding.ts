"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUser(data: {
  industry: string;
  experience?: number;
  bio?: string;
  skills?: string[];
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
  throw new Error("Session expired. Please retry.");
}

  const payload = await verifyToken(token);

  // 🔥 FIX: don't hard fail immediately (refresh might have just happened)
  if (!payload) {
    throw new Error("Session expired. Please retry.");
  }

  const userId = payload.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const result = await prisma.$transaction(async (tx) => {
      let industryRecord = await tx.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      if (!industryRecord) {
        industryRecord = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            salaryRanges: [],
            growthRate: 0,
            demandLevel: "MEDIUM",
            marketOutlook: "NEUTRAL",
            topSkills: [],
            keyTrends: [],
            recommendedSkills: [],
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          industry: industryRecord.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });

      return { updatedUser, industryRecord };
    });

    revalidatePath("/");

    return result.updatedUser;

  } catch (error: any) {
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { isOnboarded: false };
  }

  const payload = await verifyToken(token);

  // 🔥 FIX: graceful fallback instead of crash
  if (!payload) {
    return { isOnboarded: false };
  }

  const userId = payload.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      industry: true,
    },
  });

  if (!user) {
    return { isOnboarded: false };
  }

  return {
    isOnboarded: !!user.industry,
  };
}