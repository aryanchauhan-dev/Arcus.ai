import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenAI } from "@google/genai";
import { AIInsightSchema } from "@/lib/insight-utils";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type InsightData = z.infer<typeof AIInsightSchema>;

function parseCacheKey(cacheKey: string): { industry: string; skills: string[] } {
  const colonIndex = cacheKey.indexOf(":");
  if (colonIndex === -1) return { industry: cacheKey, skills: [] };

  const industry = cacheKey.slice(0, colonIndex);
  const skillsStr = cacheKey.slice(colonIndex + 1);
  const skills = skillsStr ? skillsStr.split(",").filter(Boolean) : [];

  return { industry, skills };
}

async function generateInsights(
  industry: string,
  skills: string[],
): Promise<InsightData | null> {

  const skillsText = skills.length
    ? ` for professionals with skills: ${skills.join(", ")}`
    : "";

  const prompt = `
Analyze the current state of the ${industry} industry${skillsText}.

Return ONLY valid JSON in this exact format:

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
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";
    if (!text.trim()) return null;

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return null;
    }

    const validated = AIInsightSchema.safeParse(parsed);
    if (!validated.success) return null;

    return validated.data;

  } catch {
    return null;
  }
}

export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    retries: 2,
    concurrency: { limit: 3 },
  },

  { cron: "0 0 * * 0" },

  async ({ step }) => {

    const records = await step.run("fetch-cached-records", async () => {
      return prisma.industryInsight.findMany({
        select: {
          cacheKey: true,
          industry: true,
          nextUpdate: true,
        },
      });
    });

    const staleRecords = records.filter(
      (r) => new Date(r.nextUpdate) < new Date()
    );

    const results = { updated: 0, skipped: 0, failed: 0 };

    for (const record of staleRecords) {
      await step.run(`update-${record.cacheKey}`, async () => {

        const { industry, skills } = parseCacheKey(record.cacheKey);

        const insights = await generateInsights(industry, skills);

        if (!insights) {
          results.failed++;
          return;
        }

        await prisma.industryInsight.update({
          where: { cacheKey: record.cacheKey },
          data: {
            salaryRanges: insights.salaryRanges,
            growthRate: insights.growthRate,
            demandLevel: insights.demandLevel,
            marketOutlook: insights.marketOutlook,
            topSkills: insights.topSkills,
            keyTrends: insights.keyTrends,
            recommendedSkills: insights.recommendedSkills,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        results.updated++;
        await new Promise((res) => setTimeout(res, 500));
      });
    }

    return {
      totalRecords: records.length,
      staleRecords: staleRecords.length,
      updated: results.updated,
      skipped: records.length - staleRecords.length,
      failed: results.failed,
    };
  },
);