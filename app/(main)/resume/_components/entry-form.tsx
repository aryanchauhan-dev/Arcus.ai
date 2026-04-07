"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { entrySchema } from "@/schemas/entry-schema";
import { Sparkles, PlusCircle, X, Loader2 } from "lucide-react";
import { improveWithAI, saveResume } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

// =======================
// 🔹 HELPERS
// =======================

const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

// =======================
// COMPONENT
// =======================

export function EntryForm({ type, entries, onChange }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const current = watch("current");

  // =======================
  // ADD ENTRY
  // =======================

  const handleAdd = handleSubmit(async (data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current
        ? ""
        : data.endDate
        ? formatDisplayDate(data.endDate)
        : "",
    };

    const updatedEntries = [...entries, formattedEntry];

    onChange(updatedEntries);

    reset();
    setIsAdding(false);
  });

  // =======================
  // DELETE ENTRY
  // =======================

  const handleDelete = (index: number) => {
    const updatedEntries = entries.filter((_: any, i: number) => i !== index);
    onChange(updatedEntries);
  };

  // =======================
  // AI IMPROVE
  // =======================

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  useEffect(() => {
    if (improvedContent) {
      setValue("description", improvedContent);
      toast.success("Improved ✨");
    }
    if (improveError) {
      toast.error("AI failed");
    }
  }, [improvedContent, improveError, setValue]);

  const handleImprove = async () => {
    const description = watch("description");

    if (!description) {
      toast.error("Enter description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(),
    });
  };

  // =======================
  // UI
  // =======================

  return (
    <div className="space-y-4">
      {/* LIST */}
      {entries.map((item: any, index: number) => (
        <Card key={index}>
          <CardHeader className="flex justify-between">
            <CardTitle className="text-sm font-medium">
              {item.title} | {item.organization}
            </CardTitle>

            <Button
              size="icon"
              variant="outline"
              onClick={() => handleDelete(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              {item.startDate} – {item.current ? "Present" : item.endDate}
            </p>

            {/* 🔥 BULLET PREVIEW */}
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {item.description
                ?.split("\n")
                .filter(Boolean)
                .map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {/* ADD FORM */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Title (e.g. Software Engineer | React, Node.js)"
              {...register("title")}
            />

            <Input
              placeholder="Organization (e.g. Google / Personal Project)"
              {...register("organization")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input type="month" {...register("startDate")} />
              <Input type="month" {...register("endDate")} disabled={current} />
            </div>

            <Textarea
              placeholder={`Write achievements (each in new line):
Built scalable system
Reduced latency by 30%
Implemented JWT auth`}
              className="h-32"
              {...register("description")}
            />

            {/* AI BUTTON */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleImprove}
              disabled={isImproving}
            >
              {isImproving ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Improve with AI
            </Button>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>

            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Entry"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add {type}
        </Button>
      )}
    </div>
  );
}