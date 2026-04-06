"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

// ✅ Gemini setup (as per your requirement)
const ai = new GoogleGenAI({});

// =======================
// 🔹 AI GENERATOR
// =======================
export const generateAIInsights = async (industry: string) => {
  console.log("🧠 [Gemini] Generating insights for:", industry);

  const prompt = `
Analyze the current state of the ${industry} industry and provide insights in ONLY valid JSON format:

{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "HIGH" | "MEDIUM" | "LOW",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

IMPORTANT:
- Return ONLY JSON
- No markdown
- No explanation text
- No trailing commas
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // ✅ as per your requirement
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Empty AI response");
    }

    // 🔥 Clean response
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Invalid JSON from AI:", cleaned);
      throw new Error("AI returned invalid JSON");
    }

    // ✅ Basic validation (VERY IMPORTANT)
    if (
      !parsed.salaryRanges ||
      !parsed.topSkills ||
      !parsed.keyTrends
    ) {
      throw new Error("AI response missing required fields");
    }

    return parsed;

  } catch (err) {
    console.error("❌ [Gemini] Failed:", err);
    throw new Error("AI service unavailable");
  }
};


// =======================
// 🔹 MAIN ACTION
// =======================
export async function getIndustryInsights() {
  console.log("🔥 getIndustryInsights called");

  // 🔐 Auth
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) throw new Error("Unauthorized");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Session expired");

  const userId = payload.userId;

  // 👤 Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { industryInsight: true },
  });

  if (!user || !user.industry) {
    throw new Error("User or industry not found");
  }

  // 📦 Cache check
  const isStale =
    !user.industryInsight ||
    user.industryInsight.nextUpdate < new Date();

  if (!isStale) {
    console.log("📦 Returning cached insights");
    return user.industryInsight;
  }

  console.log("🚀 Generating new insights...");

  // 🔥 AI call OUTSIDE transaction (correct)
  let insights;

  try {
    insights = await generateAIInsights(user.industry);
  } catch (err) {
    console.log("⚠️ AI failed, using fallback");

    insights = {
      salaryRanges: [],
      growthRate: 0,
      demandLevel: "MEDIUM",
      marketOutlook: "NEUTRAL",
      topSkills: [],
      keyTrends: [],
      recommendedSkills: [],
    };
  }

  // 💾 Save to DB (no transaction needed here)
  const industryInsight = await prisma.industryInsight.upsert({
    where: { industry: user.industry }, // ⚠️ must be unique in schema
    update: {
      ...insights,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    create: {
      industry: user.industry,
      ...insights,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return industryInsight;
}