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
  LineChart,
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

// =======================
// 🔥 TYPES (IMPORTANT)
// =======================

type SalaryRange = {
  role: string;
  min: number;
  max: number;
  median: number;
  location: string;
};

type Insights = {
  salaryRanges?: SalaryRange[];
  growthRate?: number;
  demandLevel?: "HIGH" | "MEDIUM" | "LOW";
  marketOutlook?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  topSkills?: string[];
  keyTrends?: string[];
  recommendedSkills?: string[];
  nextUpdate?: string | Date;
};

// =======================
// COMPONENT
// =======================

const DashboardView = ({ insights }: { insights: Insights }) => {
  const safeInsights = insights || {};

  const salaryRanges = safeInsights.salaryRanges || [];
  const topSkills = safeInsights.topSkills || [];
  const keyTrends = safeInsights.keyTrends || [];
  const recommendedSkills = safeInsights.recommendedSkills || [];

  // 🔥 Transform salary data safely
  const salaryData = salaryRanges.map((range) => ({
    name: range.role,
    min: (range.min || 0) / 1000,
    max: (range.max || 0) / 1000,
    median: (range.median || 0) / 1000,
  }));

  const getDemandLevelColor = (level: string = "medium") => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook: string = "neutral") => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const outlookInfo = getMarketOutlookInfo(
    safeInsights.marketOutlook || "neutral"
  );
  const OutlookIcon = outlookInfo.icon;
  const outlookColor = outlookInfo.color;

  // 🔥 Date handling
  const lastUpdatedDate = safeInsights.nextUpdate
    ? format(new Date(safeInsights.nextUpdate), "dd/MM/yyyy")
    : "N/A";

  const nextUpdateDistance = safeInsights.nextUpdate
    ? formatDistanceToNow(new Date(safeInsights.nextUpdate), {
        addSuffix: true,
      })
    : "N/A";

  const growthRate = safeInsights.growthRate ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Last updated: {lastUpdatedDate}</Badge>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Market Outlook</CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeInsights.marketOutlook || "N/A"}
            </div>
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
            <div className="text-2xl font-bold">
              {growthRate.toFixed(1)}%
            </div>
            <Progress value={growthRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeInsights.demandLevel || "N/A"}
            </div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                safeInsights.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {topSkills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>Values in thousands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-100 relative z-10">
            <ResponsiveContainer>
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="min" name="Min" fill="#94a3b8" />
                <Bar dataKey="median" name="Median" fill="#3b82f6" />
                <Bar dataKey="max" name="Max" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyTrends.map((t: string, i: number) => (
                <li key={i}>• {t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {recommendedSkills.map((s: string) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;