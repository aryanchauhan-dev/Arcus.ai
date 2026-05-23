import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";


type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);
  if (!coverLetter) return { title: "Cover Letter Not Found" };
  return {
    title: `${coverLetter.jobTitle} at ${coverLetter.companyName}`,
  };
}

export default async function CoverLetterDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { edit } = await searchParams;

  let coverLetter;
  try {
    coverLetter = await getCoverLetter(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized" || message === "Session expired") {
      redirect("/sign-in?callbackUrl=/ai-cover-letter");
    }
    throw error;
  }

  if (!coverLetter) notFound();

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex flex-col space-y-2">
        <Button asChild variant="link" className="gap-2 pl-0 w-fit">
          <Link href="/ai-cover-letter">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Link>
        </Button>

        <div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-title">
            {coverLetter.jobTitle} at {coverLetter.companyName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(coverLetter.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
      </div>
      <CoverLetterPreview
        coverLetter={coverLetter}
        defaultEditing={edit === "true"}
      />
    </div>
  );
}