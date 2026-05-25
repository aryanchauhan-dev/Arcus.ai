"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeResume } from "@/actions/resume";
import type { ResumeAnalysis } from "@/schemas/resume.schema";
import ResumeUpload from "./resume-upload";
import ResumeScore from "./resume-score";
import ResumeAnalysisView from "./resume-analysis";
import ResumeSkeleton from "./resume-skeleton";

type Props = {
    industry?: string;
};

export default function ResumeAnalyzer({ industry }: Props) {
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleAnalyze = (formData: FormData) => {
        startTransition(async () => {
            try {
                const result = await analyzeResume(formData);
                setAnalysis(result);
            } catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : "Failed to analyze resume";
                toast.error(message);
            }
        });
    };

    const handleReset = () => setAnalysis(null);

    if (isPending) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Analyzing your resume...</p>
                        <p className="text-xs text-muted-foreground">
                            Gemini is reading your PDF and generating insights
                        </p>
                    </div>
                </div>
                <ResumeSkeleton />
            </div>
        );
    }

    if (analysis) {
        return (
            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Analysis Complete</h2>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-1.5" />
                        Analyze Another
                    </Button>
                </div>

                <ResumeScore analysis={analysis} />

                <ResumeAnalysisView analysis={analysis} />

            </div>
        );
    }

    return (
        <ResumeUpload
            onAnalyze={handleAnalyze}
            loading={isPending}
            {...(industry ? { industry } : {})}
        />
    );
}