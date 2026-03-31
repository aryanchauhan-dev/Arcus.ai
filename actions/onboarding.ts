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

  // 🔴 1. Get user from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token);
  if(!payload){
    throw new Error("Unauthorized");
  }
  const userId = payload.userId;

  // 🔴 2. Check user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const result = await prisma.$transaction(async (tx) => {

      // 🔹 3. Check if industry exists
      let industryRecord = await tx.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      // 🔥 4. If NOT → create using incoming data
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

      // 🔹 5. Update user
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
    console.error("Error updating user:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {

  // 🔴 1. Get user from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { isOnboarded: false }; // user not logged in
  }

  // 🔴 2. Verify token
  const payload = await verifyToken(token);
  if(!payload){
    throw new Error("Unauthorized");
  }
  const userId = payload.userId;

  // 🔴 3. Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      industry: true,
    },
  });

  if (!user) {
    return { isOnboarded: false };
  }

  // 🔥 4. Determine onboarding
  return {
    isOnboarded: !!user.industry,
  };
}