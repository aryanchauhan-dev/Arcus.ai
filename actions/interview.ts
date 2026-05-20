"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuestionResult = {
  question: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
  explanation: string;
};

const QuizSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
    explanation: z.string(),
  })).length(10),
});

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Session expired");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, industry: true, skills: true },
  });

  if (!user) throw new Error("User not found");
  return user;
}

const sanitize = (s: string) =>
  s.slice(0, 500).replace(/[<>]/g, "");

export async function generateQuiz(): Promise<QuizQuestion[]> {
  const user = await getAuthUser();

  const skills = Array.isArray(user.skills) ? (user.skills as string[]) : [];
  const industry = user.industry ?? "software engineering";

  const skillsText = skills.length
    ? ` with expertise in ${skills.map(sanitize).join(", ")}`
    : "";

  const prompt = `
Generate 10 technical interview questions for a ${sanitize(industry)} professional${skillsText}.

Each question should be multiple choice with exactly 4 options.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}

IMPORTANT: Return ONLY the JSON. No markdown, no explanation.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  const text = response.text ?? "";
  if (!text.trim()) throw new Error("Empty AI response");

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const validated = QuizSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Invalid AI response: ${validated.error.message}`);
  }

  return validated.data.questions;
}

export async function saveQuizResult(
  questions: QuizQuestion[],
  answers: string[],
  score: number,
  category = "Technical",
) {
  const user = await getAuthUser();

  const questionResults: QuestionResult[] = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index] ?? "",
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip: string | null = null;

  if (wrongAnswers.length > 0) {
    const wrongText = wrongAnswers
      .map((q) =>
        `Question: ${sanitize(q.question)}\n` +
        `Correct: ${sanitize(q.answer)}\n` +
        `User answered: ${sanitize(q.userAnswer)}`
      )
      .join("\n\n");

    const tipPrompt = `
The user got these interview questions wrong:

${wrongText}

Give a concise improvement tip in 2 sentences maximum.
Focus on what topics to study, not on the mistakes themselves.
`;

    try {
      const tipResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: tipPrompt,
      });
      improvementTip = tipResponse.text?.trim() ?? null;
    } catch {
      improvementTip = null;
    }
  }

  const assessment = await prisma.assessment.create({
    data: {
      userId: user.id,
      quizScore: score,
      questions: questionResults,
      category,
      improvementTip,
    },
    select: {
      id: true,
      quizScore: true,
      category: true,
      improvementTip: true,
      createdAt: true,
    },
  });

  return assessment;
}

export async function getAssessments() {
  const user = await getAuthUser();

  return prisma.assessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      quizScore: true,
      category: true,
      improvementTip: true,
      createdAt: true,
      questions: true,
    },
  });
}