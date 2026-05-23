import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetters } from "@/actions/cover-letter";
import CoverLetterList from "./_components/cover-letter-list";

export const metadata: Metadata = {
  title: "My Cover Letters",
};

export default async function CoverLetterPage() {

  let coverLetters;
  try {
    coverLetters = await getCoverLetters();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized" || message === "Session expired") {
      redirect("/sign-in?callbackUrl=/ai-cover-letter");
    }
    throw error;
  }

  return (
    <div className="container mx-auto py-6">

      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          My Cover Letters
        </h1>

        <Button asChild>
          <Link href="/ai-cover-letter/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}