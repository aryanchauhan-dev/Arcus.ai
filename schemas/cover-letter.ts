import { z } from "zod";

export const TONE_OPTIONS = [
  { value: "professional", label: "Professional", description: "Formal and business-appropriate" },
  { value: "creative", label: "Creative", description: "Engaging and distinctive" },
  { value: "concise", label: "Concise", description: "Brief and direct — under 250 words" },
  { value: "enthusiastic", label: "Enthusiastic", description: "Energetic and passionate" },
] as const;

export type Tone = typeof TONE_OPTIONS[number]["value"];

export const coverLetterSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required").max(100),
  companyName: z.string().min(1, "Company name is required").max(100),
  jobDescription: z.string().max(5000).optional(),
  tone: z.enum(["professional", "creative", "concise", "enthusiastic"])
    .default("professional"),
});