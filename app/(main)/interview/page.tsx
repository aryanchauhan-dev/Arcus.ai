import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-card";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";

type Assessment = Awaited<ReturnType<typeof getAssessments>>[number];

export const metadata: Metadata = {
  title: "Interview Preparation",
};

export default async function InterviewPrepPage() {
  let assessments: Assessment[] = [];
  let fetchError = false;

  try {
    assessments = await getAssessments();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "Unauthorized" || message === "Session expired") {
      redirect("/sign-in?callbackUrl=/interview");
    }

    fetchError = true;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">

      <header className="flex items-center justify-between px-2">
        <h1 className="text-4xl md:text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </header>

      <section className="space-y-6 px-2">
        {fetchError && (
          <p className="text-sm text-red-500">
            Failed to load your assessments. Please refresh the page.
          </p>
        )}

        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </section>

    </div>
  );
}