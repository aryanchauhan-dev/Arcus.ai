import { prisma } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenAI } from "@google/genai";

// ✅ Latest SDK (as per your project)
const ai = new GoogleGenAI({});

export const generateIndustryInsights = inngest.createFunction(
  { id: "generate-industry-insights" },

  // ⏰ Weekly cron (Sunday midnight)
  { cron: "0 0 * * 0" },

  async ({ step }) => {
    // 🔹 1. Fetch all industries
    const industries = await step.run("fetch-industries", async () => {
      return await prisma.industryInsight.findMany({
        select: { industry: true },
      });
    });

    // 🔹 2. Loop industries
    for (const { industry } of industries) {
      await step.run(`process-${industry}`, async () => {
        console.log(`🧠 Updating insights for: ${industry}`);

        const prompt = `
Analyze the current state of the ${industry} industry and return ONLY valid JSON:

{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "HIGH" | "MEDIUM" | "LOW",
  "topSkills": ["skill1"],
  "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "keyTrends": ["trend1"],
  "recommendedSkills": ["skill1"]
}

IMPORTANT:
- No markdown
- No extra text
- No trailing commas
`;

        let insights;

        try {
          // 🔥 AI call (same structure as your project)
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
          });

          const text = response.text;

          if (!text) throw new Error("Empty AI response");

          const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          insights = JSON.parse(cleaned);

          // ✅ Basic validation
          if (
            !insights.salaryRanges ||
            !insights.topSkills ||
            !insights.keyTrends
          ) {
            throw new Error("Invalid AI structure");
          }
        } catch (err) {
          console.error(`❌ AI failed for ${industry}`, err);

          // 🔥 fallback (VERY IMPORTANT)
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

        // 🔹 3. Update DB safely
        await prisma.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(`✅ Updated ${industry}`);
      });
    }
  },
);
