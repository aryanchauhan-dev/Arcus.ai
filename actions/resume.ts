"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// =======================
// 🔹 AUTH HELPER
// =======================

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Session expired");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  return user;
}

// =======================
// 🔹 SAVE RESUME
// =======================

export async function saveResume(content: string) {
  const user = await getUserFromToken();

  try {
    const resume = await prisma.resume.upsert({
      where: { userId: user.id },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume-builder");

    return resume;
  } catch (error) {
    console.error("❌ Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

// =======================
// 🔹 GET RESUME
// =======================

export async function getResume() {
  const user = await getUserFromToken();

  return await prisma.resume.findUnique({
    where: { userId: user.id },
  });
}

// =======================
// 🔹 AI IMPROVE (FAANG READY)
// =======================

export async function improveWithAI({
  current,
  type,
}: {
  current: string;
  type: "summary" | "experience" | "project";
}) {
  const user = await getUserFromToken();

  const industry = user.industry || "software engineering";

  const prompt = `
You are a FAANG-level resume expert.

Improve the following ${type} for a ${industry} candidate.

CURRENT:
"${current}"

STRICT RULES:
- Return ONLY improved text
- No markdown
- No explanation
- Single paragraph

REQUIREMENTS:
1. Start with strong action verb
2. Add measurable impact (%, scale, users, revenue)
3. Include relevant tech keywords
4. ATS optimized
5. Achievement-oriented (not responsibilities)

GOOD EXAMPLE:
"Engineered scalable microservices reducing API latency by 45% and supporting 2M+ daily users using Node.js and Redis."

Now improve it.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;

    if (!text) throw new Error("Empty AI response");

    return text.replace(/```/g, "").trim();

  } catch (error) {
    console.error("❌ AI improvement failed:", error);
    return current; // fallback
  }
}

// =======================
// 🔹 GENERATE FULL RESUME (🔥 NEW)
// =======================

export async function generateResumeFromProfile() {
  const user = await getUserFromToken();

  const prompt = `
You are a FAANG-level resume writer.

Create a professional one-page resume for:

Name: ${user.name || "Candidate"}
Industry: ${user.industry || "Software Engineering"}
Experience: ${user.experience || 0} years
Skills: ${(user.skills || []).join(", ")}

RULES:
- Clean professional format
- No markdown code blocks
- Sections:
  SUMMARY
  SKILLS
  EXPERIENCE
  PROJECTS

- Use bullet points with impact
- Add realistic metrics
- ATS optimized
- Keep concise

Return ONLY the resume text.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;

    if (!text) throw new Error("Empty AI response");

    const cleaned = text.replace(/```/g, "").trim();

    // 🔥 Save automatically
    await saveResume(cleaned);

    return cleaned;

  } catch (error) {
    console.error("❌ Resume generation failed:", error);
    throw new Error("Failed to generate resume");
  }
}

// =======================
// 🔹 ATS SCORE + FEEDBACK (🔥 BONUS)
// =======================

export async function analyzeResume(content: string) {
  const user = await getUserFromToken();

  const prompt = `
You are an ATS system.

Analyze this resume for ${user.industry} roles.

Return ONLY JSON:

{
  "score": number (0-100),
  "feedback": "string"
}

Focus:
- keywords
- structure
- impact
- clarity
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;

    if (!text) throw new Error("Empty response");

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    // 🔥 Save ATS score
    await prisma.resume.update({
      where: { userId: user.id },
      data: {
        atsScore: parsed.score,
        feedback: parsed.feedback,
      },
    });

    return parsed;

  } catch (error) {
    console.error("❌ ATS analysis failed:", error);
    throw new Error("Failed to analyze resume");
  }
}