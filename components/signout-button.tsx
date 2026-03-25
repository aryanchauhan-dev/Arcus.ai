"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "outline" | "destructive";
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

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
      router.refresh(); // forces header to re-render and switch back to Sign In
    } catch {
      console.error("Sign out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {showIcon && <LogOut className="w-4 h-4 mr-2" />}
          Sign Out
        </>
      )}
    </Button>
  );
}