import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Create Cover Letter",
};

async function getUserProfile() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    return prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        name: true,
        industry: true,
        experience: true,
        skills: true,
        bio: true,
      },
    });
  } catch {
    return null;
  }
}

export default async function NewCoverLetterPage() {

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) redirect("/sign-in?callbackUrl=/ai-cover-letter/new");

  const payload = await verifyToken(token);
  if (!payload) redirect("/sign-in?callbackUrl=/ai-cover-letter/new");

  const rawProfile = await getUserProfile();

  const userProfile = rawProfile
    ? {
      ...rawProfile,
      skills: Array.isArray(rawProfile.skills)
        ? (rawProfile.skills as string[])
        : [],
    }
    : undefined;

  return (
    <div className="container mx-auto py-6">

      <div className="flex flex-col space-y-2 pb-6">
        <Button asChild variant="link" className="gap-2 pl-0 w-fit">
          <Link href="/ai-cover-letter">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Link>
        </Button>

        <div>
          <h1 className="text-6xl font-bold gradient-title">
            Create Cover Letter
          </h1>
          <p className="text-muted-foreground">
            Generate a tailored cover letter for your job application
          </p>
        </div>
      </div>

      <CoverLetterGenerator {...(userProfile ? { userProfile } : {})} />
    </div>
  );
}