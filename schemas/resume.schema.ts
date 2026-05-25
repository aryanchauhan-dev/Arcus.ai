import { z } from "zod";

export const ResumeInputSchema = z.object({
    jobDescription: z.string().max(5000).optional(),
});

export const ResumeAnalysisSchema = z.object({
    atsScore: z.number().min(0).max(100),
    summary: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    suggestions: z.array(z.string()),
    topKeywordsFound: z.array(z.string()),
    experienceLevel: z.enum(["Entry", "Mid", "Senior", "Executive"]),
    skillsMatch: z.number().min(0).max(100).optional(),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;