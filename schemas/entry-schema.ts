import { z } from "zod";

// 🔥 YYYY-MM validation (important for date input)
const dateRegex = /^\d{4}-\d{2}$/;

export const entrySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters"),

    organization: z
      .string()
      .trim()
      .min(2, "Organization must be at least 2 characters"),

    startDate: z
      .string()
      .regex(dateRegex, "Invalid date format (YYYY-MM required)"),

    endDate: z
      .string()
      .optional(),

    description: z
      .string()
      .trim()
      .min(20, "Description should be at least 20 characters")
      .max(500, "Keep description concise (max 500 chars)"),

    current: z.boolean().default(false),
  })

  // 🔥 End date validation
  .refine(
    (data) => {
      if (!data.current && !data.endDate) return false;
      return true;
    },
    {
      message: "End date required unless current role",
      path: ["endDate"],
    }
  )

  // 🔥 Date consistency check (VERY IMPORTANT)
  .refine(
    (data) => {
      if (!data.endDate || data.current) return true;

      return data.startDate <= data.endDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );