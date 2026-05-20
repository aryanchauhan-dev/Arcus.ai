"use client";

import { Brain, Target, Trophy } from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import type { getAssessments } from "@/actions/interview";

type Assessment = Awaited<ReturnType<typeof getAssessments>>[number];

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

export default function StatsCards({ assessments }: { assessments: Assessment[] }) {

  const totalAssessments = assessments.length;

  if (totalAssessments === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              No quiz data yet. Take your first quiz to see your stats!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageScore = Math.round(
    (assessments.reduce((sum, a) => sum + a.quizScore, 0) / totalAssessments) * 10
  ) / 10;

  const latest = assessments[0];
  const latestScore = latest
    ? Math.round(latest.quizScore * 10) / 10
    : 0;

  const totalQuestions = assessments.reduce(
    (sum, a) => sum + (Array.isArray(a.questions) ? a.questions.length : 0),
    0
  );

  const avgColor = getScoreColor(averageScore);
  const latestColor = getScoreColor(latestScore);

  return (
    <div className="grid gap-4 md:grid-cols-3">

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${avgColor}`}>
            {averageScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            Across {totalAssessments} assessment{totalAssessments !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <p className="text-xs text-muted-foreground">
            Total questions answered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${latestColor}`}>
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