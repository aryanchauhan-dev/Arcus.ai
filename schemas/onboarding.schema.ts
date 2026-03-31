import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z
    .string()
    .min(1, "Industry is required"),

  subIndustry: z
    .string()
    .min(1, "Specialization is required"),

  experience: z
    .coerce
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience too large"),

  skills: z
    .string()
    .min(1, "At least one skill is required")
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),

  bio: z
    .string()
    .max(500, "Bio too long")
    .optional(),
});

// 🔥 Type inference (VERY IMPORTANT)
export type OnboardingFormData = z.infer<typeof onboardingSchema>;