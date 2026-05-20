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
import type { getAssessments } from "@/actions/interview";

type Assessment = Awaited<ReturnType<typeof getAssessments>>[number];

type ChartData = {
  date: string;
  score: number;
};

function CustomTooltip(props: TooltipProps<number, string>) {
  const { active, payload } = props as unknown as {
    active?: boolean;
    payload?: { payload: ChartData }[];
  };

  if (!active || !payload?.length) return null;

  const item = payload[0];
  if (!item) return null;

  const data = item.payload;

  return (
    <div className="bg-background border border-border rounded-lg p-2 shadow-md">
      <p className="text-sm font-medium">Score: {data.score}%</p>
      <p className="text-xs text-muted-foreground">{data.date}</p>
    </div>
  );
}

export default function PerformanceChart({ assessments }: { assessments: Assessment[] }) {

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Performance Trend
          </CardTitle>
          <CardDescription>Your quiz scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-75 text-muted-foreground text-sm">
            No assessments yet. Take a quiz to see your performance trend.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData: ChartData[] = assessments.map((assessment) => ({
    date: format(new Date(assessment.createdAt), "MMM dd, HH:mm"),
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
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}