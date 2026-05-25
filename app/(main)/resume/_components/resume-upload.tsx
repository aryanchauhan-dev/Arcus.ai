"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileText, X, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
    onAnalyze: (formData: FormData) => void;
    loading: boolean;
    industry?: string;
};

const MAX_SIZE_MB = 10;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export default function ResumeUpload({ onAnalyze, loading, industry }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateAndSetFile = useCallback((selected: File | null) => {
        setFileError(null);
        if (!selected) return;

        if (selected.type !== "application/pdf") {
            setFileError("Only PDF files are supported");
            return;
        }
        if (selected.size > MAX_SIZE) {
            setFileError(`File too large — maximum ${MAX_SIZE_MB}MB`);
            return;
        }
        setFile(selected);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0] ?? null;
        validateAndSetFile(dropped);
    }, [validateAndSetFile]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            validateAndSetFile(e.target.files?.[0] ?? null);
        },
        [validateAndSetFile],
    );

    const handleRemoveFile = () => {
        setFile(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData(e.currentTarget);
        formData.set("resume", file);
        onAnalyze(formData);
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {industry && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <Briefcase className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">
                        Analysis will be tailored for the{" "}
                        <span className="font-medium text-foreground">{industry}</span>{" "}
                        industry based on your profile.
                    </span>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Upload Resume</CardTitle>
                    <CardDescription>PDF format only · Max {MAX_SIZE_MB}MB</CardDescription>
                </CardHeader>
                <CardContent>
                    {file ? (
                        <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">PDF</Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveFile}
                                aria-label="Remove file"
                                className="shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 cursor-pointer transition-colors",
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                            )}
                            role="button"
                            tabIndex={0}
                            aria-label="Upload PDF resume"
                            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                        >
                            <div className={cn(
                                "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                                isDragging ? "bg-primary/20" : "bg-muted",
                            )}>
                                <Upload className={cn(
                                    "h-6 w-6 transition-colors",
                                    isDragging ? "text-primary" : "text-muted-foreground",
                                )} />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-sm">
                                    {isDragging ? "Drop your resume here" : "Drag & drop your resume"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    or <span className="text-primary underline">click to browse</span>
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">PDF · Max {MAX_SIZE_MB}MB</p>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        name="resume"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-label="Resume file input"
                    />

                    {fileError && (
                        <p role="alert" className="text-sm text-red-500 mt-2">
                            {fileError}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Job Description
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            (optional but recommended)
                        </span>
                    </CardTitle>
                    <CardDescription>
                        Paste the job description to get a tailored match score and keyword analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="jobDescription" className="sr-only">Job Description</Label>
                    <Textarea
                        id="jobDescription"
                        name="jobDescription"
                        placeholder="Paste the job description here to see how well your resume matches..."
                        className="min-h-35 resize-y"
                    />
                </CardContent>
            </Card>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!file || loading}
                aria-busy={loading}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Analyzing Resume...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Analyze Resume
                    </span>
                )}
            </Button>

        </form>
    );
}