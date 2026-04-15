import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";

// =======================
// 🔹 COMPONENT
// =======================

export default function MockInterviewPage() {
  return (
    <main className="container mx-auto py-6 space-y-6">
      {/* HEADER */}
      <header className="flex flex-col space-y-3 px-2">
        <Link href="/interview" className="w-fit">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-title">
            Mock Interview
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge with industry-specific questions
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <section className="px-2">
        <Quiz />
      </section>
    </main>
  );
}