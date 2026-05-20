import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";

export const metadata: Metadata = {
  title: "Mock Interview",
};

export default function MockInterviewPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">

      <header className="flex flex-col space-y-3 px-2">
        <Button asChild variant="link" className="gap-2 pl-0 w-fit">
          <Link href="/interview">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Link>
        </Button>

        <div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-title">
            Mock Interview
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge with industry-specific questions
          </p>
        </div>
      </header>

      <section className="px-2">
        <Quiz />
      </section>

    </div>
  );
}