import type { Metadata } from "next";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Complete Your Profile",
};

const OnboardingPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) redirect("/dashboard");

  return <OnboardingForm industries={industries} />;
};

export default OnboardingPage;