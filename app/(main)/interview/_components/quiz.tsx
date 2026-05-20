"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import type { QuizQuestion, QuestionResult } from "@/actions/interview";
import type { saveQuizResult as SaveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";

type QuizData = QuizQuestion[];
type SavedResult = Awaited<ReturnType<typeof SaveQuizResult>>;

type DisplayResult = {
  quizScore: number;
  improvementTip?: string | null;
  questions: QuestionResult[];
};

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
    error: quizError,
  } = useFetch<QuizData, []>(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: savedData,
    setData: setSavedData,
  } = useFetch<SavedResult, [QuizData, string[], number]>(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
      setCurrentQuestion(0);
    }
  }, [quizData]);

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = answer;
      return updated;
    });
    setAnswered(true);
    setShowExplanation(true);
  };

  const calculateScore = (): number => {
    if (!quizData) return 0;
    const correct = answers.filter(
      (answer, i) => answer === quizData[i]?.correctAnswer
    ).length;
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    if (!quizData) return;
    const score = calculateScore();
    const safeAnswers = answers.map((a) => a ?? "");

    try {
      await saveQuizResultFn(quizData, safeAnswers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to save quiz results";
      toast.error(message);
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
      setAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setAnswered(false);
    setSavedData(undefined);
    generateQuizFn();
  };

  if (generatingQuiz) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-1">
            <p className="text-lg font-semibold">Generating your quiz...</p>
            <p className="text-sm text-muted-foreground">
              Tailoring questions to your industry and skills
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizError) {
    return (
      <Card>
        <CardHeader><CardTitle>Something went wrong</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to generate the quiz. Please try again.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => generateQuizFn()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  if (savedData && quizData) {
    const safeAnswers = answers.map((a) => a ?? "");

    const displayResult: DisplayResult = {
      quizScore: savedData.quizScore,
      improvementTip: savedData.improvementTip,
      questions: quizData.map((q, i) => ({
        question: q.question,
        answer: q.correctAnswer,
        userAnswer: safeAnswers[i] ?? "",
        isCorrect: q.correctAnswer === safeAnswers[i],
        explanation: q.explanation ?? "",
      })),
    };

    return <QuizResult result={displayResult} onStartNew={startNewQuiz} />;
  }

  if (!quizData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ready to Test Your Knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This quiz contains 10 questions tailored to your industry and skills.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => generateQuizFn()}
            disabled={generatingQuiz}
          >
            {generatingQuiz ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Start Quiz"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];
  if (!question) return null;

  const currentAnswer = answers[currentQuestion];
  const progressValue = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-lg">
            Question {currentQuestion + 1} of {quizData.length}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressValue)}%
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="font-medium">{question.question}</p>

        <RadioGroup
          value={currentAnswer ?? ""}
          onValueChange={handleAnswer}
          className="space-y-2"
        >
          {question.options.map((option, i) => {
            const id = `option-${currentQuestion}-${i}`;
            const isCorrect = option === question.correctAnswer;
            const isSelected = option === currentAnswer;
            const showCorrect = answered && isCorrect;
            const showWrong = answered && isSelected && !isCorrect;

            return (
              <div
                key={option}
                className={cn(
                  "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                  !answered && "hover:bg-muted/50 cursor-pointer",
                  showCorrect && "border-green-500 bg-green-500/10",
                  showWrong && "border-red-500   bg-red-500/10",
                  !showCorrect && !showWrong && "border-border",
                )}
              >
                <RadioGroupItem
                  value={option}
                  id={id}
                  disabled={answered}
                />
                <Label
                  htmlFor={id}
                  className={cn(
                    "cursor-pointer flex-1",
                    showCorrect && "text-green-600 font-medium",
                    showWrong && "text-red-600",
                    answered && "cursor-default",
                  )}
                >
                  {option}
                  {showCorrect && (
                    <span className="ml-2 text-xs font-normal">✓ Correct</span>
                  )}
                  {showWrong && (
                    <span className="ml-2 text-xs font-normal">✗ Wrong</span>
                  )}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {showExplanation && question.explanation && (
          <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
            <p className="font-medium">Explanation</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleNext}
          disabled={!currentAnswer || savingResult}
        >
          {savingResult ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : currentQuestion === quizData.length - 1 ? (
            "Finish Quiz"
          ) : (
            "Next Question"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}