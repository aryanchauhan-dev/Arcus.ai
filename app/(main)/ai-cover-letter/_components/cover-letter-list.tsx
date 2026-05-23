"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCoverLetter } from "@/actions/cover-letter";
import type { getCoverLetters } from "@/actions/cover-letter";

type CoverLetter = Awaited<ReturnType<typeof getCoverLetters>>[number];

export default function CoverLetterList({
  coverLetters,
}: {
  coverLetters: CoverLetter[];
}) {
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCoverLetter(id);
      toast.success("Cover letter deleted successfully");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to delete cover letter";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (coverLetters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Cover Letters Yet</CardTitle>
          <CardDescription>
            Create your first AI-powered cover letter to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {coverLetters.map((letter) => {
        const isDeleting = deletingId === letter.id;

        return (
          <Card
            key={letter.id}
            className="group relative transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-xl gradient-title truncate">
                    {letter.jobTitle} at {letter.companyName}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardDescription>
                      {format(new Date(letter.createdAt), "PPP")}
                    </CardDescription>
                    <Badge variant="secondary" className="text-xs">
                      {letter.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    aria-label={`View ${letter.jobTitle} cover letter`}
                  >
                    <Link href={`/ai-cover-letter/${letter.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    aria-label={`Edit ${letter.jobTitle} cover letter`}
                  >
                    <Link href={`/ai-cover-letter/${letter.id}?edit=true`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isDeleting}
                        aria-label={`Delete ${letter.jobTitle} cover letter`}
                      >
                        {isDeleting
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your cover letter for{" "}
                          <strong>{letter.jobTitle}</strong> at{" "}
                          <strong>{letter.companyName}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(letter.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </div>
              </div>
            </CardHeader>
            {letter.jobDescription && (
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {letter.jobDescription}
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}