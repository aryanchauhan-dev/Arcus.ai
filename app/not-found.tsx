import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      role="main"
      aria-label="404 - Page not found"
    >
      <h1 className="text-6xl font-bold gradient-title mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>

      <p className="text-muted-foreground mb-8 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>

      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
