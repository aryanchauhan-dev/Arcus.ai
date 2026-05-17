import { z } from "zod";

export const coverLetterSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name is too long"),

  jobTitle: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title is too long"),

  jobDescription: z
    .string()
    .trim()
    .max(5000, "Job description is too long")
    .optional()
    .or(z.literal("")),
});

export type CoverLetterInput = z.infer<typeof coverLetterSchema>;