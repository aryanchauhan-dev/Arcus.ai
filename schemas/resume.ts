import { z } from "zod";

// 🔹 Contact Schema
export const contactSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  mobile: z.string().optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// 🔹 Entry Schema (IMPORTANT FIX)
export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean(),
  })
  .refine(
    (data) => {
      // 🔥 core logic
      if (!data.current && !data.endDate) return false;
      return true;
    },
    {
      message: "End date is required if not current",
      path: ["endDate"],
    }
  );

// 🔹 Resume Schema (FINAL)
export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema).default([]),
  education: z.array(entrySchema).default([]),
  projects: z.array(entrySchema).default([]),
});