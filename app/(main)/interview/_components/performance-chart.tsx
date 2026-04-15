"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { TooltipProps } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { format } from "date-fns";

// =======================
// 🔹 TYPES
// =======================

type Assessment = {
  createdAt: string | Date;
  quizScore: number;
};

type Props = {
  assessments: Assessment[];
};

type ChartData = {
  date: string;
  score: number;
};

// =======================
// 🔹 CUSTOM TOOLTIP
// =======================

function CustomTooltip(props: TooltipProps<number, string>) {
  // 🔥 FIX: override broken recharts types
  const { active, payload } = props as unknown as {
    active?: boolean;
    payload?: {
      payload: ChartData;
    }[];
  };

  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-background border rounded-lg p-2 shadow-md">
      <p className="text-sm font-medium">Score: {data.score}%</p>
      <p className="text-xs text-muted-foreground">{data.date}</p>
    </div>
  );
}

// =======================
// 🔹 MAIN COMPONENT
// =======================

export default function PerformanceChart({ assessments }: Props) {
  // 🔥 Derived data (no state needed)
  const chartData: ChartData[] = assessments.map((assessment) => ({
    date: format(new Date(assessment.createdAt), "MMM dd"),
    score: assessment.quizScore,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-75">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />

              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}