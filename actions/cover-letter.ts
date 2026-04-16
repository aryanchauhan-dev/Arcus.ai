"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

type GenerateCoverLetterInput = {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
};

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

export async function generateCoverLetter(
  data: GenerateCoverLetterInput
) {
  const user = await getUserFromToken();

  const prompt = `
You are a professional career coach.

Write a strong cover letter for:

Role: ${data.jobTitle}
Company: ${data.companyName}

Candidate Profile:
- Industry: ${user.industry || "N/A"}
- Experience: ${user.experience || 0} years
- Skills: ${(user.skills || []).join(", ")}
- Background: ${user.bio || "N/A"}

Job Description:
${data.jobDescription || "Not provided"}

RULES:
- Max 400 words
- Professional tone
- Highlight impact & achievements
- Match candidate skills with job
- No markdown code blocks
- Clean formatting
- Make Sure the cover letter does'nt contain any unnecessary links in it.

Return ONLY the cover letter text.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;

    if (!text) throw new Error("Empty AI response");

    const cleaned = text.replace(/```/g, "").trim();

    const coverLetter = await prisma.coverLetter.create({
      data: {
        content: cleaned,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "FINAL",
        userId: user.id,
      },
    });

    revalidatePath("/cover-letter");

    return coverLetter;
  } catch (error) {
    console.error("❌ Cover letter generation failed:", error);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const user = await getUserFromToken();

  return await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCoverLetter(id: string) {
  const user = await getUserFromToken();

  return await prisma.coverLetter.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id: string) {
  const user = await getUserFromToken();

  try {
    const deleted = await prisma.coverLetter.delete({
      where: { id },
    });

    revalidatePath("/cover-letter");

    return deleted;
  } catch (error) {
    console.error("❌ Delete failed:", error);
    throw new Error("Failed to delete cover letter");
  }
}