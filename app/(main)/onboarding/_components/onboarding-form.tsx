"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/schemas/onboarding.schema";
import { updateUser } from "@/actions/onboarding";

type Industry = {
  id: string;
  name: string;
  subIndustries: string[];
};

type OnboardingInput = z.input<typeof onboardingSchema>;
type OnboardingOutput = z.output<typeof onboardingSchema>;

type Props = {
  industries: Industry[];
};

const OnboardingForm = ({ industries }: Props) => {
  const router = useRouter();

  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { loading: updateLoading, fn: updateUserFn } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OnboardingInput, unknown, OnboardingOutput>({
    resolver: zodResolver(onboardingSchema),
  });

  const watchIndustry = watch("industry");

  const onSubmit = async (values: OnboardingOutput) => {
    setServerError(null);

    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      const result = await updateUserFn({
        ...values,
        industry: formattedIndustry,
        bio: values.bio ?? undefined,
      });

      if (result) {
        router.refresh();
        router.push("/dashboard");
      }

    } catch {
      setServerError("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-background min-h-screen">
      <Card className="w-full max-w-lg mx-2">

        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Fill in your details to get personalized insights.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value, { shouldValidate: true });
                  setSelectedIndustry(
                    industries.find((i) => i.id === value) ?? null
                  );
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry" aria-invalid={!!errors.industry}>
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.industry && (
                <p id="industry-error" role="alert" className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("subIndustry", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="subIndustry" aria-invalid={!!errors.subIndustry}>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries?.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p id="subIndustry-error" role="alert" className="text-sm text-red-500">
                    {errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                aria-invalid={!!errors.experience}
                aria-describedby={errors.experience ? "experience-error" : undefined}
                {...register("experience")}
              />
              {errors.experience && (
                <p id="experience-error" role="alert" className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., React, Node.js, Python"
                aria-invalid={!!errors.skills}
                aria-describedby="skills-hint"
                {...register("skills")}
              />
              <p id="skills-hint" className="text-sm text-muted-foreground">
                Separate with commas
              </p>
              {errors.skills && (
                <p role="alert" className="text-sm text-red-500">
                  {errors.skills.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                className="h-28"
                aria-invalid={!!errors.bio}
                aria-describedby={errors.bio ? "bio-error" : undefined}
                {...register("bio")}
              />
              {errors.bio && (
                <p id="bio-error" role="alert" className="text-sm text-red-500">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                aria-live="polite"
                className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={updateLoading}
              aria-busy={updateLoading}
            >
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;