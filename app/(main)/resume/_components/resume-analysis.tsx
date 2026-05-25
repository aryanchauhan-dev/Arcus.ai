"use client";

import { CheckCircle2, XCircle, Lightbulb, AlertTriangle } from "lucide-react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ResumeAnalysis } from "@/schemas/resume.schema";

export default function ResumeAnalysis({
    analysis,
}: {
    analysis: ResumeAnalysis;
}) {
    const {
        summary,
        strengths,
        weaknesses,
        missingKeywords,
        suggestions,
    } = analysis;

    return (
        <div className="space-y-4">

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Overall Assessment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {summary}
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">

                <Card className="border-green-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Strengths
                        </CardTitle>
                        <CardDescription>What your resume does well</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {strengths.map((s) => (
                                    <li key={s} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No strengths identified</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-red-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-red-600">
                            <XCircle className="h-4 w-4" />
                            Areas to Improve
                        </CardTitle>
                        <CardDescription>Issues that may hurt your ATS score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weaknesses.length > 0 ? (
                            <ul className="space-y-2">
                                {weaknesses.map((w) => (
                                    <li key={w} className="flex items-start gap-2 text-sm">
                                        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                        <span>{w}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No major issues found</p>
                        )}
                    </CardContent>
                </Card>

            </div>

            <div className="grid md:grid-cols-2 gap-4">

                <Card className="border-yellow-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            Missing Keywords
                        </CardTitle>
                        <CardDescription>
                            Add these terms to improve ATS matching
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {missingKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {missingKeywords.map((kw) => (
                                    <Badge
                                        key={kw}
                                        variant="outline"
                                        className="border-yellow-500/40 text-yellow-600 bg-yellow-500/5 text-xs"
                                    >
                                        + {kw}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No critical missing keywords detected
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            Actionable Suggestions
                        </CardTitle>
                        <CardDescription>
                            Steps to improve your resume score
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {suggestions.length > 0 ? (
                            <ul className="space-y-3">
                                {suggestions.map((s, i) => (
                                    <li key={s} className="flex items-start gap-3 text-sm">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {i + 1}
                                        </span>
                                        <span className="leading-relaxed">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No specific suggestions available
                            </p>
                        )}
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}