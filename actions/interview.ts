"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

// =======================
// 🔹 AI SETUP
// =======================

const ai = new GoogleGenAI({});

// =======================
// 🔹 AUTH HELPER (CORE)
// =======================

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Session expired");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) throw new Error("User not found");

  return user;
}

// =======================
// 🔹 GENERATE QUIZ
// =======================

export async function generateQuiz() {
  const user = await getUserFromToken();

  const prompt = `
Generate 10 technical interview questions for a ${
    user.industry || "software engineering"
  } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

Each question should be multiple choice with 4 options.

Return JSON:
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
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return parsed.questions;
  } catch (error) {
    console.error("❌ Quiz generation failed:", error);
    throw new Error("Failed to generate quiz");
  }
}

// =======================
// 🔹 SAVE QUIZ RESULT
// =======================

export async function saveQuizResult(
  questions: any[],
  answers: string[],
  score: number
) {
  const user = await getUserFromToken();

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter(q => !q.isCorrect);

  let improvementTip: string | null = null;

  if (wrongAnswers.length > 0) {
    const wrongText = wrongAnswers
      .map(
        q =>
          `Question: ${q.question}\nCorrect: ${q.answer}\nUser: ${q.userAnswer}`
      )
      .join("\n\n");

    const prompt = `
User got these questions wrong:

${wrongText}

Give a short improvement tip (max 2 lines).
Focus on what to study, not mistakes.
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      improvementTip = response.text?.trim() || null;
    } catch (error) {
      console.error("❌ Tip generation failed:", error);
    }
  }

  try {
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("❌ Save failed:", error);
    throw new Error("Failed to save quiz result");
  }
}

// =======================
// 🔹 GET ASSESSMENTS
// =======================

export async function getAssessments() {
  const user = await getUserFromToken();

  try {
    return await prisma.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("❌ Fetch failed:", error);
    throw new Error("Failed to fetch assessments");
  }
}