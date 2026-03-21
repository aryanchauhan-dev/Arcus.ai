import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z.string().min(1, "Please select an Industry"),

  subIndustry: z.string().min(1, "Please select a Specialization"),

  bio: z.string().max(500).optional(),

  experience: z
    .string()
    .min(1, "Experience is required")
    .transform((val) => Number(val))
    .pipe(
      z
        .number()
        .min(0, "Experience must be at least 0")
        .max(50, "Experience cannot exceed 50")
    ),

  skills: z.string().transform((val) =>
    val
      ? val.split(",").map((skill) => skill.trim()).filter(Boolean)
      : []
  ),
});