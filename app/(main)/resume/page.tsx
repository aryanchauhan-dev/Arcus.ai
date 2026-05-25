import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ResumeAnalyzer from "./_components/resume-analyzer";

async function getUserProfile() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) return null;

        const payload = await verifyToken(token);
        if (!payload) return null;

        return prisma.user.findUnique({
            where: { id: payload.userId },
            select: { industry: true, experience: true, skills: true },
        });
    } catch {
        return null;
    }
}

export default async function ResumePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) redirect("/sign-in?callbackUrl=/resume");
    const payload = await verifyToken(token);
    if (!payload) redirect("/sign-in?callbackUrl=/resume");

    const profile = await getUserProfile();
    const industry = profile?.industry ?? undefined;

    return <ResumeAnalyzer {...(industry ? { industry } : {})} />;
}