"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { generateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema, TONE_OPTIONS } from "@/schemas/cover-letter";

type FormInput = z.input<typeof coverLetterSchema>;
type FormOutput = z.output<typeof coverLetterSchema>;

type CoverLetterResponse = Awaited<ReturnType<typeof generateCoverLetter>>;
type GenerateArgs = Parameters<typeof generateCoverLetter>;

type UserProfile = {
  name?: string | null;
  industry?: string | null;
  experience?: number | null;
  skills?: string[];
  bio?: string | null;
};

type Props = {
  userProfile?: UserProfile;
};

export default function CoverLetterGenerator({ userProfile }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: { tone: "professional" },
  });

  const selectedTone = watch("tone");

  const {
    loading: generating,
    fn: generateLetterFn,
  } = useFetch<CoverLetterResponse, GenerateArgs>(generateCoverLetter);

  const onSubmit = async (data: FormOutput) => {
    try {
      const result = await generateLetterFn(data);
      if (result) {
        toast.success("Cover letter generated successfully!");
        router.push(`/ai-cover-letter/${result.id}`);
        reset();
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to generate cover letter";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {userProfile && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile data used for generation
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {userProfile.industry && (
                <div>
                  <span className="text-muted-foreground">Industry: </span>
                  <span className="font-medium">{userProfile.industry}</span>
                </div>
              )}
              {userProfile.experience != null && (
                <div>
                  <span className="text-muted-foreground">Experience: </span>
                  <span className="font-medium">{userProfile.experience} years</span>
                </div>
              )}
            </div>
            {userProfile.bio && (
              <div>
                <span className="text-muted-foreground">Bio: </span>
                <span className="font-medium line-clamp-2">{userProfile.bio}</span>
              </div>
            )}
            {userProfile.skills && userProfile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {userProfile.skills.slice(0, 8).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {userProfile.skills.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{userProfile.skills.length - 8} more
                  </Badge>
                )}
              </div>
            )}
            {!userProfile.industry && !userProfile.bio && !userProfile.skills?.length && (
              <p className="text-xs text-muted-foreground">
                Complete your profile for a more personalized cover letter.
              </p>
            )}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide information about the position you&apos;re applying for
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  aria-invalid={!!errors.companyName}
                  aria-describedby={errors.companyName ? "company-error" : undefined}
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p id="company-error" role="alert" className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title"
                  aria-invalid={!!errors.jobTitle}
                  aria-describedby={errors.jobTitle ? "title-error" : undefined}
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <p id="title-error" role="alert" className="text-sm text-red-500">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Writing Tone</Label>
              <Select
                value={selectedTone ?? "professional"}
                onValueChange={(value) =>
                  setValue("tone", value as FormInput["tone"], { shouldValidate: true })
                }
              >
                <SelectTrigger id="tone" className="w-full">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tone && (
                <p role="alert" className="text-sm text-red-500">
                  {errors.tone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">
                Job Description
                <span className="text-muted-foreground text-xs ml-1">
                  (optional but recommended)
                </span>
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here for a more tailored cover letter..."
                className="h-32"
                aria-invalid={!!errors.jobDescription}
                aria-describedby={errors.jobDescription ? "desc-error" : undefined}
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p id="desc-error" role="alert" className="text-sm text-red-500">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={generating} aria-busy={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}