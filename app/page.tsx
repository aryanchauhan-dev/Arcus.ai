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
import Header from "@/components/header";
import { cookies } from "next/headers"; // 🔥 IMPORTANT

export default async function Home() {

  // 🔥 STEP 1: Get auth state from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const isLoggedIn = !!accessToken;

  return (
    <div>
      <Header />
      <div className="grid-background" />

      {/* 🔥 STEP 2: Pass to Hero */}
      <HeroSection isLoggedIn={isLoggedIn} />

      {/* Features */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background/60">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            Powerful Features for Your Career Growth
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
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

      {/* Stats */}
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <h3 className="text-4xl font-bold">50+</h3>
              <p className="text-muted-foreground">Industries Covered</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <h3 className="text-4xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Interview Questions</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <h3 className="text-4xl font-bold">40+</h3>
              <p className="text-muted-foreground">Resume Templates Generated</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <h3 className="text-4xl font-bold">24/7</h3>
              <p className="text-muted-foreground">AI Career Insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-background/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Four simple steps to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((info, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-4">
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

      {/* FAQs */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full">
        <div className="w-full gradient py-16">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Ready to Accelerate Your Career?
            </h2>

            <p className="mx-auto max-w-2xl text-primary-foreground/80 mt-4">
              Level up your career preparation with AI-powered tools.
            </p>

            {/* 🔥 CONDITIONAL CTA */}
            <Link href={isLoggedIn ? "/dashboard" : "/sign-in"}>
              <Button size="lg" variant="secondary" className="mt-6">
                {isLoggedIn ? "Go to Dashboard" : "Start Your Journey Today"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}