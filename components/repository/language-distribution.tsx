"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import type { RepositoryLanguages } from "@/types/github";

interface LanguageData {
  name: string;
  value: number;
  percentage: string;
}

interface LanguageDistributionProps {
  owner: string;
  repo: string;
}

const LANGUAGE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--destructive)",
  "var(--primary)",
];

export function LanguageDistribution({ owner, repo }: LanguageDistributionProps) {
  const [languages, setLanguages] = useState<RepositoryLanguages>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getRepositoryLanguages(owner, repo);
        setLanguages(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load languages");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, [owner, repo]);

  const languageData = useMemo<LanguageData[]>(() => {
    if (Object.keys(languages).length === 0) return [];
    
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    
    return Object.entries(languages)
      .map(([language, bytes]) => ({
        name: language,
        value: bytes,
        percentage: ((bytes / totalBytes) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [languages]);

  if (isLoading) {
    return (
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="bg-background h-full">
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>
              Breakdown of programming languages used in this repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || languageData.length === 0) {
    return null;
  }

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
      <Card className="bg-background h-full">
        <CardHeader>
          <CardTitle>Language Distribution</CardTitle>
          <CardDescription>
            Breakdown of programming languages used in this repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Shared Progress Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden bg-secondary flex">
              {languageData.map((entry, index) => {
                const percentage = parseFloat(entry.percentage);
                
                return (
                  <div
                    key={entry.name}
                    className="h-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length],
                    }}
                    title={`${entry.name}: ${entry.percentage}%`}
                  />
                );
              })}
            </div>
            
            {/* Language List */}
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {languageData.map((entry, index) => {
                const bytes = entry.value;
                const mb = (bytes / (1024 * 1024)).toFixed(2);
                const kb = (bytes / 1024).toFixed(2);
                const size = bytes >= 1024 * 1024 ? `${mb} MB` : `${kb} KB`;
                
                return (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length] }}
                      />
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{size}</span>
                      <span className="font-semibold text-foreground">{entry.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

