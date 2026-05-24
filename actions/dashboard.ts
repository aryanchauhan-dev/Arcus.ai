"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateCacheKey } from "@/lib/insight-utils";

export type { InsightData } from "@/lib/insight-utils";

export async function refreshInsights(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) throw new Error("Unauthorized");

    const payload = await verifyToken(token);
    if (!payload) throw new Error("Session expired");

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { industry: true, skills: true },
    });

    if (!user?.industry) throw new Error("User industry not set");

    const skills = Array.isArray(user.skills) ? (user.skills as string[]) : [];
    const cacheKey = generateCacheKey(user.industry, skills);

    await prisma.industryInsight.updateMany({
        where: { cacheKey },
        data: { nextUpdate: new Date(0) },
    });

    revalidatePath("/dashboard");
}

export async function getUserSkills(): Promise<string[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return [];

    const payload = await verifyToken(token);
    if (!payload) return [];

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { skills: true },
    });

    if (user?.skills == null) throw new Error("Hello")

    return Array.isArray(user?.skills) ? (user.skills as string[]) : [];
}