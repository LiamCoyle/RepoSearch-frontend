"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { api, ApiError } from "@/lib/api";
import type { Commit } from "@/types/github";

interface TimelineData {
  date: string;
  commits: number;
  formattedDate: string;
}

interface CommitTimelineProps {
  owner: string;
  repo: string;
}

const chartConfig = {
  commits: {
    label: "Commits",
    theme: {
      light: "oklch(0.646 0.222 41.116)",
      dark: "oklch(0.488 0.243 264.376)",
    },
  },
};

export function CommitTimeline({ owner, repo }: CommitTimelineProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getRepositoryCommits(owner, repo, 100);
        setCommits(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load commits");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommits();
  }, [owner, repo]);

  const timelineData = useMemo<TimelineData[]>(() => {
    if (commits.length === 0) return [];

    const dateMap = new Map<string, number>();

    commits.forEach((commit) => {
      const date = new Date(commit.commit.committer.date);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .map(([date, commits]) => ({ 
        date, 
        commits,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [commits]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6"
    >
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Commit Timeline</CardTitle>
          <CardDescription>
            Distribution of commits over time (last 100 commits)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-muted-foreground text-center py-8">{error}</p>
          ) : timelineData.length === 0 ? (
            <p className="text-muted-foreground">No timeline data available</p>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                data={timelineData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  type="monotone"
                  dataKey="commits"
                  stroke="var(--color-commits)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-commits)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

