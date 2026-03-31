"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/schemas/onboarding.schema";
import { updateUser } from "@/actions/onboarding";

type Props = {
  industries: {
    id: string;
    name: string;
    subIndustries: string[];
  }[];
};

const OnboardingForm = ({ industries }: Props) => {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<any>(null);

  // 🔥 prevent duplicate execution
  const hasHandledResponse = useRef(false);

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
    error,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  const watchIndustry = watch("industry");

  // 🔥 Submit
  const onSubmit = async (values: any) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      await updateUserFn({
        ...values,
        industry: formattedIndustry,
      });
    } catch (err) {
      console.error("Onboarding error:", err);
    }
  };

  // 🔥 Success / Error handling (NO TOAST)
  useEffect(() => {
    if (hasHandledResponse.current) return;

    // ✅ SUCCESS → direct redirect
    if (updateResult && !updateLoading) {
      hasHandledResponse.current = true;
      router.push("/dashboard");
      router.refresh();
    }

    // ❌ ERROR → console only (or later inline UI)
    if (error) {
      hasHandledResponse.current = true;
      console.error("Error:", error);
    }
  }, [updateResult, updateLoading, error, router]);

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* 🔹 Industry */}
            <div className="space-y-2">
              <Label>Industry</Label>

              <Select
                onValueChange={(value) => {
                  setValue("industry", value);

                  const found = industries.find((i) => i.id === value);
                  setSelectedIndustry(found);

                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger>
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
                <p className="text-sm text-red-500">
                  {errors.industry.message as string}
                </p>
              )}
            </div>

            {/* 🔹 Sub Industry */}
            {watchIndustry && (
              <div className="space-y-2">
                <Label>Specialization</Label>

                <Select
                  onValueChange={(value) =>
                    setValue("subIndustry", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>

                      {selectedIndustry?.subIndustries?.map((sub: string) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.subIndustry && (
                  <p className="text-sm text-red-500">
                    {errors.subIndustry.message as string}
                  </p>
                )}
              </div>
            )}

            {/* 🔹 Experience */}
            <div className="space-y-2">
              <Label>Years of Experience</Label>

              <Input
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
              />

              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message as string}
                </p>
              )}
            </div>

            {/* 🔹 Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>

              <Input
                placeholder="e.g., React, Node.js, Python"
                {...register("skills")}
              />

              <p className="text-sm text-muted-foreground">
                Separate with commas
              </p>

              {errors.skills && (
                <p className="text-sm text-red-500">
                  {errors.skills.message as string}
                </p>
              )}
            </div>

            {/* 🔹 Bio */}
            <div className="space-y-2">
              <Label>Professional Bio</Label>

              <Textarea
                placeholder="Tell us about yourself..."
                className="h-28"
                {...register("bio")}
              />

              {errors.bio && (
                <p className="text-sm text-red-500">
                  {errors.bio.message as string}
                </p>
              )}
            </div>

            {/* 🔹 Submit */}
            <Button type="submit" className="w-full" disabled={updateLoading}>
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