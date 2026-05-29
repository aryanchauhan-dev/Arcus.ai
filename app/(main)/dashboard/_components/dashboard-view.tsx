"use client";

import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon, LineChart as LineChartIcon,
  TrendingUp, TrendingDown, Brain,
  CheckCircle2, AlertCircle, XCircle, Sparkles,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { InsightData } from "@/lib/insight-utils";

function getDemandColor(level: string): string {
  switch (level.toLowerCase()) {
    case "high": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

function getDemandPercent(level: string): number {
  switch (level.toLowerCase()) {
    case "high": return 90;
    case "medium": return 50;
    case "low": return 20;
    default: return 0;
  }
}

function getMarketOutlookInfo(outlook: string) {
  switch (outlook.toLowerCase()) {
    case "positive": return { icon: TrendingUp, color: "text-green-500" };
    case "neutral": return { icon: LineChartIcon, color: "text-yellow-500" };
    case "negative": return { icon: TrendingDown, color: "text-red-500" };
    default: return { icon: LineChartIcon, color: "text-gray-500" };
  }
}

function getFreshnessInfo(nextUpdate: Date) {
  const days = differenceInDays(new Date(nextUpdate), new Date());
  if (days >= 5) return { label: "Fresh", dot: "bg-green-500", color: "text-green-500" };
  if (days >= 2) return { label: "Aging", dot: "bg-yellow-500", color: "text-yellow-500" };
  return { label: "Updating soon", dot: "bg-red-500", color: "text-red-500" };
}

interface TooltipEntry { name: string; value: number; color: string; }
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-md text-sm min-w-40">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium text-foreground">
            ${Number(entry.value).toFixed(0)}k
          </span>
        </div>
      ))}
    </div>
  );
}

function SkillsGapCard({
  topSkills,
  recommendedSkills,
  userSkills,
}: {
  topSkills: string[];
  recommendedSkills: string[];
  userSkills: string[];
}) {
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  const hasSkill = (skill: string) =>
    userSkillsLower.includes(skill.toLowerCase());

  const allSkills = [...new Set([...topSkills, ...recommendedSkills])].slice(0, 10);
  if (allSkills.length === 0) return null;

  const haveCount = allSkills.filter(hasSkill).length;
  const coverageRate = Math.round((haveCount / allSkills.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Skills Gap Analysis
            </CardTitle>
            <CardDescription>
              Your skills vs industry requirements
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{coverageRate}%</p>
            <p className="text-xs text-muted-foreground">coverage</p>
          </div>
        </div>
        <Progress value={coverageRate} className="mt-2" />
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {allSkills.map((skill) => {
            const have = hasSkill(skill);
            const isTopSkill = topSkills.includes(skill);

            return (
              <div
                key={skill}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  have ? "bg-green-500/5" : "bg-muted/50",
                )}
              >
                <div className="flex items-center gap-2">
                  {have ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : isTopSkill ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm",
                    have ? "font-medium" : "text-muted-foreground",
                  )}>
                    {skill}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isTopSkill && (
                    <Badge variant="secondary" className="text-xs">In demand</Badge>
                  )}
                  {!isTopSkill && (
                    <Badge variant="outline" className="text-xs">Recommended</Badge>
                  )}
                  {have && (
                    <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      You have this
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardView({
  insights,
  userSkills = [],
}: {
  insights: InsightData;
  userSkills?: string[];
}) {
  const {
    salaryRanges, topSkills, keyTrends, recommendedSkills,
    growthRate, demandLevel, marketOutlook, updatedAt, nextUpdate,
  } = insights;

  const salaryData = salaryRanges.map((range) => ({
    name: range.role,
    min: (range.min ?? 0) / 1000,
    max: (range.max ?? 0) / 1000,
    median: (range.median ?? 0) / 1000,
  }));

  const outlookInfo = getMarketOutlookInfo(marketOutlook);
  const OutlookIcon = outlookInfo.icon;
  const freshness = getFreshnessInfo(new Date(nextUpdate));
  const demandPct = getDemandPercent(demandLevel);
  const lastUpdated = format(new Date(updatedAt), "MMM dd, yyyy");
  const nextUpdateStr = formatDistanceToNow(new Date(nextUpdate), { addSuffix: true });

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline">Last updated: {lastUpdated}</Badge>

        <div className="flex items-center gap-1.5">
          <span className={cn("inline-block h-2 w-2 rounded-full", freshness.dot)} />
          <span className={cn("text-xs font-medium", freshness.color)}>
            {freshness.label}
          </span>
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          Auto-refreshes {nextUpdateStr}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Market Outlook</CardTitle>
            <OutlookIcon className={cn("h-4 w-4", outlookInfo.color)} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", outlookInfo.color)}>
              {marketOutlook}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Updates {nextUpdateStr}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Industry Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              growthRate >= 10 ? "text-green-500" :
                growthRate >= 5 ? "text-yellow-500" : "text-red-500",
            )}>
              {growthRate >= 0 ? "+" : ""}{growthRate.toFixed(1)}%
            </div>
            <Progress value={Math.min(growthRate, 30) * (100 / 30)} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demandLevel}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>LOW</span>
                <span>HIGH</span>
              </div>
              <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    getDemandColor(demandLevel),
                  )}
                  style={{ width: `${demandPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {topSkills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
                {topSkills.length > 5 && (
                  <Badge variant="outline" className="text-xs">+{topSkills.length - 5}</Badge>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No skills data</p>
            )}
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>Values in thousands (USD) · Min / Median / Max</CardDescription>
        </CardHeader>
        <CardContent>
          {salaryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-100 gap-2 text-muted-foreground">
              <BriefcaseIcon className="h-8 w-8 opacity-30" />
              <p className="text-sm">No salary data available for your industry yet.</p>
            </div>
          ) : (
            <div className="h-100 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="min" name="Min" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="median" name="Median" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" name="Max" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Key Trends</CardTitle>
            <CardDescription>What&apos;s shaping the industry now</CardDescription>
          </CardHeader>
          <CardContent>
            {keyTrends.length > 0 ? (
              <ul className="space-y-3">
                {keyTrends.map((trend, i) => (
                  <li key={trend} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{trend}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No trends available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider adding to your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recommendedSkills.map((skill) => (
                  <Badge key={skill} className="cursor-default">{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recommendations yet.</p>
            )}
          </CardContent>
        </Card>

      </div>

      <SkillsGapCard
        topSkills={topSkills}
        recommendedSkills={recommendedSkills}
        userSkills={userSkills}
      />

    </div>
  );
}