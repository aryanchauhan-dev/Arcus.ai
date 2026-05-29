"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

import type { getAssessments, QuestionResult } from "@/actions/interview";

type Assessment = Awaited<ReturnType<typeof getAssessments>>[number];

export default function QuizList({ assessments }: { assessments: Assessment[] }) {
  const [selectedQuiz, setSelectedQuiz] = useState<Assessment | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-title text-3xl md:text-4xl">
                Recent Quizzes
              </CardTitle>
              <CardDescription>
                Review your past quiz performance
              </CardDescription>
            </div>

            <Button asChild>
              <Link href="/interview/mock">Start New Quiz</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">

            {assessments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No quizzes attempted yet. Start your first quiz above!
              </p>
            )}

            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                role="button"
                tabIndex={0}
                aria-label={`View quiz from ${format(new Date(assessment.createdAt), "MMMM dd, yyyy")}`}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedQuiz(assessment)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedQuiz(assessment)}
              >
                <CardHeader>
                  <CardTitle className="gradient-title text-2xl">
                    {format(new Date(assessment.createdAt), "MMM dd, yyyy")}
                  </CardTitle>

                  <div className="flex justify-between w-full text-sm text-muted-foreground mt-1">
                    <span>Score: {assessment.quizScore.toFixed(1)}%</span>
                    <span>
                      {format(new Date(assessment.createdAt), "HH:mm")}
                    </span>
                  </div>
                </CardHeader>

                {assessment.improvementTip && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      💡 {assessment.improvementTip}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}

          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedQuiz}
        onOpenChange={(open) => { if (!open) setSelectedQuiz(null); }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Details</DialogTitle>
            <DialogDescription>
              Review your answers and improvement tips.
            </DialogDescription>
          </DialogHeader>

          {selectedQuiz && (
            <QuizResult
              result={{
                ...selectedQuiz,
                questions: (selectedQuiz.questions as QuestionResult[]) ?? [],
              }}
              hideStartNew
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}