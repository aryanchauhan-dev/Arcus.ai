"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Session expired");

  return payload.userId;
}

export async function updateUser(data: {
  industry: string;
  experience?: number | undefined;
  bio?: string | undefined;
  skills?: string[] | undefined;
}) {

  const userId = await getAuthenticatedUserId();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      industry: data.industry,
      skills: data.skills ?? [],
      experience: data.experience ?? null,
      bio: data.bio ?? null,
    },
    select: {
      id: true,
      industry: true,
      experience: true,
      bio: true,
      skills: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return updatedUser;
}

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

  return { isOnboarded: !!user?.industry };
}