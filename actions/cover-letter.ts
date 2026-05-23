"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";
import type { Tone } from "@/schemas/cover-letter";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  professional: "formal, polished, and business-appropriate",
  creative: "engaging, distinctive, and memorable while remaining professional",
  concise: "brief, direct, and impactful — strictly under 250 words",
  enthusiastic: "energetic, passionate, and highly motivated",
};

const GenerateCoverLetterSchema = z.object({
  jobTitle: z.string().min(1).max(100),
  companyName: z.string().min(1).max(100),
  jobDescription: z.string().max(5000).optional(),
  tone: z.enum(["professional", "creative", "concise", "enthusiastic"])
    .default("professional"),
});

type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterSchema>;

const sanitize = (s: string) => s.slice(0, 500).replace(/[<>]/g, "");

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Session expired");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, industry: true, experience: true, skills: true, bio: true },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export async function generateCoverLetter(input: GenerateCoverLetterInput) {
  const parsed = GenerateCoverLetterSchema.safeParse(input);
  if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);

  const data = parsed.data;
  const user = await getAuthUser();
  const skills = Array.isArray(user.skills) ? (user.skills as string[]) : [];

  const toneDescription = TONE_DESCRIPTIONS[data.tone];

  const prompt = `
You are a professional career coach writing on behalf of a job applicant.

Write a strong, personalized cover letter with a ${toneDescription} tone for:

Role:    ${sanitize(data.jobTitle)}
Company: ${sanitize(data.companyName)}

Candidate Profile:
- Name:       ${user.name ?? "The applicant"}
- Industry:   ${user.industry ?? "N/A"}
- Experience: ${user.experience ?? 0} years
- Skills:     ${skills.map(sanitize).join(", ") || "N/A"}
- Background: ${user.bio ? sanitize(user.bio) : "N/A"}

Job Description:
${data.jobDescription ? sanitize(data.jobDescription) : "Not provided"}

TONE REQUIREMENT: ${toneDescription}

RULES:
- ${data.tone === "concise" ? "STRICT maximum 250 words" : "Maximum 400 words"}
- No markdown, no code blocks, no bullet points
- No placeholder links or URLs
- Start with a strong opening paragraph
- End with a clear call to action
- Match candidate skills to job requirements

Return ONLY the cover letter text.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  const text = response.text ?? "";
  if (!text.trim()) throw new Error("Empty AI response");

  const cleaned = text.replace(/```/g, "").trim();

  const coverLetter = await prisma.coverLetter.create({
    data: {
      content: cleaned,
      jobDescription: data.jobDescription ?? null,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      status: "FINAL",
      userId: user.id,
    },
    select: {
      id: true,
      jobTitle: true,
      companyName: true,
      content: true,
      status: true,
      createdAt: true,
    },
  });

  revalidatePath("/ai-cover-letter");
  return coverLetter;
}

export async function updateCoverLetter(id: string, content: string) {
  if (!id) throw new Error("Cover letter ID required");
  if (!content.trim()) throw new Error("Content cannot be empty");

  const user = await getAuthUser();

  const existing = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Cover letter not found");

  const updated = await prisma.coverLetter.update({
    where: { id },
    data: { content: content.trim() },
    select: {
      id: true,
      jobTitle: true,
      companyName: true,
      content: true,
      status: true,
      updatedAt: true,
    },
  });

  revalidatePath("/ai-cover-letter");
  revalidatePath(`/ai-cover-letter/${id}`);
  return updated;
}

export async function getCoverLetters() {
  const user = await getAuthUser();

  return prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      jobTitle: true,
      companyName: true,
      jobDescription: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getCoverLetter(id: string) {
  const user = await getAuthUser();

  return prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      jobTitle: true,
      companyName: true,
      jobDescription: true,
      content: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteCoverLetter(id: string) {
  const user = await getAuthUser();

  const existing = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Cover letter not found");

  await prisma.coverLetter.delete({ where: { id } });
  revalidatePath("/ai-cover-letter");
}