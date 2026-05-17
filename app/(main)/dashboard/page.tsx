import { Loader2 } from "lucide-react";
import { getIndustryInsights } from "@/lib/get-insights";
import { isFallbackInsight } from "@/lib/insight-utils";
import { getUserOnboardingStatus } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {

  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  let insights;
  try {
    insights = await getIndustryInsights();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized" || message === "Session expired") {
      redirect("/sign-in?callbackUrl=/dashboard");
    }
    if (message === "User industry not set") {
      redirect("/onboarding");
    }
    throw error;
  }

  if (isFallbackInsight(insights)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">
            Generating your industry insights...
          </p>
          <p className="text-sm text-muted-foreground">
            This takes a moment on first load. Refresh in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return <DashboardView insights={insights} />;
};

export default IndustryInsightsPage;