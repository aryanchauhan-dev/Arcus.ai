"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { ResumeAnalysisSchema } from "@/schemas/resume.schema";
import type { ResumeAnalysis } from "@/schemas/resume.schema";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function analyzeResume(
    formData: FormData,
): Promise<ResumeAnalysis> {

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) throw new Error("Unauthorized");

    const payload = await verifyToken(token);
    if (!payload) throw new Error("Session expired");

    const file = formData.get("resume");

    if (!file || !(file instanceof File)) {
        throw new Error("No resume file provided");
    }
    if (file.type !== "application/pdf") {
        throw new Error("Only PDF files are supported");
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large — maximum size is ${MAX_FILE_SIZE_MB}MB`);
    }
    if (file.size === 0) {
        throw new Error("File is empty");
    }

    const jobDescription = formData.get("jobDescription");
    const jobDesc = typeof jobDescription === "string"
        ? jobDescription.slice(0, 5000).trim()
        : "";

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const prompt = `
You are an expert ATS (Applicant Tracking System) specialist and career coach.

Carefully analyze the attached resume PDF and provide a comprehensive evaluation.

${jobDesc
            ? `Target Job Description:\n${jobDesc}\n\nFocus on how well this resume matches the job requirements.`
            : "No specific job description provided — perform a general ATS and quality analysis."
        }

Return ONLY valid JSON in this exact format:
{
  "atsScore": number between 0-100,
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "topKeywordsFound": ["keyword1", "keyword2"],
  "experienceLevel": "Entry" | "Mid" | "Senior" | "Executive",
  ${jobDesc ? '"skillsMatch": number between 0-100,' : ""}
}

SCORING GUIDE:
- 80-100: Excellent ATS compatibility
- 60-79:  Good, minor improvements needed
- 40-59:  Fair, significant gaps
- 0-39:   Poor, major restructuring needed

IMPORTANT:
- Be specific and actionable in suggestions
- Return ONLY the JSON — no markdown, no explanation
- missingKeywords should be industry-relevant terms NOT found in the resume
- topKeywordsFound should list strong keywords already present
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType: "application/pdf",
                            data: base64,
                        },
                    },
                    { text: prompt },
                ],
            },
        ],
    });

    const text = response.text ?? "";
    if (!text.trim()) throw new Error("Empty response from AI");

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

    const validated = ResumeAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
        throw new Error(`AI response validation failed: ${validated.error.message}`);
    }

    return validated.data;
}