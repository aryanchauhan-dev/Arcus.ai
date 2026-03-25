"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

const HeroSection = ({ isLoggedIn }: HeroSectionProps) => {
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10 space-y-16">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-medium shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI-Powered Career Intelligence</span>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title">
            Build the Career
            <br />
            You Actually Want
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
            Your next career move starts here — personalized guidance, smarter
            resumes, and interview prep powered by AI.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

          {/* Redirects based on login state */}
          <Link href={isLoggedIn ? "/dashboard" : "/sign-in"}>
            <Button
              size="lg"
              className="px-7 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started Free
            </Button>
          </Link>

          <Link href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="px-7 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Show different micro-copy based on state */}
        <p className="text-sm text-muted-foreground">
          {isLoggedIn ? (
            <>Welcome back — <span className="text-foreground font-medium">continue your journey</span></>
          ) : (
            <>Join <span className="text-foreground font-medium">10,000+</span> professionals growing their careers with AI</>
          )}
        </p>
      </div>

      <div className="hero-image-wrapper mt-5 md:mt-0">
        <div ref={imageRef} className="hero-image">
          <Image
            src="/banner.jpeg"
            width={1280}
            height={720}
            alt="AI career coach dashboard preview"
            className="rounded-lg shadow-2xl border mx-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;