import { z } from "zod";

// 📧 Email
const emailSchema = z
  .string()
  .trim()
  .email({ message: "Enter a valid email address" });

// 🔐 Strong password (for signup)
const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

// 🔐 Basic password (for signin)
const basicPasswordSchema = z
  .string()
  .min(1, "Password is required");


// 📝 Signup (with confirm for UX)
export const signupFrontendSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    email: emailSchema,
    password: strongPasswordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// 🔐 Signin (simple UX validation)
export const signinFrontendSchema = z.object({
  email: emailSchema,
  password: basicPasswordSchema,
});

// 📝 Signup (NO confirm here ❗)
export const signupBackendSchema = z.object({
  name: z.string().trim().min(1),
  email: emailSchema,
  password: strongPasswordSchema, // 🔥 enforce security here
});

// 🔐 Signin (minimal but safe)
export const signinBackendSchema = z.object({
  email: emailSchema,
  password: basicPasswordSchema,
});