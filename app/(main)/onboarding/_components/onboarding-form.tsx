"use client";

import { industries } from "@/data/industries";
import { useForm } from "react-hook-form";
import { onboardingSchema } from "@/schemas/onboarding.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type Industry = (typeof industries)[number];

type Props = {
  industries: Industry[];
};

const OnboardingForm = ({ industries }: Props) => {
  useForm({
    resolver: zodResolver(onboardingSchema),
  });
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle >Complete Your Profile</CardTitle>
          <CardDescription>Select Your Industry to get personalized career insights and recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="">
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
