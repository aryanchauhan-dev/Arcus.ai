import { z } from "zod";
import type { DemandLevel, MarketOutlook } from "@prisma/client";

export type SalaryRange = {
    role: string;
    min: number;
    max: number;
    median: number;
    location: string;
};

export type InsightData = {
    id: string;
    cacheKey: string;
    industry: string;
    salaryRanges: SalaryRange[];
    growthRate: number;
    demandLevel: DemandLevel;
    marketOutlook: MarketOutlook;
    topSkills: string[];
    keyTrends: string[];
    recommendedSkills: string[];
    nextUpdate: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type PrismaInsightRecord = {
    id: string;
    cacheKey: string;
    industry: string;
    salaryRanges: unknown;
    growthRate: number;
    demandLevel: DemandLevel;
    marketOutlook: MarketOutlook;
    topSkills: unknown;
    keyTrends: unknown;
    recommendedSkills: unknown;
    nextUpdate: Date;
    createdAt: Date;
    updatedAt: Date;
};

export const AIInsightSchema = z.object({
    salaryRanges: z.array(z.object({
        role: z.string(),
        min: z.number(),
        max: z.number(),
        median: z.number(),
        location: z.string(),
    })),
    growthRate: z.number(),
    demandLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
    marketOutlook: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
    topSkills: z.array(z.string()),
    keyTrends: z.array(z.string()),
    recommendedSkills: z.array(z.string()),
});

export type AIInsight = z.infer<typeof AIInsightSchema>;

export function generateCacheKey(industry: string, skills: string[]): string {
    const normalizedIndustry = industry
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s\-&]/g, "");

    const sortedSkills = [...skills]
        .map((s) => s.toLowerCase().trim())
        .filter(Boolean)
        .sort();

    return `${normalizedIndustry}:${sortedSkills.join(",")}`;
}

export function transformInsights(raw: PrismaInsightRecord): InsightData {
    const salaryRanges: SalaryRange[] = Array.isArray(raw.salaryRanges)
        ? (raw.salaryRanges as Record<string, unknown>[]).map((item) => ({
            role: String(item?.role ?? ""),
            min: Number(item?.min ?? 0),
            max: Number(item?.max ?? 0),
            median: Number(item?.median ?? 0),
            location: String(item?.location ?? ""),
        }))
        : [];

    const toStringArray = (val: unknown): string[] =>
        Array.isArray(val) ? (val as string[]) : [];

    return {
        ...raw,
        salaryRanges,
        topSkills: toStringArray(raw.topSkills),
        keyTrends: toStringArray(raw.keyTrends),
        recommendedSkills: toStringArray(raw.recommendedSkills),
    };
}

export function getFallbackInsights(): InsightData {
    const now = new Date();
    return {
        id: "",
        cacheKey: "",
        industry: "",
        salaryRanges: [],
        growthRate: 0,
        demandLevel: "MEDIUM",
        marketOutlook: "NEUTRAL",
        topSkills: [],
        keyTrends: [],
        recommendedSkills: [],
        nextUpdate: now,
        createdAt: now,
        updatedAt: now,
    };
}

export function isFallbackInsight(insight: InsightData): boolean {
    return (
        insight.id === "" &&
        insight.cacheKey === "" &&
        insight.salaryRanges.length === 0 &&
        insight.topSkills.length === 0
    );
}