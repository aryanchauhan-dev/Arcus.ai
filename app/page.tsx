import type { Metadata } from "next";
import HeroSection from "@/components/hero";
import { features } from "@/data/features";
import { Card, CardContent } from "@/components/ui/card";
import { howItWorks } from "@/data/howItWorks";
import { faqs } from "@/data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const payload = accessToken ? await verifyToken(accessToken) : null;
  const isLoggedIn = !!payload;

  return (
    <>
      <div className="grid-background" aria-hidden="true" />

      <HeroSection isLoggedIn={isLoggedIn} />

      <section
        aria-label="Features"
        className="w-full py-12 md:py-24 lg:py-32 bg-background/60"
      >
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            Powerful Features for Your Career Growth
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-2 hover:border-primary transition-colors duration-300"
              >
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  {feature.icon}
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Statistics"
        className="w-full py-12 md:py-24 bg-muted/50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { value: "50+", label: "Industries Covered" },
              { value: "1000+", label: "Interview Questions" },
              { value: "40+", label: "Resume Templates Generated" },
              { value: "24/7", label: "AI Career Insights" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center space-y-2">
                <p className="text-4xl font-bold">{value}</p>
                <p className="text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-label="How it works"
        className="w-full py-12 md:py-24 lg:py-32 bg-background/60"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Four simple steps to accelerate your career growth
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((info) => (
              <div
                key={info.title}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {info.icon}
                </div>
                <h3 className="font-semibold text-xl">{info.title}</h3>
                <p className="text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Frequently asked questions"
        className="w-full py-12 md:py-24 lg:py-32 bg-background/60"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about our platform
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section aria-label="Call to action" className="w-full">
        <div className="w-full gradient py-16">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-2xl text-primary-foreground/80 mt-4">
              Level up your career preparation with AI-powered tools.
            </p>

            <Button asChild size="lg" variant="secondary" className="mt-6">
              <Link href={isLoggedIn ? "/dashboard" : "/sign-in"}>
                {isLoggedIn ? "Go to Dashboard" : "Start Your Journey Today"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
