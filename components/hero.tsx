"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const imageRef = useRef<HTMLImageElement | null>(null);
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
      window.addEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <section className="w-full pt-36 md:pt-48 pb-10 space-y-16">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title">
            Your Personal AI Guide
            <br />
             to Career Growth
          </h1>
          <p className="mx-auto max-w-150 text-muted-foreground md:text-xl">
            Get personalized career guidance, AI-powered resume tools, and interview preparation in one place.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Link href="/dashboard">
            <Button
              size={"lg"}
              className="px-7 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      <div className="hero-image-wrapper mt-5 md:mt-0">
        <div ref={imageRef} className="hero-image">
          <Image
            src={"/banner.jpeg"}
            width={1280}
            height={720}
            alt="Banner Preview"
            className="rounded-lg shadow-2xl border mx-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
