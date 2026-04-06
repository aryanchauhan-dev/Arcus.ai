"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard"; // ✅ Gemini structure unchanged

// =======================
// UPDATE USER
// =======================
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
  if (!payload) {
    throw new Error("Session expired. Please retry.");
  }

  const userId = payload.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // 🔥 1. Check existing insight
    let industryRecord = await prisma.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    // 🔥 2. Generate if missing (AI OUTSIDE DB critical path)
    if (!industryRecord) {
      console.log(`🚀 No insights for ${data.industry}, generating...`);

      let insights;

      try {
        insights = await generateAIInsights(data.industry);
      } catch (err) {
        console.error("⚠️ AI failed, using fallback");

        insights = {
          salaryRanges: [],
          growthRate: 0,
          demandLevel: "MEDIUM",
          marketOutlook: "NEUTRAL",
          topSkills: [],
          keyTrends: [],
          recommendedSkills: [],
        };
      }

      // 🔥 IMPORTANT: race-condition safe create
      try {
        industryRecord = await prisma.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (err: any) {
        // 👉 If another request already created it (duplicate race)
        if (err.code === "P2002") {
          industryRecord = await prisma.industryInsight.findUnique({
            where: { industry: data.industry },
          });
        } else {
          throw err;
        }
      }
    }

    // 🔥 3. Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        industry: industryRecord!.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    revalidatePath("/");

    return updatedUser;

  } catch (error: any) {
    console.error("❌ Profile update failed:", error);
    throw new Error("Failed to update profile");
  }
}

// =======================
// GET ONBOARDING STATUS
// =======================
export async function getUserOnboardingStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return { isOnboarded: false };

  const payload = await verifyToken(token);
  if (!payload) return { isOnboarded: false };

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { industry: true },
  });

  return {
    isOnboarded: !!user?.industry,
  };
}