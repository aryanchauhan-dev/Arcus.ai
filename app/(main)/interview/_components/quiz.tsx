"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";

import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

// =======================
// TYPES
// =======================

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

type QuizData = Question[];

type Result = {
  quizScore: number;
  improvementTip?: string | null;
  questions: any[];
};

// =======================
// COMPONENT
// =======================

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // ✅ FIX 1: [] instead of void
  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch<QuizData, []>(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch<Result, [QuizData, string[], number]>(saveQuizResult);

  // =======================

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
      setCurrentQuestion(0);
    }
  }, [quizData]);

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = answer;
      return updated;
    });
  };

  const calculateScore = () => {
    if (!quizData) return 0;

    let correct = 0;

    answers.forEach((answer, i) => {
      if (answer === quizData[i]?.correctAnswer) correct++;
    });

    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    if (!quizData) return;

    const score = calculateScore();

    // ✅ FIX 2: remove nulls
    const safeAnswers = answers.map((a) => a ?? "");

    try {
      await saveQuizResultFn(quizData, safeAnswers, score);
      toast.success("Quiz completed!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save quiz results");
    }
  };

  const handleNext = () => {
    if (!quizData) return;

    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(undefined);

    // ✅ FIX 3: pass empty args
    generateQuizFn();
  };

  // =======================

  if (generatingQuiz) {
    return <BarLoader width={"100%"} color="gray" />;
  }

  if (resultData) {
    return (
      <QuizResult result={resultData} onStartNew={startNewQuiz} />
    );
  }

  if (!quizData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>

        <CardContent>
          <p>This quiz contains 10 questions.</p>
        </CardContent>

        <CardFooter>
          {/* ✅ FIX 4: wrap function */}
          <Button onClick={() => generateQuizFn()}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p>{question.question}</p>

        <RadioGroup
          value={answers[currentQuestion] ?? ""}
          onValueChange={handleAnswer}
        >
          {question.options.map((option, i) => (
            <div key={i}>
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <p>{question.explanation}</p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}