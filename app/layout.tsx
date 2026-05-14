import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),

  title: {
    default: "Arcus.ai — AI-Powered Career Intelligence",
    template: "%s | Arcus.ai",
  },
  description:
    "Build the career you actually want with AI-powered resume tools, interview prep, and personalized career guidance.",

  openGraph: {
    title: "Arcus.ai — AI-Powered Career Intelligence",
    description:
      "Build the career you actually want with AI-powered resume tools, interview prep, and personalized career guidance.",
    type: "website",
    siteName: "Arcus.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arcus.ai — AI-Powered Career Intelligence",
    description:
      "Build the career you actually want with AI-powered resume tools, interview prep, and personalized career guidance.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen pt-20">{children}</main>
          <footer className="bg-muted/50 py-12" aria-label="Site footer">
            <div className="container mx-auto px-4 text-center text-muted-foreground">
              <p>
                ✨ Made with passion and creativity 💖 — Made by Aryan Chauhan
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
