"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deleteCoverLetter } from "@/actions/cover-letter";

// =======================
// 🔹 TYPES
// =======================

type CoverLetter = {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription?: string | null;
  createdAt: string | Date;
};

type Props = {
  coverLetters: CoverLetter[];
};

// =======================
// 🔹 COMPONENT
// =======================

export default function CoverLetterList({ coverLetters }: Props) {
  const router = useRouter();

  // =======================
  // 🔹 HANDLERS
  // =======================

  const handleDelete = async (id: string) => {
    try {
      await deleteCoverLetter(id);
      toast.success("Cover letter deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete cover letter");
    }
  };

  const handleView = (id: string) => {
    router.push(`/ai-cover-letter/${id}`);
  };

  // =======================
  // 🔹 EMPTY STATE
  // =======================

  if (!coverLetters?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Cover Letters Yet</CardTitle>
          <CardDescription>
            Create your first cover letter to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // =======================
  // 🔹 UI
  // =======================

  return (
    <div className="space-y-4">
      {coverLetters.map((letter) => (
        <Card key={letter.id} className="group relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              {/* LEFT */}
              <div>
                <CardTitle className="text-xl gradient-title">
                  {letter.jobTitle} at {letter.companyName}
                </CardTitle>

                <CardDescription>
                  Created{" "}
                  {format(new Date(letter.createdAt), "PPP")}
                </CardDescription>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex space-x-2">
                {/* VIEW */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleView(letter.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* DELETE */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete Cover Letter?
                      </AlertDialogTitle>

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

          {/* DESCRIPTION */}
          {letter.jobDescription && (
            <CardContent>
              <div className="text-muted-foreground text-sm line-clamp-3">
                {letter.jobDescription}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}