"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod"
import { signUpSchema } from "@/schemas/sign-up.schema";

type SignUpFormValues = z.infer<typeof signUpSchema>;

const getPasswordStrength = (
  p: string
): { label: string; color: string; width: string } => {
  if (p.length === 0) return { label: "", color: "", width: "0%" };
  if (p.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p))
    return { label: "Weak", color: "bg-orange-400", width: "50%" };
  if (!/[^A-Za-z0-9]/.test(p))
    return { label: "Fair", color: "bg-yellow-400", width: "75%" };
  return { label: "Strong", color: "bg-green-500", width: "100%" };
};

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const passwordValue = watch("password");
  const confirmValue = watch("confirm");
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (values: SignUpFormValues) => {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerError("Network error. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        <Card className="border border-border/50 bg-background/80 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Start building the career you actually want
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  className="h-10"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  className="h-10"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password"
                    className="h-10 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password strength bar */}
                {passwordValue.length > 0 && (
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{strength.label}</p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="h-10 pr-10"
                    {...register("confirm")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Confirm match indicator — only show when no zod error yet */}
                {confirmValue.length > 0 && !errors.confirm && (
                  <p className="text-xs text-green-500">Passwords match</p>
                )}
                {errors.confirm && (
                  <p className="text-xs text-red-500">{errors.confirm.message}</p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0">
            <p className="text-sm text-muted-foreground text-center w-full">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}