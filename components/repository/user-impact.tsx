"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import type { ContributorStats, Commit } from "@/types/github";

interface UserImpactProps {
  owner: string;
  repo: string;
}

export function UserImpact({ owner, repo }: UserImpactProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const commitsData = await api.getRepositoryCommits(owner, repo, 100);
        setCommits(commitsData);
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

  const contributorStats = useMemo<ContributorStats[]>(() => {
    if (commits.length === 0) return [];

    // Count commits by author and store author info
    const authorCounts = new Map<string | number, { 
      count: number; 
      author: Commit['author'];
      commitAuthorEmail: string;
      commitAuthorName: string;
    }>();
    
    commits.forEach((commit) => {
      const author = commit.author;
      const commitAuthorEmail = commit.commit.author.email;
      const commitAuthorName = commit.commit.author.name;
      
      let key: string | number | null = null;
      
      if (author) {
        // Regular user - use ID or login as key
        key = author.id || author.login || null;
      } else {
        // Anonymous user - use email as key
        key = commitAuthorEmail;
      }
      
      if (key) {
        const existing = authorCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          authorCounts.set(key, { 
            count: 1, 
            author, 
            commitAuthorEmail, 
            commitAuthorName 
          });
        }
      }
    });

    const totalCommits = commits.length;

    // Convert to ContributorStats array using commit author data
    return Array.from(authorCounts.values())
      .map(({ count, author, commitAuthorEmail, commitAuthorName }) => {
        const isAnonymous = !author;
        
        return {
          login: isAnonymous 
            ? commitAuthorEmail 
            : (author?.login || ''),
          name: isAnonymous 
            ? commitAuthorName 
            : (author?.login || ''),
          avatar_url: author?.avatar_url || undefined,
          html_url: author?.html_url || undefined,
          commitCount: count,
          percentage: totalCommits > 0 ? (count / totalCommits) * 100 : 0,
          isAnonymous,
        };
      })
      .sort((a, b) => b.commitCount - a.commitCount);
  }, [commits]);
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
      <Card className="bg-background h-full">
        <CardHeader>
          <CardTitle>User Impact</CardTitle>
          <CardDescription>
            Contribution percentage based on last 100 commits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-muted-foreground text-center py-8">{error}</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {contributorStats.length === 0 ? (
                <p className="text-muted-foreground">No data available</p>
              ) : (
              contributorStats.map((contributor, index) => (
                <div key={contributor.isAnonymous ? `${contributor.login}-${index}` : contributor.login || `contributor-${index}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {contributor.avatar_url ? (
                        <Image
                          src={contributor.avatar_url}
                          alt={contributor.login || contributor.name || 'Anonymous'}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium truncate">
                        {contributor.isAnonymous ? contributor.name : (contributor.login || contributor.name || 'Unknown')}
                      </span>
                    </div>
                    <span className="text-muted-foreground flex-shrink-0">
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
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

