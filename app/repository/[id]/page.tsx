"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { api, ApiError } from "@/lib/api";
import type { RepositoryDetails, Commit, ContributorStats, Contributor } from "@/types/github";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

export default function RepositoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const repositoryId = params.id as string;
  const repoId = useMemo(() => {
    const id = parseInt(repositoryId, 10);
    return isNaN(id) ? null : id;
  }, [repositoryId]);

  const [repository, setRepository] = useState<RepositoryDetails | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  // Calculate commit counts from last 100 commits for each contributor (by ID)
  // Use the author field from commits
  const commitCountsFromLast100 = useMemo(() => {
    const counts = new Map<number, number>();
    
    commits.forEach((commit) => {
      // Use author field from commit
      const author = commit.author;
      
      // Only count if we have a valid author ID
      if (author?.id) {
        counts.set(author.id, (counts.get(author.id) || 0) + 1);
      }
    });
    
    return counts;
  }, [commits]);

  // Process contributors with impact from last 100 commits
  // Only include contributors who have commits in the last 100 commits
  const contributorStats = useMemo<ContributorStats[]>(() => {
    if (contributors.length === 0) return [];

    const totalCommits = commits.length || 1;

    return contributors
      .map((contributor) => {
        // Match by contributor ID
        const commitCount = commitCountsFromLast100.get(contributor.id) || 0;
        
        return {
          login: contributor.login,
          name: contributor.login, // Contributors API doesn't provide name
          avatar_url: contributor.avatar_url,
          html_url: contributor.html_url,
          commitCount,
          percentage: totalCommits > 0 ? (commitCount / totalCommits) * 100 : 0,
        };
      })
      .filter((contributor) => contributor.commitCount > 0) // Only show contributors with commits in last 100
      .sort((a, b) => b.percentage - a.percentage);
  }, [contributors, commitCountsFromLast100, commits.length]);

  // Process commits for timeline (group by date)
  const timelineData = useMemo(() => {
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

  const chartConfig = {
    commits: {
      label: "Commits",
      theme: {
        light: "oklch(0.646 0.222 41.116)",
        dark: "oklch(0.488 0.243 264.376)",
      },
    },
  };

  useEffect(() => {
    if (!repoId) {
      toast.error("Invalid repository ID");
      router.push("/");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const repoDetails = await api.getRepositoryById(repoId);
        const [owner, repo] = repoDetails.full_name.split("/");
        
        // Fetch commits
        const commitsData = await api.getRepositoryCommits(owner, repo, 100);
        setCommits(commitsData);

        // Fetch all contributors by paginating through pages
        const allContributors: Contributor[] = [];
        let page = 1;
        const perPage = 100;
        let hasMore = true;

        while (hasMore) {
          const contributorsPage = await api.getRepositoryContributors(owner, repo, perPage, page);
          
          if (contributorsPage.length === 0) {
            hasMore = false;
          } else {
            allContributors.push(...contributorsPage);
            
            // If we got less than perPage, we've reached the end
            if (contributorsPage.length < perPage) {
              hasMore = false;
            } else {
              page++;
              // Safety limit: stop after 10 pages (1000 contributors)
              if (page > 10) {
                hasMore = false;
              }
            }
          }
        }

        setRepository(repoDetails);
        setContributors(allContributors);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setIsNotFound(true);
          } else {
            toast.error(err.message);
            router.push("/");
          }
        } else {
          toast.error("Failed to load repository data");
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [repoId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading repository data...</p>
        </motion.div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Repository Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The repository you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!repository) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-4rem)] bg-zinc-50 font-sans dark:bg-black overflow-y-auto"
    >
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="outline">← Back to Search</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-2">
            {repository.full_name}
          </h1>
          {repository.description && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              {repository.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {repository.language && (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-primary"></span>
                {repository.language}
              </span>
            )}
            <span>⭐ {repository.stargazers_count.toLocaleString()}</span>
            <span>🍴 {repository.forks_count.toLocaleString()}</span>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on GitHub →
            </a>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6">
          <CardHeader>
            <CardTitle>Commit Timeline</CardTitle>
            <CardDescription>
              Distribution of commits over time (last 100 commits)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length === 0 ? (
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Contributors List */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Contributors ({contributors.length})</CardTitle>
                <CardDescription>
                  List of users who have contributed to this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {contributors.length === 0 ? (
                    <p className="text-muted-foreground">No contributors found</p>
                  ) : (
                    contributors.map((contributor) => (
                      <div
                        key={contributor.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                      >
                      {contributor.avatar_url && (
                        <Image
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                          unoptimized
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <a
                          href={contributor.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline block truncate"
                        >
                          {contributor.login}
                        </a>
                        <p className="text-sm text-muted-foreground truncate">
                          {contributor.contributions} {contributor.contributions === 1 ? 'contribution' : 'contributions'}
                        </p>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Impact Analysis */}
          <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
              <CardTitle>User Impact</CardTitle>
              <CardDescription>
                Contribution percentage based on last 100 commits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {contributorStats.length === 0 ? (
                  <p className="text-muted-foreground">No data available</p>
                ) : (
                  contributorStats.map((contributor) => (
                    <div key={contributor.login} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{contributor.login}</span>
                        <span className="text-muted-foreground">
                          {contributor.commitCount} commits
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${contributor.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

