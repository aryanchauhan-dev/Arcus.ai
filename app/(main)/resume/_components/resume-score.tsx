"use client";

import { useEffect, useState } from "react";
import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ResumeAnalysis } from "@/schemas/resume.schema";

function ATSGauge({ score }: { score: number }) {
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        const duration = 1200;
        const steps = 60;
        const inc = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += inc;
            if (current >= score) {
                setDisplayed(score);
                clearInterval(timer);
            } else {
                setDisplayed(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    const size = 180;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayed / 100) * circumference;

    const color =
        score >= 70 ? "#22c55e" :
            score >= 50 ? "#eab308" :
                "#ef4444";

    const label =
        score >= 70 ? "ATS Ready" :
            score >= 50 ? "Needs Work" :
                "Needs Major Work";

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <svg
                    width={size}
                    height={size}
                    className="-rotate-90"
                    aria-label={`ATS Score: ${score} out of 100`}
                    role="img"
                >
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted/20"
                    />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 0.05s linear" }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color }}>
                        {displayed}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
            </div>

            <div className="text-center">
                <Badge
                    className={cn(
                        "text-sm font-medium",
                        score >= 70 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                            score >= 50 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                "bg-red-500/10 text-red-600 border-red-500/20",
                    )}
                >
                    {label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">ATS Score</p>
            </div>
        </div>
    );
}

function StatCell({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-4">
                <p className={cn("text-2xl font-bold", color)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
        </Card>
    );
}

export default function ResumeScore({
    analysis,
}: {
    analysis: ResumeAnalysis;
}) {
    const { atsScore, experienceLevel, skillsMatch, topKeywordsFound } = analysis;

    const expColor =
        experienceLevel === "Senior" || experienceLevel === "Executive"
            ? "text-green-500"
            : experienceLevel === "Mid"
                ? "text-blue-500"
                : "text-yellow-500";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Card className="flex items-center justify-center py-6">
                <ATSGauge score={atsScore} />
            </Card>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">

                <StatCell
                    label="Experience Level"
                    value={experienceLevel}
                    color={expColor}
                />

                {skillsMatch !== undefined ? (
                    <StatCell
                        label="Job Match Score"
                        value={`${skillsMatch}%`}
                        color={
                            skillsMatch >= 70 ? "text-green-500" :
                                skillsMatch >= 50 ? "text-yellow-500" :
                                    "text-red-500"
                        }
                    />
                ) : (
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-2xl font-bold text-muted-foreground">—</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Job Match Score
                            </p>
                            <p className="text-xs text-primary mt-1">Add job description</p>
                        </CardContent>
                    </Card>
                )}

                <Card className="col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Strong Keywords Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topKeywordsFound.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {topKeywordsFound.map((kw) => (
                                    <Badge key={kw} variant="secondary" className="text-xs">
                                        ✓ {kw}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                No strong ATS keywords detected
                            </p>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}