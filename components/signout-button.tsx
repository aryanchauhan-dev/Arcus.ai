"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import type { ComponentProps } from "react";

interface SignOutButtonProps {
  variant?: ComponentProps<typeof Button>["variant"];
  showIcon?: boolean;
  className?: string;
}

export function SignOutButton({
  variant = "outline",
  showIcon = true,
  className,
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
      });
      router.push("/sign-in");
      router.refresh();
    } catch {
      setError("Sign out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant={variant}
        onClick={handleSignOut}
        disabled={loading}
        className={className}
        aria-busy={loading}
        aria-label={loading ? "Signing out..." : "Sign out"}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Signing out...
          </>
        ) : (
          <>
            {showIcon && <LogOut className="w-4 h-4 mr-2" />}
            Sign Out
          </>
        )}
      </Button>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
