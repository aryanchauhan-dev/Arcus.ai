"use client";

import { Brain, Target, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// =======================
// 🔹 TYPES
// =======================

type Assessment = {
  quizScore: number;
  questions?: any[];
};

type Props = {
  assessments: Assessment[];
};

// =======================
// 🔹 COMPONENT
// =======================

export default function StatsCards({ assessments }: Props) {
  // =======================
  // 🔹 DERIVED DATA
  // =======================

  const totalAssessments = assessments?.length ?? 0;

  const averageScore =
    totalAssessments === 0
      ? 0
      : Number(
          (
            assessments.reduce((sum, a) => sum + a.quizScore, 0) /
            totalAssessments
          ).toFixed(1)
        );

  const latestScore =
    totalAssessments > 0
      ? Number(assessments[0].quizScore.toFixed(1))
      : 0;

  const totalQuestions = assessments.reduce(
    (sum, a) => sum + (a.questions?.length ?? 0),
    0
  );

  // =======================
  // 🔹 UI
  // =======================

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* AVERAGE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Average Score
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {averageScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      {/* QUESTIONS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Questions Practiced
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {totalQuestions}
          </div>
          <p className="text-xs text-muted-foreground">
            Total questions
          </p>
        </CardContent>
      </Card>

      {/* LATEST */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Latest Score
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {latestScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            Most recent quiz
          </p>
        </CardContent>
      </Card>
    </div>
  );
}