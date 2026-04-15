import { getAssessments } from "@/actions/interview";

import StatsCards from "./_components/stats-card";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";

// =======================
// 🔹 TYPES
// =======================

type Assessment = {
  id: string;
  quizScore: number;
  questions: any[];
  createdAt: Date;
  improvementTip?: string | null;
};

// =======================
// 🔹 COMPONENT
// =======================

export default async function InterviewPrepPage() {
  let assessments: Assessment[] = [];

  try {
    assessments = await getAssessments();
  } catch (error) {
    console.error("Failed to load assessments:", error);
  }

  return (
    <main className="container mx-auto py-6 space-y-6">
      <header className="flex items-center justify-between px-2">
        <h1 className="text-4xl md:text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </header>

      <section className="space-y-6 px-2">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </section>
    </main>
  );
}