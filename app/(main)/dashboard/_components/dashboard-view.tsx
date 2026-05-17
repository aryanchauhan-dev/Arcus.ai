"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Brain,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import type { InsightData } from "@/lib/insight-utils";


function getDemandLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case "high": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-red-500";
    default: return "bg-gray-500";
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

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

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
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
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

const DashboardView = ({ insights }: { insights: InsightData }) => {
  const {
    salaryRanges,
    topSkills,
    keyTrends,
    recommendedSkills,
    growthRate,
    demandLevel,
    marketOutlook,
    updatedAt,
    nextUpdate,
  } = insights;

  const salaryData = salaryRanges.map((range) => ({
    name: range.role,
    min: (range.min ?? 0) / 1000,
    max: (range.max ?? 0) / 1000,
    median: (range.median ?? 0) / 1000,
  }));

  const outlookInfo = getMarketOutlookInfo(marketOutlook);
  const OutlookIcon = outlookInfo.icon;

  const lastUpdatedDate = format(new Date(updatedAt), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(new Date(nextUpdate), {
    addSuffix: true,
  });

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <Badge variant="outline">Last updated: {lastUpdatedDate}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Market Outlook</CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookInfo.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketOutlook}</div>
            <p className="text-xs text-muted-foreground">
              Next update {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Industry Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthRate.toFixed(1)}%</div>
            <Progress value={growthRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demandLevel}</div>
            <div className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(demandLevel)}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {topSkills.length > 0 ? (
                topSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No skills data</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>Values in thousands (USD)</CardDescription>
        </CardHeader>
        <CardContent>
          {salaryData.length === 0 ? (
            <div className="flex items-center justify-center h-100 text-muted-foreground text-sm">
              No salary data available yet.
            </div>
          ) : (
            <div className="h-100 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salaryData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(v) => `$${v}k`}
                  />
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
          </CardHeader>
          <CardContent>
            {keyTrends.length > 0 ? (
              <ul className="space-y-2">
                {/* ✅ Fix #4 — trend type inferred from InsightData.keyTrends: string[] */}
                {keyTrends.map((trend) => (
                  <li key={trend} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{trend}</span>
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
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {recommendedSkills.length > 0 ? (
              recommendedSkills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recommendations yet.
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default DashboardView;