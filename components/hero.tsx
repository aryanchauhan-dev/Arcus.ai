import { Button } from "./ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HeroImage } from "./hero-image";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

const HeroSection = ({ isLoggedIn }: HeroSectionProps) => {
  const redirectPath = isLoggedIn ? "/dashboard" : "/sign-in";

  return (
    <section className="w-full pt-36 md:pt-48 pb-10 space-y-16">

      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">

          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-medium shadow-sm backdrop-blur-sm">

              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI-Powered Career Intelligence</span>
              <Sparkles className="w-3.5 h-3.5 animate-pulse [animation-delay:600ms]" />
            </div>
          </div>

          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title">
            Build the Career
            <br />
            <span className="block md:inline">You Actually Want</span>
          </h1>

          <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
            Your next career move starts here — personalized guidance, smarter
            resumes, and interview prep powered by AI.
          </p>

        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

          <Link href={redirectPath}>
            <Button
              size="lg"
              className="px-7 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </Link>

          <Link href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="px-7 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              See How It Works
            </Button>
          </Link>

        </div>

        <p className="text-sm text-muted-foreground">
          {isLoggedIn ? (
            <>
              Welcome back —{" "}
              <span className="text-foreground font-medium">
                continue your journey
              </span>
            </>
          ) : (
            <>
              Join{" "}
              <span className="text-foreground font-medium">10,000+</span>{" "}
              professionals growing their careers with AI
            </>
          )}
        </p>
      </div>
      
      <HeroImage />

    </section>
  );
};

export default HeroSection;