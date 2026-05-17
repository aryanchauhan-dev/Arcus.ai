import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import {
    AIInsightSchema,
    generateCacheKey,
    transformInsights,
    getFallbackInsights,
} from "@/lib/insight-utils";
import type {
    AIInsight,
    InsightData,
    PrismaInsightRecord,
} from "@/lib/insight-utils";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 10000; // 10s, 20s, 40s — gives quota time to reset

// ─── Gemini ───────────────────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


async function generateAIInsights(
    industry: string,
    skills: string[],
    attempt = 1,
): Promise<AIInsight> {

    const safeIndustry = industry
        .slice(0, 100)
        .replace(/[^a-zA-Z0-9\s\-&]/g, "");

    const safeSkills = skills
        .slice(0, 20)
        .map((s) => s.slice(0, 50).replace(/[^a-zA-Z0-9\s\-+#.]/g, ""));

    const prompt = `
Analyze the current state of the ${safeIndustry} industry for professionals
with these skills: ${safeSkills.join(", ")}.

Provide insights in ONLY valid JSON format:

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

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no trailing commas.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingLevel: ThinkingLevel.MEDIUM
                }
            },
        });

        const text = response.text ?? "";
        if (!text.trim()) throw new Error("Empty AI response from Gemini");

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

        const validated = AIInsightSchema.safeParse(parsed);
        if (!validated.success) {
            throw new Error(`AI response failed validation: ${validated.error.message}`);
        }

        return validated.data;

    } catch (err) {
        const is429 =
            err instanceof Error &&
            (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED"));

        if (is429 && attempt < MAX_RETRIES) {
            const delayMs = RETRY_BASE_MS * 2 ** (attempt - 1);
            await new Promise((res) => setTimeout(res, delayMs));
            return generateAIInsights(industry, skills, attempt + 1);
        }

        throw err;
    }
}

export const getIndustryInsights = cache(
    async (): Promise<InsightData> => {

        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        if (!token) throw new Error("Unauthorized");

        const payload = await verifyToken(token);
        if (!payload) throw new Error("Session expired");

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { industry: true, skills: true },
        });

        if (!user?.industry) throw new Error("User industry not set");

        const skills = Array.isArray(user.skills)
            ? (user.skills as string[])
            : [];

        const cacheKey = generateCacheKey(user.industry, skills);

        const cached = await prisma.industryInsight.findUnique({
            where: { cacheKey },
        });

        const isStale = !cached || cached.nextUpdate < new Date();

        if (!isStale && cached) {
            return transformInsights(cached as PrismaInsightRecord);
        }

        let insights: AIInsight;

        try {
            insights = await generateAIInsights(user.industry, skills);
        } catch {
            if (cached) return transformInsights(cached as PrismaInsightRecord);
            return getFallbackInsights();
        }

        const nextUpdate = new Date(Date.now() + CACHE_TTL_MS);

        const saved = await prisma.industryInsight.upsert({
            where: { cacheKey },
            update: {
                salaryRanges: insights.salaryRanges,
                growthRate: insights.growthRate,
                demandLevel: insights.demandLevel,
                marketOutlook: insights.marketOutlook,
                topSkills: insights.topSkills,
                keyTrends: insights.keyTrends,
                recommendedSkills: insights.recommendedSkills,
                nextUpdate,
            },
            create: {
                cacheKey,
                industry: user.industry,
                salaryRanges: insights.salaryRanges,
                growthRate: insights.growthRate,
                demandLevel: insights.demandLevel,
                marketOutlook: insights.marketOutlook,
                topSkills: insights.topSkills,
                keyTrends: insights.keyTrends,
                recommendedSkills: insights.recommendedSkills,
                nextUpdate,
            },
        });

        return transformInsights(saved as PrismaInsightRecord);
    }
);