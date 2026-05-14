"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export const HeroImage = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        imageElement.classList.toggle("scrolled", window.scrollY > 100);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
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
  );
};