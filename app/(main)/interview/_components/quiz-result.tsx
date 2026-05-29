"use client";

import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuestionResult } from "@/actions/interview";

type Result = {
  quizScore: number;
  improvementTip?: string | null;
  questions: QuestionResult[];
};

type Props = {
  result: Result | null;
  hideStartNew?: boolean;
  onStartNew?: () => void;
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

function getResultMessage(score: number): {
  text: string;
  emoji: string;
  color: string;
} {
  if (score >= 90) return { text: "Outstanding!", emoji: "🏆", color: "text-green-500" };
  if (score >= 70) return { text: "Great job!", emoji: "🎉", color: "text-blue-500" };
  if (score >= 50) return { text: "Good effort!", emoji: "💪", color: "text-yellow-500" };
  return { text: "Keep practicing!", emoji: "📚", color: "text-red-500" };
}

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}: Props) {
  if (!result) return null;

  const score = Math.round(result.quizScore * 10) / 10;
  const correctCount = result.questions.filter((q) => q.isCorrect).length;
  const totalCount = result.questions.length;
  const scoreColor = getScoreColor(score);
  const message = getResultMessage(score);

  return (
    <div className="mx-auto space-y-6">

      <h2 className="flex items-center gap-2 text-3xl gradient-title">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </h2>

      <div className="text-center space-y-2">
        <p className={`text-2xl font-bold ${message.color}`}>
          {message.emoji} {message.text}
        </p>

        <h3 className={`text-4xl font-bold ${scoreColor}`}>{score}%</h3>
        <p className="text-sm text-muted-foreground">
          {correctCount} of {totalCount} correct
        </p>
        <Progress value={score} className="w-full" />
      </div>

      {result.improvementTip && (
        <div className="bg-muted p-4 rounded-lg space-y-1">
          <p className="font-medium text-sm">💡 Improvement Tip</p>
          <p className="text-sm text-muted-foreground">
            {result.improvementTip}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-medium">Question Review</h3>

        {result.questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions found.</p>
        )}

        {result.questions.map((q, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{q.question}</p>
              {q.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              )}
            </div>

            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>
                <span className="font-medium text-foreground">Your answer: </span>
                {q.userAnswer}
              </p>
              {!q.isCorrect && (
                <p>
                  <span className="font-medium text-green-600">Correct answer: </span>
                  {q.answer}
                </p>
              )}
            </div>

            {q.explanation && (
              <div className="text-sm bg-muted p-2 rounded space-y-0.5">
                <p className="font-medium">Explanation</p>
                <p className="text-muted-foreground">{q.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!hideStartNew && onStartNew && (
        <div className="pt-2">
          <Button onClick={onStartNew} className="w-full">
            Start New Quiz
          </Button>
        </div>
      )}
    </div>
  );
}